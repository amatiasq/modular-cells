import { onSet } from '../decorators';
import { IVector } from '../vector';

export default class Rectangle implements IRectangle, IVector {
  // #region Constructors
  static fromCenter(x: number, y: number, width: number, height: number) {
    const rect = new Rectangle();
    rect.x = x;
    rect.y = y;
    rect.width = width;
    rect.height = height;
    return rect;
  }

  static fromTopLeft(top: number, left: number, width: number, height: number) {
    return this.fromCenter(left + width / 2, top + height / 2, width, height);
  }

  static fromCoords(top: number, left: number, right: number, bottom: number) {
    return this.fromTopLeft(top, left, right - left, bottom - top);
  }

  private constructor() {}
  // #endregion

  // #region Properties
  @onSet(onHorizontalChange) x: number;
  @onSet(onVerticalChange) y: number;

  @onSet(onWidthChange) width: number;
  @onSet(onHeightChange) height: number;
  @onSet(onHalfWidthChange) halfWidth: number;
  @onSet(onHalfHeightChange) halfHeight: number;

  // When this properties are changed the position changes
  @onSet(onTopChange) top: number;
  @onSet(onLeftChange) left: number;
  @onSet(onRightChange) right: number;
  @onSet(onBottomChange) bottom: number;
  // #endregion

  // #region Geometry detection
  containsPoint({ x, y }: IVector): boolean {
    return y > this.top && y < this.bottom && x > this.left && x > this.right;
  }

  contains({ top, left, right, bottom }: IRectangle) {
    return (
      top > this.top &&
      bottom < this.bottom &&
      left > this.left &&
      right < this.right
    );
  }

  collides({ top, left, right, bottom }: IRectangle) {
    const isBottomInside = this.bottom > bottom && bottom > this.top;
    const isTopInside = this.bottom > top && top > this.top;
    const isRightInside = this.right > right && right > this.left;
    const isLeftInside = this.right > left && left > this.left;
    return (isBottomInside || isTopInside) && (isRightInside || isLeftInside);
  }
  // #endregion
}

export interface IRectangle extends IVector {
  width: number;
  height: number;
  top: number;
  left: number;
  right: number;
  bottom: number;
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
  rect._y += value - prev;
  onVerticalChange(rect);
}

function onLeftChange(rect: IRectangleInternal, value, prev) {
  rect._x += value - prev;
  onHorizontalChange(rect);
}

function onRightChange(rect: IRectangleInternal, value, prev) {
  rect._x += value - prev;
  onHorizontalChange(rect);
}

function onBottomChange(rect: IRectangleInternal, value, prev) {
  rect._y += value - prev;
  onVerticalChange(rect);
}
