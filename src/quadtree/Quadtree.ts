import { Rectangle } from '../geometry/index';
import { IQuadEntity } from './IQuadEntity';

export default class Quadtree {
  private readonly entities = new Set<IQuadEntity>();

  private _isDivided = false;
  get isDivided() {
    return this._isDivided;
  }

  get entitiesCount() {
    if (!this.isDivided) return this.entities.size;

    return (
      this.entities.size +
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
  ) {}

  add(entity: IQuadEntity) {
    this.entities.add(entity);

    if (!this.isDivided && this.entities.size > this.maxEntities) {
      this.split();
    }
  }

  includes(entity: IQuadEntity): boolean {
    return this.entities.has(entity);
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
    const b = this.bounds;
    this.nw = this.createChild(b.left, b.top, b.halfWidth, b.halfHeight);
    this.ne = this.createChild(b.x, b.top, b.halfWidth, b.halfHeight);
    this.sw = this.createChild(b.left, b.y, b.halfWidth, b.halfHeight);
    this.se = this.createChild(b.x, b.y, b.halfWidth, b.halfHeight);
  }

  private distribute() {
    const entities = [...this.entities];
    this.entities.clear();

    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      const quadrant = this.getQuadrant(entity);

      if (quadrant) quadrant.add(entity);
      else this.entities.add(entity);
    }
  }

  protected getQuadrant(entity: IQuadEntity): Quadtree {
    if (!this.contains(entity)) {
      throw new Error(
        `Can't get index. The entity ${entity} is not contained in ${
          this.bounds
        }`,
      );
    }

    const { x, y } = this.bounds;
    if (entity.bottom < y && entity.right < x) return this.nw;
    if (entity.bottom < y && entity.left > x) return this.ne;
    if (entity.top > y && entity.right < x) return this.sw;
    if (entity.top > y && entity.left > x) return this.se;
    return null;
  }

  contains(entity: IQuadEntity) {
    return this.bounds.contains(entity);
  }

  recalculate(): IQuadEntity[] {
    const excluded = [];

    if (this.isDivided) {
      excluded.push(...this.nw.recalculate());
      excluded.push(...this.ne.recalculate());
      excluded.push(...this.sw.recalculate());
      excluded.push(...this.se.recalculate());
    }

    for (let i = excluded.length - 1; i >= 0; i--) {
      const entity = excluded[i];
      if (this.bounds.contains(entity)) {
        this.add(entity);
        excluded.splice(i, 1);
      }
    }

    return excluded;
  }

  private getName(quadrant: Quadtree) {
    if (quadrant === this.nw) return 'nw';
    if (quadrant === this.ne) return 'ne';
    if (quadrant === this.sw) return 'sw';
    if (quadrant === this.se) return 'se';
    return 'NOT A CHILDREN';
  }
}
