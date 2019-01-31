import Rectangle, { IRectangle } from "./geometry/rectangle";
import { DEVELOPMENT_MODE } from "./constants";

export default class Quadtree {

  private nodes: Quadtree[] = [];
  private entities: IQuadEntity[] = [];

  get hasNodes() {
    return this.nodes.length != 0;
  }

  constructor(
    public readonly bounds: Rectangle,
    public readonly maxEntities: number,
    public readonly maxDepth: number,
    public readonly level: number,
  ) {}

  add(entity: IQuadEntity) {
    const { entities } = this;

    if (this.hasNodes) {
      const index = this.getIndex(entity);

      if (index !== -1) {
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

        if (index !== -1) {
          this.nodes[index].add(entity);
        } else {
          this.entities.push(entity);
        }
      }
    }
  }

  getIndex(entity: IQuadEntity): number {
    if (DEVELOPMENT_MODE) {
      if (!this.bounds.contains(entity)) {

      }
    }

    const { x, y } = this.bounds;
    const { top, left, right, bottom } = entity;

    if (left < x && right < x)
    {
      if (top < y && bottom < y)
        return 1;

      if (entity.top > y)
        return 2;
    }
    else if (entity.x > right)
    {
      //  entity can completely fit within the right quadrants
      if (entity.y < bottom && entity.bottom < bottom)
      {
          //  entity fits within the top-right quadrant of this quadtree
          index = 0;
      }
      else if (entity.y > bottom)
      {
          //  entity fits within the bottom-right quadrant of this quadtree
          index = 3;
      }
    }

    return index;
  }

  private insertInChildren(entity: IQuadEntity) {

  }

  private shouldSplit() {
    return this.entities.length <= this.maxEntities || this.level >= this.maxDepth;
  }

}

export interface IQuadEntity extends IRectangle {}
