import { accessor, onSet } from "../decorators";

import { ICircle } from "./circle";
import { IRectangle } from "./rectangle";
import { IVector } from "../vector";

export default class SquaredRectangle
  implements ISquaredCircle, ICircle, IRectangle, IVector {
  // #region Constructors
  static fromCenter(x: number, y: number, radius: number) {
    const area = new SquaredRectangle();
    area.x = x;
    area.y = y;
    area.radius = radius;
    return area;
  }

  private constructor() {}
  // #endregion

  // #region Properties
  @onSet(onHorizontalSizeChange) x: number;
  @onSet(onVerticalSizeChange) y: number;

  @onSet(onRadiusChange) radius: number;
  @onSet(onDiameterChange) diameter: number;

  @accessor("diameter") width: number;
  @accessor("diameter") height: number;
  @accessor("radius") halfWidth: number;
  @accessor("radius") halfHeight: number;

  // When this properties are changed the position changes
  @onSet(onVerticalPositionChange) top: number;
  @onSet(onHorizontalPositionChange) left: number;
  @onSet(onHorizontalPositionChange) right: number;
  @onSet(onVerticalPositionChange) bottom: number;
  // #endregion
}

interface ISquaredCircle extends ICircle, IRectangle {}

interface ISquaredCircleInternals {
  _x: number;
  _y: number;
  _radius: number;
  _diameter: number;
  _top: number;
  _left: number;
  _right: number;
  _bottom: number;
}

function onHorizontalSizeChange(area: ISquaredCircleInternals) {
  area._left = area._x - area._radius;
  area._right = area._x + area._radius;
}

function onVerticalSizeChange(area: ISquaredCircleInternals) {
  area._top = area._y - area._radius;
  area._bottom = area._y + area._radius;
}

function onRadiusChange(area: ISquaredCircleInternals) {
  onHorizontalSizeChange(area);
  onVerticalSizeChange(area);
}

function onDiameterChange(area: ISquaredCircleInternals) {
  area._radius = area._diameter / 2;
  onHorizontalSizeChange(area);
  onVerticalSizeChange(area);
}

function onVerticalPositionChange(
  area: ISquaredCircleInternals,
  prev: number,
  value: number
) {
  area._y += value - prev;
  onVerticalSizeChange(area);
}

function onHorizontalPositionChange(
  area: ISquaredCircleInternals,
  prev: number,
  value: number
) {
  area._x += value - prev;
  onHorizontalSizeChange(area);
}
