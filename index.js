import ButtonComponent from './src/component.vue'

const install = Vue => {
  Vue.component('button-component', ButtonComponent)
}

export default {
  install,
}

export { ButtonComponent, install as ButtonComponentInstaller }
