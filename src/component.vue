<template lang="html">
  <button :type="buttonType" class="elder-button" :class="classNames" @click="onClick($event)" :disabled="isDisabled" :style="{ pointerEvents: isBusy ? 'none' : undefined }">
    <template v-if="!onState">
      <div v-if="label">{{ label }}</div>
      <div class="elder-button__icon" v-if="icon && label">
        <font-awesome-icon :icon="icon" />
      </div>
      <font-awesome-icon :icon="icon" v-if="icon && !label"/>
    </template>
    <template v-if="isLoading">{{ loadingLabel }}</template>
    <template v-if="onSuccessState">
      <div>{{ successLabel }}</div>
      <div class="elder-button__icon">
        <font-awesome-icon :icon="['fas', 'check']" />
      </div>
    </template>
    <template v-if="onConfirmState">
      <div>{{ confirmLabel }}</div>
      <div class="elder-button__icon">
        <font-awesome-icon :icon="['fas', 'exclamation-triangle']" />
      </div>
    </template>
    <template v-if="onErrorState">
      <div>{{ errorLabel }}</div>
      <div class="elder-button__icon">
        <font-awesome-icon :icon="['fas', 'times']" />
      </div>
    </template>
  </button>
</template>

<script>
import './icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

function clickAway(event) {
  if (!this.$el.contains(event.target)) this.onConfirmState = false
}

export default {
  props: {
    primary: Boolean,
    secondary: Boolean,
    error: Boolean,
    warning: Boolean,
    success: Boolean,
    type: {
      type: String,
      default: 'submit',
    },
    label: {
      type: String,
      default: 'Button',
    },
    loadingLabel: {
      type: String,
      default: 'Lagrer...',
    },
    confirmLabel: {
      type: String,
      default: 'Er du sikker?',
    },
    successLabel: {
      type: String,
      default: 'Fullført',
    },
    errorLabel: {
      type: String,
      default: 'Noe gikk galt',
    },
    icon: [String, Array],
    iconPlacement: {
      type: String,
      default: 'right',
      enum: ['left', 'right'],
    },
    disabled: Boolean,
    loading: Boolean,
    promise: Promise,
    stateTimeout: {
      type: Number,
      default: 1000,
    },
    confirm: Boolean,
  },
  data() {
    return {
      onSuccessState: false,
      onErrorState: false,
      onLoadingState: false,
      innerPromise: null,
      stateTimer: null,
      loadingTreshhold: null,
      onConfirmState: false,
      clickAway: null,
    }
  },
  computed: {
    isDisabled() {
      return this.disabled || this.isLoading
    },
    isLoading() {
      return this.onLoadingState || this.loading
    },
    buttonType() {
      if (this.confirm && !this.onConfirmState) return 'button'
      return this.type
    },
    onState() {
      return this.onSuccessState || this.onErrorState || this.onConfirmState || this.isLoading
    },
    isBusy() {
      return this.onSuccessState || this.onErrorState || this.isLoading
    },
    classNames() {
      return {
        'elder-button--primary': this.primary && !this.onState,
        'elder-button--secondary': this.secondary && !this.onState,
        'elder-button--warning': this.warning || this.onConfirmState,
        'elder-button--error': this.onErrorState || (this.error && !this.onState),
        'elder-button--success': this.onSuccessState || (this.success && !this.onState),
        'elder-button--loading': this.isLoading,
        'elder-button--icon-only': !this.label,
        'elder-button--icon': this.icon && this.label,
        'elder-button--icon-left': this.iconPlacement === 'left',
        'elder-button--icon-right': this.iconPlacement === 'right',
      }
    },
  },
  methods: {
    hookPromise(promise) {
      if (!promise) return
      this.resetState()
      this.innerPromise = promise

      this.loadingTreshhold = setTimeout(() => (this.onLoadingState = true), 100)

      this.innerPromise
        .then(() => {
          this.resetState()
          if (this.stateTimeout) {
            this.onSuccessState = true
            this.stateTimer = setTimeout(() => {
              this.onSuccessState = false
              this.$emit('onSuccess')
            }, this.stateTimeout)
          } else this.$emit('onSuccess')
        })
        .catch(() => {
          this.resetState()
          this.onErrorState = true
          if (this.stateTimeout) {
            this.stateTimer = setTimeout(() => {
              this.onErrorState = false
              this.$emit('onError')
            }, this.stateTimeout)
          } else this.$emit('onError')
        })
    },
    resetState() {
      if (this.loadingTreshhold) clearTimeout(this.loadingTreshhold)
      if (this.stateTimer) clearTimeout(this.stateTimer)
      this.innerPromise = null
      this.onLoadingState = false
      this.onSuccessState = false
      this.onErrorState = false
      this.onConfirmState = false
    },
    onClick(e) {
      if (this.confirm && !this.onConfirmState) {
        this.clickAway = clickAway.bind(this)
        window.addEventListener('click', this.clickAway)
        return (this.onConfirmState = true)
      }
      if (this.clickAway) {
        window.removeEventListener('click', this.clickAway)
        this.clickAway = null
      }
      this.resetState()
      this.$emit('click', e)
    },
  },
  created() {
    this.$watch(
      function() {
        return this.promise
      },
      function(newValue, oldValue) {
        if (newValue instanceof Promise) this.hookPromise(newValue)
      },
    )
  },
  components: {
    FontAwesomeIcon,
  },
}
</script>

<style lang="scss">
@import '~node_modules/vue-elder-defaults/styles/variables';
@import '~node_modules/vue-elder-defaults/styles/utils';

.elder-button {
  display: inline-flex;
  justify-content: center;
  align-items: center;

  position: relative;
  cursor: pointer;

  font: inherit;
  border: 1px solid #ccc;
  outline: none;

  padding: 1em 2em;
  border-radius: $border-radius;

  white-space: nowrap;

  transition: color 0.2s ease-out, background-color 0.2s ease-out;

  &:disabled {
    background-color: #ccc !important;
    color: darken(#ccc, 35%);
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
        margin: -1em 2em -1em -2em;
        border-radius: $border-radius 0 0 $border-radius;
      }
    }
  }

  &--icon-only {
    padding: 0;
    width: 2em;
    height: 2em;
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

  &__icon {
    margin: -1em -2em -1em 2em;
    padding: 1em 1.25em;
    background-color: rgba(black, 0.1);
    border-radius: 0 $border-radius $border-radius 0;

    &:first-child:last-child {
      margin: -1em 2em -1em -2em;
      border-radius: $border-radius 0 0 $border-radius;
    }
  }

  @each $state in $states {
    &--#{nth($state,1)} {
      $state-adjust: -15deg;

      background-color: nth($state, 2);
      color: nth($state, 3);

      border-color: transparent !important;

      &:hover {
        $hover-color: adjust-hue(nth($state, 2), $state-adjust);
        background-color: $hover-color;
        color: guess-color($hover-color);
      }

      &:focus {
        $focus-color: adjust-hue(nth($state, 2), $state-adjust - 7deg);
        background-color: $focus-color;
        color: guess-color($focus-color);
      }

      &:active {
        $active-color: adjust-hue(nth($state, 2), $state-adjust - 5deg);
        background-color: $active-color;
        color: guess-color($active-color);
      }

      &--inverted {
        background-color: nth($state, 3);
        color: nth($state, 2);
        border-color: nth($state, 2);

        &:hover {
          color: darken(nth($state, 2), 20%);
        }
      }
    }
  }
}
</style>


