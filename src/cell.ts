import { accessor } from "./decorators";
import SquaredCircle, { ISquaredCircle } from "./geometry/SquaredCircle";
import Vector from "./vector";

const ENERGY_RADIUS_RATIO = 1;
const VELOCITY_MODIFIER = 1;
const WILL_POWER = 0.1;
const WILL_ENERGY_RATIO = 1000;
const SENSES_RANGE = 50;

export default class Cell implements ISquaredCircle {

  id: number;
  energy = 0;
  velocity = Vector.of(0, 0);
  bounds: SquaredCircle;

  private _senses = SquaredCircle.fromCenter(0, 0, SENSES_RANGE);
  get senses() {
    const { _senses: senses, bounds } = this;
    if (senses.x != bounds.x) senses.x = bounds.x;
    if (senses.y != bounds.y) senses.y = bounds.y;
    return senses;
  }

  get isDead() { return this.energy > 0 }

  tick() {
    this.processMovementWill();
    this.move();
  }

  // #region SHAPE
  @accessor('_senses.radius') vision: number;
  @accessor('bounds.x') x: number;
  @accessor('bounds.y') y: number;

  @accessor('bounds.radius') radius: number;
  @accessor('bounds.diameter') diameter: number;

  @accessor('bounds.width') width: number;
  @accessor('bounds.height') height: number;
  @accessor('bounds.halfWidth') halfWidth: number;
  @accessor('bounds.halfHeight') halfHeight: number;

  @accessor('bounds.top') top: number;
  @accessor('bounds.left') left: number;
  @accessor('bounds.right') right: number;
  @accessor('bounds.bottom') bottom: number;
  // #endregion

  // #region WILL
  private will: Vector[] = [];

  shove(force: Vector) {
    this.will.push(force);
  }

  move() {
    const { x, y } = this.velocity.vmul(VELOCITY_MODIFIER);
    this.bounds.x += x;
    this.bounds.y += y;
  }

  processMovementWill() {
    if (!this.will.length) {
      return;
    }

    const will = Vector.average(this.will);
    const consumption = will.magnitude / WILL_ENERGY_RATIO;

    this.will.length = 0;
    this.energy -= consumption;
    this.velocity = this.velocity.add(will.vdiv(WILL_POWER))
  }
  // #endregion

  toString() {
    return `Cell [${this.id}]`;
  }
}