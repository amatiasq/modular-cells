import IQuadEntity from './IQuadEntity';
import Quadtree from './quadtree';

export default class QuadtreeCanvasRenderer {
  private readonly context: CanvasRenderingContext2D;

  constructor(private readonly quadtree: Quadtree, canvas: HTMLCanvasElement) {
    this.context = canvas.getContext('2d');
  }

  render() {
    this.clear();
    this.renderQuadrants();
  }

  clear() {
    const {
      context,
      quadtree: {
        bounds: { top, left, width, height },
      },
    } = this;

    context.save();
    context.fillStyle = 'black';
    context.clearRect(left, top, width, height);
    context.fillRect(left, top, width, height);
    context.restore();
  }

  renderQuadrants() {
    this.renderQuadrantsRecursive(this.quadtree);
  }

  private renderQuadrantsRecursive(quad: Quadtree) {
    if (!quad.isDivided) return;

    const { nw, ne, sw, se } = (quad as any) as DividedQuadtree;
    this.renderQuadrantsRecursive(nw);
    this.renderQuadrantsRecursive(ne);
    this.renderQuadrantsRecursive(sw);
    this.renderQuadrantsRecursive(se);

    const { context } = this;
    const { x, y, top, left, right, bottom } = quad.bounds;

    context.save();
    context.beginPath();
    context.strokeStyle = 'gray';
    context.moveTo(x, top);
    context.lineTo(x, bottom);
    context.moveTo(left, y);
    context.lineTo(right, y);
    context.closePath();
    context.stroke();
    context.restore();
  }

  renderEntity(entity: IQuadEntity) {
    if (!this.quadtree.includes(entity)) {
      throw new Error('Rendering entity not in the tree');
    }

    const { context } = this;
    const { x, y, width, height } = entity;

    context.save();
    context.fillStyle = 'white';
    context.fillRect(x, y, width, height);
    context.restore();
  }
}

interface DividedQuadtree {
  nw: Quadtree;
  ne: Quadtree;
  sw: Quadtree;
  se: Quadtree;
}
