function iconBinding(value) {
  if (!value) return;
  if (value instanceof Array || typeof value === "string")
    return { icon: value };
  return value;
}

export { iconBinding };
