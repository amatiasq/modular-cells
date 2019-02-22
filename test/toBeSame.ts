export default function toBeSame<T extends IComparable<T>>(
  received: T,
  expected: T,
) {
  return {
    message: () => `Expected ${received} to match ${expected}`,
    pass: expected.is(received),
  };
}

expect.extend({ toBeSame });

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeSame<T extends IComparable<T>>(expected: T): R;
    }
  }
}

export interface IComparable<T> {
  is(target: T): boolean;
}
