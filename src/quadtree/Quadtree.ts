import { Rectangle } from '../geometry/index';
import IQuadEntity from './IQuadEntity';

let count = 0;

export default class Quadtree {
  private entities: IQuadEntity[] = [];

  private _isDivided = false;
  get isDivided() {
    return this._isDivided;
  }

  get entitiesCount() {
    if (!this.isDivided) return this.entities.length;

    return (
      this.entities.length +
      this.nw.entitiesCount +
      this.ne.entitiesCount +
      this.sw.entitiesCount +
      this.se.entitiesCount
    );
  }

  protected nw: Quadtree;
  protected ne: Quadtree;
  protected sw: Quadtree;
  protected se: Quadtree;

  constructor(
    public readonly bounds: Rectangle,
    public readonly maxEntities: number,
    public readonly maxDepth: number,
    public readonly level: number = 0,
  ) {
    count++;
    console.log(`Quadtree instances: ${count}`);
  }

  add(entity: IQuadEntity) {
    if (!this.isDivided) {
      this.entities.push(entity);

      if (this.entities.length > this.maxEntities) {
        this.split();
      }

      return;
    }

    if (!this.addToQuadrant(entity)) this.entities.push(entity);
  }

  includes(entity: IQuadEntity): boolean {
    if (!this.isDivided) return this.entities.includes(entity);

    return (
      this.entities.includes(entity) ||
      this.nw.includes(entity) ||
      this.ne.includes(entity) ||
      this.sw.includes(entity) ||
      this.se.includes(entity)
    );
  }

  private createChild(x: number, y: number, width: number, height: number) {
    return new Quadtree(
      Rectangle.fromXY(x, y, width, height),
      this.maxEntities,
      this.maxDepth,
      this.level + 1,
    );
  }

  protected split() {
    if (this.isDivided) throw new Error('Already splitted');

    this._isDivided = true;
    this.splitArea();
    this.distribute();
  }

  private splitArea() {
    if (this.nw && this.ne && this.sw && this.se) return;

    const b = this.bounds;
    this.nw = this.createChild(b.left, b.top, b.halfWidth, b.halfHeight);
    this.ne = this.createChild(b.x, b.top, b.halfWidth, b.halfHeight);
    this.sw = this.createChild(b.left, b.y, b.halfWidth, b.halfHeight);
    this.se = this.createChild(b.x, b.y, b.halfWidth, b.halfHeight);
  }

  private distribute() {
    const entities = this.entities;
    this.entities = [];

    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];

      if (!this.addToQuadrant(entity)) this.entities.push(entity);
    }
  }

  protected addToQuadrant(entity: IQuadEntity): boolean {
    if (!this.contains(entity)) {
      debugger;
      throw new Error(
        `Can't get index. The entity ${entity} is not contained in ${
          this.bounds
        }`,
      );
    }

    if (this.nw.contains(entity)) {
      this.nw.add(entity);
      return true;
    }

    if (this.ne.contains(entity)) {
      this.ne.add(entity);
      return true;
    }

    if (this.sw.contains(entity)) {
      this.sw.add(entity);
      return true;
    }

    if (this.se.contains(entity)) {
      this.se.add(entity);
      return true;
    }

    return false;
  }

  contains(entity: IQuadEntity) {
    return this.bounds.contains(entity);
  }

  recalculate(): IQuadEntity[] {
    const toRecalculate = [];
    const excluded = [];

    if (this.isDivided) {
      toRecalculate.push(...this.nw.recalculate());
      toRecalculate.push(...this.ne.recalculate());
      toRecalculate.push(...this.sw.recalculate());
      toRecalculate.push(...this.se.recalculate());
    }

    toRecalculate.push(...this.entities);
    this.entities = [];

    for (let i = 0; i < toRecalculate.length; i++) {
      const entity = toRecalculate[i];
      if (this.bounds.contains(entity)) {
        this.add(entity);
      } else {
        excluded.push(entity);
      }
    }

    if (this.isDivided && this.entitiesCount <= this.maxEntities) {
      this.entities = [
        ...this.entities,
        ...this.nw.empty(),
        ...this.ne.empty(),
        ...this.sw.empty(),
        ...this.se.empty(),
      ];
      this._isDivided = false;
    }

    return excluded;
  }

  private empty() {
    if (this.entities.length === 0) {
      return this.entities;
    }

    const { entities } = this;
    this.entities = [];
    return entities;
  }

  private getName(quadrant: Quadtree) {
    if (quadrant === this.nw) return 'nw';
    if (quadrant === this.ne) return 'ne';
    if (quadrant === this.sw) return 'sw';
    if (quadrant === this.se) return 'se';
    return 'NOT A CHILDREN';
  }
}

export type QuadrantName = 'nw' | 'ne' | 'sw' | 'se';
