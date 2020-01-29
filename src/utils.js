function iconBinding(value) {
  if (!value) return
  if (value instanceof Array || typeof value === 'string') return { icon: value }
  return value
}

function Capitalize(value) {
  return value.charAt(0).toUpperCase() + value.substring(1)
}

export { iconBinding, Capitalize }
