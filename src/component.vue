<template>
  <component
    :is="tag"
    v-bind="{
      ...$attrs,
      disabled,
      type,
      class: classNames,
    }"
  >
    <slot>
      <span v-if="labelComp || $scopedSlots.label" class="elder-button__label">
        <slot name="label">
          {{ labelComp }}
        </slot>
      </span>
      <span v-if="iconComp || $scopedSlots.icon" class="elder-button__icon">
        <slot name="icon" :icon="iconComp" :state="state">
          <Icon v-bind="iconComp" />
        </slot>
      </span>
    </slot>
  </component>
</template>

<script>
import { Options } from '../index'
import Icon from '@kvass/vue2-icon'
import { iconBinding, Capitalize, isPromise } from './utils'

const Listeners = {}

function clickAway(event) {
  if (!this.$el.contains(event.target)) this.resetState()
}

export default {
  props: {
    tag: {
      type: String,
      default: 'button',
    },
    theme: {
      type: String,
      enum: ['default', 'primary', 'secondary', 'warning', 'error', 'success'],
      default: 'default',
    },
    label: String,
    labels: {
      type: Object,
      default: () => ({}),
    },
    icons: {
      type: Object,
      default: () => ({}),
    },
    icon: [String, Array, Object],
    iconPlacement: {
      type: String,
      default: 'right',
      enum: ['left', 'right'],
    },
    loading: Boolean,
    loadingOnClick: [Boolean, Function],
    promise: Promise,
    stateTimeout: {
      type: Number,
      default: 1000,
    },
    confirm: Boolean,
  },
  data() {
    return {
      state: null,
      innerPromise: null,
      stateTimer: null,
      loadingTreshhold: null,
      clickAway: null,
      clickBinding: null,
    }
  },
  computed: {
    themeComp() {
      if (!this.onState) return this.theme
      if (this.state === 'confirm') return 'warning'
      return this.state || 'default'
    },
    labelComp() {
      if (!this.onState) return this.label
      if (this.isLoading) return this.$attrs['loading-label'] || this.labels.loading || Options.labels.loading
      return this.$attrs[this.state + '-label'] || this.labels[this.state] || Options.labels[this.state]
    },
    iconComp() {
      if (this.isLoading) return
      return iconBinding(this.onState ? this.icons[this.state] || Options.icons[this.state] : this.icon)
    },
    disabled() {
      return this.isLoading || this.$attrs.disabled
    },
    isLoading() {
      return this.state === 'loading' || this.loading
    },
    type() {
      if (this.confirm && this.state !== 'confirm') return 'button'
      return this.$attrs.type || Options.type
    },
    onState() {
      return this.state || this.isLoading
    },
    isBusy() {
      return ['success', 'error'].includes(this.state) || this.isLoading
    },
    classNames() {
      return [
        'elder-button',
        'elder-button--' + this.themeComp,
        {
          'elder-button--loading': this.isLoading,
          'elder-button--busy': this.isBusy,
          'elder-button--icon-only': this.iconComp && !this.label && !this.$scopedSlots.label,
          'elder-button--icon': (this.iconComp || this.$scopedSlots.icon) && this.label,
          'elder-button--icon-left': (this.iconComp || this.$scopedSlots.icon) && this.iconPlacement === 'left',
          'elder-button--icon-right':
            ((this.iconComp || this.$scopedSlots.icon) && this.iconPlacement === 'right') || this.state === 'confirm',
        },
      ]
    },
  },
  methods: {
    hookPromise(promise) {
      if (!promise) return
      this.resetState()
      this.innerPromise = promise

      this.loadingTreshhold = setTimeout(() => (this.state = 'loading'), 100)

      let initStateTimeout = (state) => {
        this.resetState()
        if (this.stateTimeout) {
          this.state = state
          this.stateTimer = setTimeout(() => {
            this.resetState()
            this.$emit('on' + Capitalize(state))
          }, this.stateTimeout)
        } else this.$emit('on' + Capitalize(state))
      }

      this.innerPromise.then(() => initStateTimeout('success')).catch(() => initStateTimeout('error'))
    },
    resetState() {
      if (this.loadingTreshhold) clearTimeout(this.loadingTreshhold)
      if (this.stateTimer) clearTimeout(this.stateTimer)
      this.innerPromise = null
      this.state = null
    },
    onClick(event) {
      if (this.confirm && this.state !== 'confirm') {
        this.clickAway = clickAway.bind(this)
        window.addEventListener('click', this.clickAway)
        return (this.state = 'confirm')
      }
      if (this.clickAway) {
        window.removeEventListener('click', this.clickAway)
        this.clickAway = null
      }
      this.resetState()
      this.$emit('click', event)

      let loadingOnClick = 'loadingOnClick' in this.$options.propsData ? this.loadingOnClick : Options.loadingOnClick
      if (loadingOnClick) {
        if (
          (typeof loadingOnClick === 'function' && loadingOnClick.apply(this)) ||
          (typeof loadingOnClick !== 'function' && loadingOnClick)
        ) {
          this.state = 'loading'
        }
      }
    },
  },
  created() {
    this.$watch(
      function () {
        return this.promise
      },
      function (value) {
        if (isPromise(value)) this.hookPromise(value)
      },
    )
    this.clickBinding = this.onClick.bind(this)
  },
  mounted() {
    this.$el.addEventListener('click', this.clickBinding)

    if (Object.keys(Options.listeners)) {
      Object.entries(Options.listeners).forEach(([event, callback]) => {
        Listeners[event] = callback.bind(this, this.$el)
        this.$el.addEventListener(event, Listeners[event])
      })
    }
  },
  beforeDestroy() {
    this.$el.removeEventListener('click', this.clickBinding)

    if (Object.keys(Listeners))
      Object.entries(Listeners).forEach(([event, callback]) => this.$el.removeEventListener(event, callback))
  },
  components: {
    Icon,
  },
}
</script>

