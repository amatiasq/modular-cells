import initializer from '../../test/initializer';
import Rectangle, { IRectangle } from './Rectangle';
import Vector from './Vector';

describe('Rectangle representation', () => {
  // Is private
  // it('should be instanciable', () => {
  //   new Rectangle();
  // });

  describe('Rectangle.fromCenter constructor', () => {
    initializer(Rectangle.fromCenter(0, 0, 5, 5), {
      x: 0,
      y: 0,
      width: 10,
      height: 10,
      halfWidth: 5,
      halfHeight: 5,
      top: -5,
      left: -5,
      right: 5,
      bottom: 5,
    });
  });

  describe('Rectangle.fromCoords constructor', () => {
    initializer(Rectangle.fromCoords(0, 0, 10, 10), {
      x: 5,
      y: 5,
      width: 10,
      height: 10,
      halfWidth: 5,
      halfHeight: 5,
      top: 0,
      left: 0,
      right: 10,
      bottom: 10,
    });
  });

  describe('Rectangle.fromTopLeft constructor', () => {
    initializer(Rectangle.fromXY(0, 0, 10, 10), {
      x: 5,
      y: 5,
      width: 10,
      height: 10,
      halfWidth: 5,
      halfHeight: 5,
      top: 0,
      left: 0,
      right: 10,
      bottom: 10,
    });
  });

  testCollisions(() => Rectangle.fromCenter(0, 0, 5, 5));
});

