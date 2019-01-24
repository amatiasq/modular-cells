const DEBUGGER = "debugger;";

export function proxy(
  code,
  { debug = false, log = false, logCall = log, logResult = log }
) {
  return (prototype, name) => {
    const prop = printProp(name, code);
    const fn = new Function(
      "...args",
      `
      ${debug ? DEBUGGER : ""}
      ${logCall ? `console.log('CALL', ${prop}, 'PARAMS', ...args);` : ""}
      with (this) const result = ${code}(...args);
      ${logResult ? `console.log('>>>>', ${prop}, result);` : ""}
      return result;
    `
    );

    Object.defineProperty(prototype, name, { value: fn });
  };
}

export function onSet<T>(callback: (instance: T, prev?, value?) => void) {
  return (prototype, name) => {
    const hidden = `_${name}`;

    Object.defineProperty(prototype, name, {
      get: new Function(`return this.${hidden}`) as any,
      set(value) {
        const prev = this[hidden];
        this[hidden] = value;
        callback(this, prev, value);

        // if (this.__onSet_pause) {
        //   this.__onSet_pause.push(callback);
        // } else {
        //   callback(this)
        // }
      }
    });
  };
}

// onSet.pause = instance => instance.__onSet_pause = [];
// onSet.resume = instance => {
//     const list = instance.__onSet_pause;
//     instance.__onSet_pause = null;

//     for (let i = 0; i < list.length; i++) {
//       list[i](instance);
//     }
//   }
// };

export function accessor(
  getter,
  setter = `${getter} = #`,
  {
    log = false,
    logGet = log,
    logSet = log,
    debug = false,
    debugGet = debug,
    debugSet = debug
  } = {}
) {
  return (prototype, name) => {
    const propGet = printProp(name, getter);
    const get: any = new Function(`
      ${debugGet ? DEBUGGER : ""}
      ${logGet ? `with (this) console.log('GET', ${propGet}, ${getter});` : ""}
      with(this) return ${getter}
    `);

    const propSet = printProp(name, getter);
    const setterCode = setter.replace(/#/, "value");
    const set: any = new Function(
      "value",
      `
      ${debugSet ? DEBUGGER : ""}
      ${
        logSet
          ? `with (this) console.log('SET', ${propSet}, value, 'PREV', ${setterCode})`
          : ""
      }
      with (this) ${setterCode}
    `
    );

    Object.defineProperty(prototype, name, { get, set });
  };
}

export function getter(
  code,
  { debug = false, debugGet = debug || false } = {}
) {
  const get: any = new Function(
    `${debugGet ? DEBUGGER : ""} with(this) return ${code}`
  );

  return (prototype, name) => {
    Object.defineProperty(prototype, name, { get });
  };
}

function printProp(name, code) {
  return `this + '.${name} => code'`;
}
