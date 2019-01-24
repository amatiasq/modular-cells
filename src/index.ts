import { _, random } from "./util";

import Cell from "./cell";
import Vector from "./vector";

const cells: Cell[] = [];
const width = window.innerWidth;
const height = window.innerHeight;
const speed = 2;
const canvas = document.querySelector('canvas');
canvas.width = width;
canvas.height = height;

for (let i = 0; i < 100; i++)
  cells.push(_(Cell, {
    x: random(width),
    y: random(height),
    radius: 5,
    velocity: Vector.of(random(-speed, speed), random(-speed, speed)),
  }));

requestAnimationFrame(tick);

function tick() {
  requestAnimationFrame(tick);

  const context = canvas.getContext('2d');

  context.clearRect(0, 0, canvas.width, canvas.height);

  for (const cell of cells) {
    cell.tick();
    render(context, cell);
  }
}

function render(context, cell: Cell) {
  const TAU = Math.PI * 2;
  const radius = cell.radius | 0;
  const padding = radius * 0.5;

  context.save();
  context.translate(cell.x, cell.y);
  context.rotate(cell.velocity.radians);
  context.fillStyle = 'black';

  context.beginPath();
  context.arc(0, 0, radius, 0, TAU);
  context.fill();
  context.moveTo(padding, radius);
  context.lineTo(radius * 1.5 + padding, 0);
  context.lineTo(padding, -radius);
  context.closePath();
  context.fill();

  context.restore();
}


// as a user I want to see something

// as a user I want to push cells
// as a developer I want to push cells

// as a cell I have a will to express will, this pushes my body
// as a cell movement consumes energy
// as a cell moving in one direction will remain going in that direction
// as a cell I want to know when I collide with somebody

// as a developer I want to add plugins to my cells



// class Map {

// }

// class Cell implements ILocable, ICircle, IRectangle {
//   pos = Vector.of(0, 0);
//   radius = 0;

//   get box(): Rectangle {
//     const { pos, radius } = this;

//     return new Rectangle(
//       pos.x - radius,
//       pos.y - radius,
//       pos.x + radius,
//       pos.y + radius,
//     );
//   }

//   get x() { return this.area.x }
//   get y() { return this.area.y }
// }

// interface ILocable {
//   x: number;
//   y: number;
// }


// interface ICircle {
//   pos: Vector;
//   radius: number;
// }

// interface IRectangle {
//   pos: Vector;
//   size: Vector;
// }

/*
class Circle implements ILocable {
  radius = 0;
  pos = Vector.of(0, 0);

  getRectangle() {
    const { radius } = this;
    const diameter = radius * 2;

    return Object.assign(new Rectangle, {
      pos: this.pos.vsub(this.radius),
      size: Vector.of(diameter, diameter),
    });
  }
}

class Rectangle implements ILocable {
  pos = Vector.of(0, 0);
  size = Vector.of(0, 0);

  get x() { return this.pos.x }
  set x(value: number) { this.pos = this.pos.setX(value) }
  get y() { return this.pos.y }
  set y(value: number) { this.pos = this.pos.setY(value) }

  get width() { return this.size.x }
  set width(value: number) { this.size = this.size.setX(value) }
  get height() { return this.size.y }
  set height(value: number) { this.size = this.size.setY(value) }

  get endX() { return this.pos.x + this.size.x }
  get endY() { return this.pos.y + this.size.y }
}


^*/