export function testCollisions(create: () => IRectangle) {
  describe('Rectangle.containsPoint', () => {
    const sut = create();

    for (const point of [
      Vector.of(10, 0),
      Vector.of(0, 10),
      Vector.of(-10, 0),
      Vector.of(0, -10),
      Vector.of(-10, -10),
      Vector.of(-10, 10),
      Vector.of(10, -10),
      Vector.of(10, 10),
    ]) {
      it(`should return false if target is outside (${point})`, () => {
        expect(sut.containsPoint(point)).toBe(false);
      });
    }

    for (const point of [
      Vector.of(5, 0),
      Vector.of(0, 5),
      Vector.of(-5, 0),
      Vector.of(0, -5),
      Vector.of(-5, -5),
      Vector.of(-5, 5),
      Vector.of(5, -5),
      Vector.of(5, 5),
    ]) {
      it(`should return false if target is in the borders (${point})`, () => {
        expect(sut.containsPoint(point)).toBe(false);
      });
    }

    for (const point of [
      Vector.of(2, 0),
      Vector.of(0, 2),
      Vector.of(-2, 0),
      Vector.of(0, -2),
      Vector.of(-2, -2),
      Vector.of(-2, 2),
      Vector.of(2, -2),
      Vector.of(2, 2),
    ]) {
      it(`should return true if target is inside the borders (${point})`, () => {
        expect(sut.containsPoint(point)).toBe(true);
      });
    }

    it(`should return true if target is at the center`, () => {
      expect(sut.containsPoint(Vector.of(0, 0))).toBe(true);
    });
  });

  describe('Rectangle#contains method', () => {
    const sut = create();

    for (const rect of [
      Rectangle.fromCenter(10, 0, 2, 2),
      Rectangle.fromCenter(0, 10, 2, 2),
      Rectangle.fromCenter(-10, 0, 2, 2),
      Rectangle.fromCenter(0, -10, 2, 2),
      Rectangle.fromCenter(-10, -10, 2, 2),
      Rectangle.fromCenter(-10, 10, 2, 2),
      Rectangle.fromCenter(10, -10, 2, 2),
      Rectangle.fromCenter(10, 10, 2, 2),
    ]) {
      it(`should return false if target is outside (${rect})`, () => {
        expect(sut.contains(rect)).toBe(false);
      });
    }

    for (const rect of [
      Rectangle.fromCenter(7, 0, 2, 2),
      Rectangle.fromCenter(0, 7, 2, 2),
      Rectangle.fromCenter(-7, 0, 2, 2),
      Rectangle.fromCenter(0, -7, 2, 2),
      Rectangle.fromCenter(-7, -7, 2, 2),
      Rectangle.fromCenter(-7, 7, 2, 2),
      Rectangle.fromCenter(7, -7, 2, 2),
      Rectangle.fromCenter(7, 7, 2, 2),
    ]) {
      it(`should return false if target is touching the border from the outside (${rect})`, () => {
        expect(sut.contains(rect)).toBe(false);
      });
    }

    for (const rect of [
      Rectangle.fromCenter(5, 0, 2, 2),
      Rectangle.fromCenter(0, 5, 2, 2),
      Rectangle.fromCenter(-5, 0, 2, 2),
      Rectangle.fromCenter(0, -5, 2, 2),
      Rectangle.fromCenter(-5, -5, 2, 2),
      Rectangle.fromCenter(-5, 5, 2, 2),
      Rectangle.fromCenter(5, -5, 2, 2),
      Rectangle.fromCenter(5, 5, 2, 2),
    ]) {
      it(`should return false if target crosses borders (${rect})`, () => {
        expect(sut.contains(rect)).toBe(false);
      });
    }

    for (const rect of [
      Rectangle.fromCenter(3, 0, 2, 2),
      Rectangle.fromCenter(0, 3, 2, 2),
      Rectangle.fromCenter(-3, 0, 2, 2),
      Rectangle.fromCenter(0, -3, 2, 2),
      Rectangle.fromCenter(-3, -3, 2, 2),
      Rectangle.fromCenter(-3, 3, 2, 2),
      Rectangle.fromCenter(3, -3, 2, 2),
      Rectangle.fromCenter(3, 3, 2, 2),
    ]) {
      it(`should return true if target is touching the border from the inside (${rect})`, () => {
        expect(sut.contains(rect)).toBe(true);
      });
    }

    for (const rect of [
      Rectangle.fromCenter(2, 0, 2, 2),
      Rectangle.fromCenter(0, 2, 2, 2),
      Rectangle.fromCenter(-2, 0, 2, 2),
      Rectangle.fromCenter(0, -2, 2, 2),
      Rectangle.fromCenter(-2, -2, 2, 2),
      Rectangle.fromCenter(-2, 2, 2, 2),
      Rectangle.fromCenter(2, -2, 2, 2),
      Rectangle.fromCenter(2, 2, 2, 2),
    ]) {
      it(`should return true if target is inside the borders (${rect})`, () => {
        expect(sut.contains(rect)).toBe(true);
      });
    }

    it(`should return true if target is at the center inside the borders`, () => {
      expect(sut.contains(Rectangle.fromCenter(0, 0, 3, 3))).toBe(true);
    });

    it(`should return false if target is at center but bigger tan sut`, () => {
      expect(sut.contains(Rectangle.fromCenter(0, 0, 10, 10))).toBe(false);
    });
  });

  describe('Rectangle#collides method', () => {
    const sut = create();

    for (const rect of [
      Rectangle.fromCenter(10, 0, 2, 2),
      Rectangle.fromCenter(0, 10, 2, 2),
      Rectangle.fromCenter(-10, 0, 2, 2),
      Rectangle.fromCenter(0, -10, 2, 2),
      Rectangle.fromCenter(-10, -10, 2, 2),
      Rectangle.fromCenter(-10, 10, 2, 2),
      Rectangle.fromCenter(10, -10, 2, 2),
      Rectangle.fromCenter(10, 10, 2, 2),
    ]) {
      it(`should return false if target is outside (${rect})`, () => {
        expect(sut.collides(rect)).toBe(false);
      });
    }

    for (const rect of [
      Rectangle.fromCenter(7, 0, 2, 2),
      Rectangle.fromCenter(0, 7, 2, 2),
      Rectangle.fromCenter(-7, 0, 2, 2),
      Rectangle.fromCenter(0, -7, 2, 2),
      Rectangle.fromCenter(-7, -7, 2, 2),
      Rectangle.fromCenter(-7, 7, 2, 2),
      Rectangle.fromCenter(7, -7, 2, 2),
      Rectangle.fromCenter(7, 7, 2, 2),
    ]) {
      it(`should return false if target is touching the border from the outside (${rect})`, () => {
        expect(sut.collides(rect)).toBe(false);
      });
    }

    for (const rect of [
      Rectangle.fromCenter(5, 0, 2, 2),
      Rectangle.fromCenter(0, 5, 2, 2),
      Rectangle.fromCenter(-5, 0, 2, 2),
      Rectangle.fromCenter(0, -5, 2, 2),
      Rectangle.fromCenter(-5, -5, 2, 2),
      Rectangle.fromCenter(-5, 5, 2, 2),
      Rectangle.fromCenter(5, -5, 2, 2),
      Rectangle.fromCenter(5, 5, 2, 2),
    ]) {
      it(`should return true if target crosses borders (${rect})`, () => {
        expect(sut.collides(rect)).toBe(true);
      });
    }

    for (const rect of [
      Rectangle.fromCenter(3, 0, 2, 2),
      Rectangle.fromCenter(0, 3, 2, 2),
      Rectangle.fromCenter(-3, 0, 2, 2),
      Rectangle.fromCenter(0, -3, 2, 2),
      Rectangle.fromCenter(-3, -3, 2, 2),
      Rectangle.fromCenter(-3, 3, 2, 2),
      Rectangle.fromCenter(3, -3, 2, 2),
      Rectangle.fromCenter(3, 3, 2, 2),
    ]) {
      it(`should return true if target is touching the border from the inside (${rect})`, () => {
        expect(sut.collides(rect)).toBe(true);
      });
    }

    for (const rect of [
      Rectangle.fromCenter(2, 0, 2, 2),
      Rectangle.fromCenter(0, 2, 2, 2),
      Rectangle.fromCenter(-2, 0, 2, 2),
      Rectangle.fromCenter(0, -2, 2, 2),
      Rectangle.fromCenter(-2, -2, 2, 2),
      Rectangle.fromCenter(-2, 2, 2, 2),
      Rectangle.fromCenter(2, -2, 2, 2),
      Rectangle.fromCenter(2, 2, 2, 2),
    ]) {
      it(`should return true if target is inside the borders (${rect})`, () => {
        expect(sut.collides(rect)).toBe(true);
      });
    }

    it(`should return true if target is at the center inside the borders`, () => {
      expect(sut.collides(Rectangle.fromCenter(0, 0, 3, 3))).toBe(true);
    });

    it(`should return false if target is at center but bigger tan sut`, () => {
      expect(sut.collides(Rectangle.fromCenter(0, 0, 10, 10))).toBe(false);
    });
  });
}
