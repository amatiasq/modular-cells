export function _(Type, properties) {
  const instance = new Type();
  return properties
    ? Object.assign(instance, properties)
    : instance;
}

export function random(min?: number, max?: number) {
    if (arguments.length === 0) {
        return Math.random();
    } else if (arguments.length === 1) {
        max = min;
        min = 0;
    }

    return Math.round(Math.random() * (max - min)) + min;
}
