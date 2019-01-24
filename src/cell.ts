import Vector from "./vector";
import { accessor } from "./decorators";

const ENERGY_RADIUS_RATIO = 1;
const VELOCITY_MODIFIER = 1;
const WILL_POWER = 0.1;
const WILL_ENERGY_RATIO = 1000;

export default class Cell {

  get bounds() {

  }

  energy = 0;
  velocity = Vector.of(0, 0);
  get isDead() { return this.energy > 0 }

  tick() {
    this.processMovementWill();
    this.move();
  }

  // #region SHAPE
  pos = Vector.of(0, 0);
  @accessor(`energy * ${ENERGY_RADIUS_RATIO}`, `energy = # / ${ENERGY_RADIUS_RATIO}`) radius: number;
  @accessor('radius') size: number;
  @accessor('pos.x - radius', 'pos = pos.setX(# + radius)') x: number;
  @accessor('pos.y - radius', 'pos = pos.setY(# + radius)') y: number;
  @accessor('radius * 2', 'radius = # / 2') width: number;
  @accessor('radius * 2', 'radius = # / 2') height: number;
  @accessor('pos.x + radius', 'pos.x = # - radius') endX: number;
  @accessor('pos.y + radius', 'pos.y = # - radius') endY: number;
  // #endregion

  // #region WILL
  private will: Vector[] = [];

  shove(force: Vector) {
    this.will.push(force);
  }

  move() {
    this.pos = this.pos.add(this.velocity.vdiv(VELOCITY_MODIFIER));
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

}