import { IRectangle } from './Rectangle';
import { IVector } from './Vector';

export function containsPoint(self: IRectangle, { x, y }: IVector): boolean {
  return y > self.top && y < self.bottom && x > self.left && x < self.right;
}

export function contains(
  self: IRectangle,
  { top, left, right, bottom }: IRectangle,
): boolean {
  return (
    top >= self.top &&
    bottom <= self.bottom &&
    left >= self.left &&
    right <= self.right
  );
}

export function collides(
  self: IRectangle,
  { top, left, right, bottom }: IRectangle,
): boolean {
  const isBottomInside = self.bottom > bottom && bottom > self.top;
  const isTopInside = self.bottom > top && top > self.top;
  const isRightInside = self.right > right && right > self.left;
  const isLeftInside = self.right > left && left > self.left;
  return (isBottomInside || isTopInside) && (isRightInside || isLeftInside);
}

export function random(): number;
export function random(max: number): number;
export function random(min: number, max: number): number;
export function random(minOrMax?: number, max?: number): number {
  let min;

  if (minOrMax == null) {
    min = 0;
    max = 1;
  } else if (max == null) {
    min = 0;
    max = minOrMax;
  } else {
    min = minOrMax;
  }

  return Math.random() * (max - min) + min;
}
