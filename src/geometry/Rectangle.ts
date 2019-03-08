import accessor from '../util/accessor';
import { IVector } from './Vector';
import { collides, contains, containsPoint } from './util';

export default class Rectangle implements IRectangle, IVector {
  static fromCenter(
    x: number,
    y: number,
    halfWidth: number,
    halfHeight: number,
  ) {
    const rect = new this();
    rect.x = x;
    rect.y = y;
    rect.halfWidth = halfWidth;
    rect.halfHeight = halfHeight;
    return rect;
  }

  static fromXY(x: number, y: number, width: number, height: number) {
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    return this.fromCenter(
      x + halfWidth,
      y + halfHeight,
      halfWidth,
      halfHeight,
    );
  }

  static fromCoords(top: number, left: number, right: number, bottom: number) {
    return this.fromXY(left, top, right - left, bottom - top);
  }

  constructor() {}

  is(target: IRectangle) {
    return (
      this.x === target.x &&
      this.y === target.y &&
      this.width === target.width &&
      this.height === target.height
    );
  }

  containsPoint(target: IVector): boolean {
    return containsPoint(this, target);
  }

  contains(target: IRectangle) {
    return contains(this, target);
  }

  collides(target: IRectangle) {
    return collides(this, target);
  }

  toString() {
    const { top, left, width, height } = this;
    return `Rectangle(t:${top},l:${left},w:${width},h:${height})`;
  }
}

export default interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
  halfWidth: number;
  halfHeight: number;

  // When this properties are changed the position changes
  top: number;
  left: number;
  right: number;
  bottom: number;
}

Object.defineProperties(Rectangle.prototype, {
  x: accessor('_x', onHorizontalChange),
  y: accessor('_y', onVerticalChange),

  width: accessor('_width', onWidthChange),
  height: accessor('_height', onHeightChange),
  halfWidth: accessor('_halfWidth', onHalfWidthChange),
  halfHeight: accessor('_halfHeight', onHalfHeightChange),

  // When this properties are changed the position changes
  top: accessor('_top', onTopChange),
  left: accessor('_left', onLeftChange),
  right: accessor('_right', onRightChange),
  bottom: accessor('_bottom', onBottomChange),
});

export interface IRectangle extends IVector {
  is(received: IRectangle): boolean;
  width: number;
  height: number;
  top: number;
  left: number;
  right: number;
  bottom: number;

  containsPoint(point: IVector): boolean;
  contains(target: IRectangle): boolean;
  collides(target: IRectangle): boolean;
}

interface IRectangleInternal {
  _x: number;
  _y: number;

  _width: number;
  _height: number;
  _halfWidth: number;
  _halfHeight: number;

  _top: number;
  _left: number;
  _right: number;
  _bottom: number;
}

function onHorizontalChange(rect: IRectangleInternal) {
  rect._left = rect._x - rect._halfWidth;
  rect._right = rect._x + rect._halfWidth;
}

function onVerticalChange(rect: IRectangleInternal) {
  rect._top = rect._y - rect._halfHeight;
  rect._bottom = rect._y + rect._halfHeight;
}

function onWidthChange(rect: IRectangleInternal) {
  rect._halfWidth = rect._width / 2;
  onHorizontalChange(rect);
}

function onHeightChange(rect: IRectangleInternal) {
  rect._halfHeight = rect._height / 2;
  onVerticalChange(rect);
}

function onHalfWidthChange(rect: IRectangleInternal) {
  rect._width = rect._halfWidth * 2;
  onHorizontalChange(rect);
}

function onHalfHeightChange(rect: IRectangleInternal) {
  rect._height = rect._halfHeight * 2;
  onVerticalChange(rect);
}

function onTopChange(rect: IRectangleInternal, value, prev) {
  rect._y -= value - prev;
  onVerticalChange(rect);
}

function onLeftChange(rect: IRectangleInternal, value, prev) {
  rect._x -= value - prev;
  onHorizontalChange(rect);
}

function onRightChange(rect: IRectangleInternal, value, prev) {
  rect._x -= value - prev;
  onHorizontalChange(rect);
}

function onBottomChange(rect: IRectangleInternal, value, prev) {
  rect._y -= value - prev;
  onVerticalChange(rect);
}
