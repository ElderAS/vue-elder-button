import ButtonComponent from "./src/component.vue";

const install = Vue => {
  Vue.component("button-component", ButtonComponent);
};

const Options = {
  icons: {
    success: "check",
    confirm: "exclamation-triangle",
    error: "times"
  },
  labels: {
    loading: "Loading...",
    success: "Completed",
    confirm: "Are you sure?",
    error: "Something went wrong"
  }
};

const setup = options => {
  for (let key in options) {
    if (!(key in Options)) return;
    Options[key] = options[key];
  }
};

export default {
  install
};

export { ButtonComponent, install as ButtonComponentInstaller, setup, Options };
