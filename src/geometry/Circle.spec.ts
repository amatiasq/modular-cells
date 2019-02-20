import initializer from '../../test/initializer';
import Circle from './Circle';

describe('Circle representation', () => {
  it('should be instanciable', () => {
    new Circle();
  });

  describe('Circle.fromDiameter constructor', () => {
    initializer(Circle.fromDiameter(0, 0, 10), {
      x: 0,
      y: 0,
      radius: 5,
      diameter: 10,
    });
  });

  describe('Circle.fromRadius constructor', () => {
    initializer(Circle.fromRadius(0, 0, 5), {
      x: 0,
      y: 0,
      radius: 5,
      diameter: 10,
    });
  });
});
