export default function initializer<T>(sut: T, expectation: Partial<T>) {
  for (const [key, value] of Object.entries(expectation)) {
    it(`should set ${key} to ${value}`, () => {
      expect(sut[key]).toBe(value);
    });
  }
}
