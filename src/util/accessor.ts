export default function accessor(accessor: string, handler: Function = null) {
  const get = new Function(`return this.${accessor}`);
  let set = new Function('value', `this.${accessor} = value`);

  if (handler) {
    set = eval(`(function smartSetter(value) {
      const prev = this.${accessor};
      this.${accessor} = value;
      handler(this, prev, value);
    })`);
  }

  return ({ get, set } as any) as PropertyDescriptor;
}