<style lang="scss">
$states: ('default', 'primary', 'secondary', 'warning', 'success', 'error');

$variables: (
  'default': transparent,
  'default-contrast': currentColor,
  'default-border': rgba(0, 0, 0, 0.1),
  'primary': #3a9acd,
  'primary-border': var(--vue-elder-primary),
  'primary-contrast': white,
  'secondary': #ff773f,
  'secondary-border': var(--vue-elder-secondary),
  'secondary-contrast': white,
  'warning': #ff773f,
  'warning-border': var(--vue-elder-warning),
  'warning-contrast': white,
  'success': #33ca62,
  'success-border': var(--vue-elder-success),
  'success-contrast': white,
  'error': #e83b35,
  'error-border': var(--vue-elder-error),
  'error-contrast': white,
  'border-radius': 3px,
  'button-padding-y': 0.75em,
  'button-padding-x': 1.5em,
  'button-disabled': #ccc,
  'button-disabled-contrast': darken(#ccc, 35%),
);

@function GetVariable($key) {
  @return var(--vue-elder-#{$key}, map-get($variables, $key));
}

.elder-button {
  font: inherit;

  position: relative;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
  white-space: nowrap;
  text-decoration: none;

  border-width: 1px;
  border-style: solid;
  border-color: transparent;
  border-radius: GetVariable('border-radius');
  outline: none;

  &:disabled,
  &[disabled='disabled'] {
    pointer-events: none;

    color: GetVariable('button-disabled-contrast');
    border-color: GetVariable('button-disabled');
    background-color: GetVariable('button-disabled');
  }

  &:hover {
    &:before {
      opacity: 0.1;
    }
  }

  &:focus {
    &:before {
      opacity: 0.2;
    }
  }

  &:before {
    position: absolute;
    z-index: 0;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    content: '';
    transition: opacity 0.2s;

    opacity: 0;
    border-radius: inherit;
    background: black;
  }

  &--icon {
    z-index: 1;

    justify-content: space-between;

    &-left {
      flex-direction: row-reverse;

      .elder-button__icon {
        border-radius: GetVariable('border-radius') 0 0 GetVariable('border-radius');
      }
    }
  }

  &--busy {
    pointer-events: none !important;
  }

  &--loading {
    overflow: hidden;

    cursor: wait;

    &:after {
      position: absolute;
      bottom: 0;
      left: -20%;

      display: inline-block;

      width: 25%;
      height: 5px;

      content: '';
      animation: loader 1s infinite linear;

      border-radius: 5px;
      background: rgba(255, 255, 255, 0.5);

      @keyframes loader {
        to {
          transform: translateX(500%);
        }
      }
    }
  }

  &__label {
    z-index: 1;

    flex-grow: 1;

    padding: GetVariable('button-padding-y') GetVariable('button-padding-x');

    .elder-button--icon-right & {
      padding: GetVariable('button-padding-y') calc(#{GetVariable('button-padding-x')} / 2)
        GetVariable('button-padding-y') GetVariable('button-padding-x');
    }

    .elder-button--icon-left & {
      padding: GetVariable('button-padding-y') GetVariable('button-padding-x') GetVariable('button-padding-y')
        calc(#{GetVariable('button-padding-x')} / 2);
    }
  }

  &__icon {
    border-radius: 0 GetVariable('border-radius') GetVariable('border-radius') 0;

    &:first-child:last-child {
      padding: GetVariable('button-padding-y') GetVariable('button-padding-x');

      border-radius: GetVariable('border-radius') 0 0 GetVariable('border-radius');
    }

    .elder-button--icon-right & {
      padding: GetVariable('button-padding-y') GetVariable('button-padding-x') GetVariable('button-padding-y') 0;
    }

    .elder-button--icon-left & {
      padding: GetVariable('button-padding-y') 0 GetVariable('button-padding-y') GetVariable('button-padding-x');
    }
  }

  @each $state in $states {
    &--#{$state} {
      color: GetVariable('#{$state}-contrast');
      border-color: GetVariable('#{$state}-border');
      background-color: GetVariable('#{$state}');

      &--inverted {
        color: GetVariable('#{$state}');
        border-color: GetVariable('#{$state}');
        background-color: GetVariable('#{$state}-contrast');
      }
    }
  }
}
</style>
