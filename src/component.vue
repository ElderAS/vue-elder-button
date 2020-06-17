<template lang="html">
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
      <span v-if="labelComp" class="elder-button__label">
        {{ labelComp }}
      </span>
      <span v-if="iconComp" class="elder-button__icon">
        <font-awesome-icon v-bind="iconComp" />
      </span>
    </slot>
  </component>
</template>

<script>
import { Options } from '../index'
import { iconBinding, Capitalize, isPromise } from './utils'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import './icons'

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
          'elder-button--icon-only': this.iconComp && !this.label,
          'elder-button--icon': this.iconComp && this.label,
          'elder-button--icon-left': this.iconComp && this.iconPlacement === 'left',
          'elder-button--icon-right': (this.iconComp && this.iconPlacement === 'right') || this.state === 'confirm',
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
  },
  beforeDestroy() {
    this.$el.removeEventListener('click', this.clickBinding)
  },
  components: {
    FontAwesomeIcon,
  },
}
</script>

<style lang="scss">
@import './main';

:root {
  @include GenerateVariables();

  @include GenerateVariable('button-padding-y', 0.75em);
  @include GenerateVariable('button-padding-x', 1.5em);
  @include GenerateVariable('button-disabled', #ccc);
  @include GenerateVariable('button-disabled-contrast', darken(#ccc, 35%));
}

.elder-button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  text-decoration: none;

  position: relative;
  cursor: pointer;

  font: inherit;
  border: 1px solid;
  outline: none;

  border-radius: GetVariable('border-radius');

  white-space: nowrap;

  transition: color 0.2s ease-out, background-color 0.2s ease-out;

  &:disabled {
    background-color: GetVariable('button-disabled') !important;
    color: GetVariable('button-disabled-contrast');
    pointer-events: none;
  }

  &:hover {
    background-color: rgba(black, 0.2);
  }

  &:focus {
    background-color: rgba(black, 0.1);
  }

  &--icon {
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
    cursor: wait;
    overflow: hidden;

    &:after {
      content: '';
      display: inline-block;
      width: 25%;
      height: 5px;
      position: absolute;
      border-radius: 5px;
      left: -20%;
      bottom: 0;
      background: rgba(255, 255, 255, 0.5);

      animation: loader 1s infinite linear;

      @keyframes loader {
        to {
          transform: translateX(500%);
        }
      }
    }
  }

  &__label {
    padding: GetVariable('button-padding-y') GetVariable('button-padding-x');
    flex-grow: 1;

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
      border-radius: GetVariable('border-radius') 0 0 GetVariable('border-radius');
      padding: GetVariable('button-padding-y') GetVariable('button-padding-x');
    }

    .elder-button--icon-right & {
      padding: GetVariable('button-padding-y') GetVariable('button-padding-x') GetVariable('button-padding-y') 0;
    }

    .elder-button--icon-left & {
      padding: GetVariable('button-padding-y') 0 GetVariable('button-padding-y') GetVariable('button-padding-x');
    }
  }

  @each $state in $states {
    &--#{nth($state,1)} {
      $name: nth($state, 1);

      background-color: GetVariable('#{$name}');
      color: GetVariable('#{$name}-contrast');

      border-color: GetVariable('#{$name}-border');

      &:hover {
        background-color: GetVariable('#{$name}-hover');
      }

      &:focus {
        background-color: GetVariable('#{$name}-focus');
      }

      &:active {
        background-color: GetVariable('#{$name}-active');
      }

      &--inverted {
        background-color: GetVariable('#{$name}-contrast');
        color: GetVariable('#{$name}');
        border-color: GetVariable('#{$name}');

        &:hover {
          color: GetVariable('#{$name}-hover');
          border-color: GetVariable('#{$name}-hover');
        }
      }
    }
  }
}
</style>
