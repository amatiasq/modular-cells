import initializer from '../../test/initializer';
import { testCollisions } from './Rectangle.spec';
import SquaredCircle from './SquaredCircle';

describe('SquaredCircle representation', () => {
  // Is private
  // it('should be instanciable', () => {
  //   new SquaredCircle();
  // });

  describe('SquaredCircle.fromCenter constructor', () => {
    initializer(SquaredCircle.fromCenter(0, 0, 5), {
      x: 0,
      y: 0,
      radius: 5,
      diameter: 10,
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

  testCollisions(() => SquaredCircle.fromCenter(0, 0, 5));
});
