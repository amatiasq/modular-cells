import { DEVELOPMENT_MODE } from './constants';
import Rectangle, { IRectangle } from './geometry/rectangle';

export default class Quadtree {
  private nodes: Quadtree[] = null;
  private entities: IQuadEntity[] = [];

  private get childObjects() {
    if (!this.hasNodes) return 0;

    return (
      this.nodes[0].objectCount +
      this.nodes[1].objectCount +
      this.nodes[2].objectCount +
      this.nodes[3].objectCount
    );
  }

  get objects() {
    if (!this.hasNodes) return this.entities;

    return [
      ...this.entities,
      ...this.nodes[0].objects,
      ...this.nodes[1].objects,
      ...this.nodes[2].objects,
      ...this.nodes[3].objects,
    ];
  }

  get objectCount() {
    const direct = this.entities.length;
    return this.hasNodes ? this.childObjects + direct : direct;
  }

  get hasNodes() {
    return this.nodes && this.nodes.length != 0;
  }

  constructor(
    public readonly bounds: Rectangle,
    public readonly maxEntities: number,
    public readonly maxDepth: number,
    public readonly level: number = 0,
  ) {}

  add(entity: IQuadEntity) {
    if (this.hasNodes) {
      const index = this.getIndex(entity);

      if (index !== null) {
        this.nodes[index].add(entity);
        return;
      }
    }

    this.entities.push(entity);

    if (!this.hasNodes && this.shouldSplit()) {
      this.split();
    }
  }

  getIndex(entity: IQuadEntity): number {
    if (DEVELOPMENT_MODE) {
      if (this.level !== 0 && !this.bounds.contains(entity)) {
        throw new Error(
          `Entity is not inside the Quadtree at level ${this.level}`,
        );
      }
    }

    return this.unsafeGetIndex(entity);
  }

  private unsafeGetIndex(area: IRectangle) {
    const { bounds } = this;

    if (area.bottom < bounds.y) {
      if (area.right < bounds.x) return 0;
      if (area.left > bounds.x) return 1;
    }

    if (area.top > bounds.y) {
      if (area.right < bounds.x) return 2;
      if (area.left > bounds.x) return 3;
    }

    return null;
  }

  split() {
    if (this.hasNodes) {
      throw new Error('Already splitted');
    }

    this.createNodes();
    this.distribute();
  }

  private createNodes() {
    const { bounds, maxEntities, maxDepth } = this;
    const level = this.level + 1;

    this.nodes = [
      new Quadtree(
        Rectangle.fromTopLeft(
          bounds.top,
          bounds.left,
          bounds.halfWidth,
          bounds.halfHeight,
        ),
        maxEntities,
        maxDepth,
        level,
      ),
      new Quadtree(
        Rectangle.fromTopLeft(
          bounds.top,
          bounds.x,
          bounds.halfWidth,
          bounds.halfHeight,
        ),
        maxEntities,
        maxDepth,
        level,
      ),
      new Quadtree(
        Rectangle.fromTopLeft(
          bounds.y,
          bounds.left,
          bounds.halfWidth,
          bounds.halfHeight,
        ),
        maxEntities,
        maxDepth,
        level,
      ),
      new Quadtree(
        Rectangle.fromTopLeft(
          bounds.y,
          bounds.x,
          bounds.halfWidth,
          bounds.halfHeight,
        ),
        maxEntities,
        maxDepth,
        level,
      ),
    ];
  }

  private distribute() {
    const { entities } = this;
    this.entities = [];

    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      const index = this.getIndex(entity);

      if (index !== null) this.nodes[index].add(entity);
      else this.entities.push(entity);
    }
  }

  retrieve(target: IRectangle) {
    if (!this.hasNodes) return this.entities;

    const index = this.unsafeGetIndex(target);

    if (index !== null) {
      // prettier-ignore
      return [
        ...this.entities,
        ...this.nodes[index].retrieve(target),
      ];
    }

    return [
      ...this.entities,
      ...this.nodes[0].retrieve(target),
      ...this.nodes[1].retrieve(target),
      ...this.nodes[2].retrieve(target),
      ...this.nodes[3].retrieve(target),
    ];
  }

  recalculate(): IQuadEntity[] {
    const { bounds, maxEntities } = this;
    const contained = [];
    const excluded = [];
    const promoted = [...this.entities];

    if (this.hasNodes) {
      promoted.push(
        ...this.nodes[0].recalculate(),
        ...this.nodes[1].recalculate(),
        ...this.nodes[2].recalculate(),
        ...this.nodes[3].recalculate(),
      );
    }

    for (let i = 0; i < promoted.length; i++) {
      const entity = promoted[i];
      if (bounds.contains(entity)) contained.push(entity);
      else excluded.push(entity);
    }

    // Empty entities array
    this.entities.length = 0;

    // Shortcut to not calculate `this.childObjects` unless it's necessary
    if (
      maxEntities >= contained.length &&
      maxEntities >= contained.length + this.childObjects
    ) {
      contained.push(...this.objects);
      this.entities = contained;
      this.nodes = null;
    } else {
      for (let i = 0; i < contained.length; i++) {
        this.add(contained[i]);
      }
    }

    return excluded;
  }

  forEachChild(
    iterator: (quad: Quadtree, index: number, parent: Quadtree) => void,
  ) {
    if (this.hasNodes)
      this.nodes.forEach((entry, index) => iterator(entry, index, this));
  }

  private shouldSplit() {
    return (
      this.entities.length > this.maxEntities && this.level < this.maxDepth
    );
  }
}

export interface IQuadEntity extends IRectangle {}
