<template lang="html">
  <component :is="tag" :type="buttonType" class="elder-button" :class="classNames" @click="onClick($event)" :disabled="isDisabled" :style="{ pointerEvents: isBusy ? 'none' : undefined }">
    <div v-if="labelComp" class="elder-button__label">{{ labelComp }}</div>
    <div v-if="iconComp" class="elder-button__icon">
      <font-awesome-icon :icon="iconComp"/>
    </div>
  </component>
</template>

<script>
import "./icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

function clickAway(event) {
  if (!this.$el.contains(event.target)) this.onConfirmState = false;
}

let defaults = {
  loadingLabel: "Loading...",
  successLabel: "Completed",
  confirmLabel: "Are you sure?",
  errorLabel: "Something went wrong"
};

export default {
  props: {
    tag: {
      type: String,
      default: "button"
    },
    theme: {
      type: String,
      enum: ["default", "primary", "secondary", "warning", "error", "success"],
      default: "default"
    },
    label: String,
    loadingLabel: {
      type: String,
      default: defaults.loadingLabel
    },
    confirmLabel: {
      type: String,
      default: defaults.confirmLabel
    },
    successLabel: {
      type: String,
      default: defaults.successLabel
    },
    errorLabel: {
      type: String,
      default: defaults.errorLabel
    },
    icon: [String, Array],
    iconPlacement: {
      type: String,
      default: "right",
      enum: ["left", "right"]
    },
    disabled: Boolean,
    loading: Boolean,
    promise: Promise,
    stateTimeout: {
      type: Number,
      default: 1000
    },
    confirm: Boolean
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
      clickAway: null
    };
  },
  computed: {
    labelComp() {
      if (!this.onState) return this.label;
      if (this.isLoading) return this.loadingLabel;
      if (this.onSuccessState) return this.successLabel;
      if (this.onConfirmState) return this.confirmLabel;
      if (this.onErrorState) return this.errorLabel;
    },
    iconComp() {
      if (!this.onState) return this.icon;
      if (this.isLoading) return;
      if (this.onSuccessState) return ["fas", "check"];
      if (this.onConfirmState) return ["fas", "exclamation-triangle"];
      if (this.onErrorState) return ["fas", "times"];
    },
    isDisabled() {
      return this.disabled || this.isLoading;
    },
    isLoading() {
      return this.onLoadingState || this.loading;
    },
    buttonType() {
      if (this.confirm && !this.onConfirmState) return "button";
      return this.type;
    },
    onState() {
      return (
        this.onSuccessState ||
        this.onErrorState ||
        this.onConfirmState ||
        this.isLoading
      );
    },
    isBusy() {
      return this.onSuccessState || this.onErrorState || this.isLoading;
    },
    classNames() {
      return {
        "elder-button--primary": this.primary && !this.onState,
        "elder-button--secondary": this.secondary && !this.onState,
        "elder-button--warning": this.warning || this.onConfirmState,
        "elder-button--error":
          this.onErrorState || (this.error && !this.onState),
        "elder-button--success":
          this.onSuccessState || (this.success && !this.onState),
        "elder-button--loading": this.isLoading,
        "elder-button--icon-only": !this.label,
        "elder-button--icon": this.icon && this.label,
        "elder-button--icon-left": this.icon && this.iconPlacement === "left",
        "elder-button--icon-right": this.icon && this.iconPlacement === "right"
      };
    }
  },
  methods: {
    hookPromise(promise) {
      if (!promise) return;
      this.resetState();
      this.innerPromise = promise;

      this.loadingTreshhold = setTimeout(
        () => (this.onLoadingState = true),
        100
      );

      this.innerPromise
        .then(() => {
          this.resetState();
          if (this.stateTimeout) {
            this.onSuccessState = true;
            this.stateTimer = setTimeout(() => {
              this.onSuccessState = false;
              this.$emit("onSuccess");
            }, this.stateTimeout);
          } else this.$emit("onSuccess");
        })
        .catch(() => {
          this.resetState();
          this.onErrorState = true;
          if (this.stateTimeout) {
            this.stateTimer = setTimeout(() => {
              this.onErrorState = false;
              this.$emit("onError");
            }, this.stateTimeout);
          } else this.$emit("onError");
        });
    },
    resetState() {
      if (this.loadingTreshhold) clearTimeout(this.loadingTreshhold);
      if (this.stateTimer) clearTimeout(this.stateTimer);
      this.innerPromise = null;
      this.onLoadingState = false;
      this.onSuccessState = false;
      this.onErrorState = false;
      this.onConfirmState = false;
    },
    onClick(e) {
      if (this.confirm && !this.onConfirmState) {
        this.clickAway = clickAway.bind(this);
        window.addEventListener("click", this.clickAway);
        return (this.onConfirmState = true);
      }
      if (this.clickAway) {
        window.removeEventListener("click", this.clickAway);
        this.clickAway = null;
      }
      this.resetState();
      this.$emit("click", e);
    }
  },
  created() {
    this.$watch(
      function() {
        return this.promise;
      },
      function(newValue, oldValue) {
        if (newValue instanceof Promise) this.hookPromise(newValue);
      }
    );
  },
  components: {
    FontAwesomeIcon
  }
};
</script>

<style lang="scss">
@import "~node_modules/vue-elder-defaults/styles/variables";
@import "~node_modules/vue-elder-defaults/styles/utils";

$py: 0.75em;
$px: 1.5em;

.elder-button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  text-decoration: none;

  position: relative;
  cursor: pointer;

  font: inherit;
  border: 1px solid $border-color;
  outline: none;

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
        border-radius: $border-radius 0 0 $border-radius;
      }
    }
  }

  &--icon-only {
    height: 3em;
  }

  &--loading {
    cursor: wait;
    overflow: hidden;

    &:after {
      content: "";
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
    padding: $py $px $py $px;

    .elder-button--icon-right & {
      padding: $py $px/2 $py $px;
    }

    .elder-button--icon-left & {
      padding: $py $px $py $px/2;
    }
  }

  &__icon {
    border-radius: 0 $border-radius $border-radius 0;

    &:first-child:last-child {
      border-radius: $border-radius 0 0 $border-radius;
      padding: 0 $px;
    }

    .elder-button--icon-right & {
      padding: $py $px $py 0;
    }

    .elder-button--icon-left & {
      padding: $py 0 $py $px;
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


