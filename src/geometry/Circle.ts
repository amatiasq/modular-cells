import accessor from '../util/accessor';
import { IVector } from './Vector';

export default class Circle implements ICircle, IVector {
  static fromRadius(x: number, y: number, radius: number) {
    const circle = new Circle();
    circle.x = x;
    circle.y = y;
    circle.radius = radius;
    return circle;
  }

  static fromDiameter(x: number, y: number, diameter: number) {
    return this.fromRadius(x, y, diameter / 2);
  }

  private constructor() {}

  x: number;
  y: number;
}

export default interface Circle {
  radius: number;
  diameter: number;
}

Object.defineProperties(Circle.prototype, {
  radius: accessor('_radius', onRadiusChange),
  diameter: accessor('_diameter', onDiameterChange),
});

export interface ICircle extends IVector {
  radius: number;
  diameter: number;
}

interface ICircleInternals {
  _radius: number;
  _diameter: number;
}

function onRadiusChange(circle: ICircleInternals) {
  circle._diameter = circle._radius * 2;
}

function onDiameterChange(circle: ICircleInternals) {
  circle._radius = circle._diameter / 2;
}
