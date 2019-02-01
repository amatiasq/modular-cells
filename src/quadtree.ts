import { DEVELOPMENT_MODE } from "./constants";
import Rectangle, { IRectangle } from "./geometry/rectangle";

export default class Quadtree {
  private nodes: Quadtree[] = null;
  private entities: IQuadEntity[] = [];

  private get childObjects() {
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
    public readonly level: number = 0
  ) {}

  add(entity: IQuadEntity) {
    const { entities } = this;

    if (this.hasNodes) {
      const index = this.getIndex(entity);

      if (index !== null) {
        this.nodes[index].add(entity);
        return;
      }
    }

    entities.push(entity);

    if (this.shouldSplit()) {
      if (!this.hasNodes) {
        this.split();
      }

      this.entities = [];

      for (let i = 0; i < entities.length; i++) {
        const entity = entities[i];
        const index = this.getIndex(entity);
  
        if (index !== null)
          this.nodes[index].add(entity);
        else
          this.entities.push(entity);
      }
    }
  }

  getIndex(entity: IQuadEntity): number {
    const { bounds } = this;

    if (DEVELOPMENT_MODE) {
      if (!bounds.contains(entity)) {
        throw new Error("Entity is not inside the Quadtree");
      }
    }

    if (entity.bottom < bounds.y) {
      if (entity.right < bounds.x) return 0;
      if (entity.left > bounds.x) return 1;
    }

    if (entity.top > bounds.y) {
      if (entity.right < bounds.x) return 2;
      if (entity.left > bounds.x) return 3;
    }

    return null;
  }

  split() {
    const { bounds, maxEntities, maxDepth } = this;
    const level = this.level + 1;

    this.nodes = [
      new Quadtree(
        Rectangle.fromTopLeft(
          bounds.top,
          bounds.left,
          bounds.halfWidth,
          bounds.halfHeight
        ),
        maxEntities,
        maxDepth,
        level
      ),
      new Quadtree(
        Rectangle.fromTopLeft(
          bounds.top,
          bounds.x,
          bounds.halfWidth,
          bounds.halfHeight
        ),
        maxEntities,
        maxDepth,
        level
      ),
      new Quadtree(
        Rectangle.fromTopLeft(
          bounds.y,
          bounds.left,
          bounds.halfWidth,
          bounds.halfHeight
        ),
        maxEntities,
        maxDepth,
        level
      ),
      new Quadtree(
        Rectangle.fromTopLeft(
          bounds.y,
          bounds.x,
          bounds.halfWidth,
          bounds.halfHeight
        ),
        maxEntities,
        maxDepth,
        level
      )
    ];
  }

  retrieve(target: IQuadEntity) {
    if (!this.hasNodes) return this.entities;

    const index = this.getIndex(target);

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
      ...this.nodes[3].retrieve(target)
    ];
  }

  recalculate(): IQuadEntity[] {
    const { bounds, entities } = this;
    let excluded = [];

    if (this.hasNodes) {
      const promoted = [
        ...this.nodes[0].recalculate(),
        ...this.nodes[1].recalculate(),
        ...this.nodes[2].recalculate(),
        ...this.nodes[3].recalculate(),
      ];

      for (let i = 0; i < promoted.length; i++) {
        const entity = promoted[i];

        if (bounds.contains(entity))
          this.add(entity);
        else
          excluded.push(entity);
      }

      if (this.childObjects === 0) {
        this.nodes = null;
      }
    }

    this.entities = [];

    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];

      if (bounds.contains(entity))
        this.add(entity);
      else
        excluded.push(entity);
    }

    return excluded;
  }

  private shouldSplit() {
    return (
      this.entities.length >= this.maxEntities ||
      this.level >= this.maxDepth
    );
  }
}

export interface IQuadEntity extends IRectangle {}
