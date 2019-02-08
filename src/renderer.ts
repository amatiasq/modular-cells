import Cell from './cell';
import { RENDER_CELL_SENSES } from './constants';
import { accessor } from './decorators';
import Quadtree from './quadtree';

const TAU = Math.PI * 2;

export default class CanvasRenderer {
  private context: CanvasRenderingContext2D;
  @accessor('canvas.width') width: number;
  @accessor('canvas.height') height: number;

  constructor(private canvas: HTMLCanvasElement) {
    this.context = canvas.getContext('2d');
  }

  clear() {
    const {
      context,
      canvas: { width, height },
    } = this;

    context.save();
    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);
    context.restore();
  }

  quad(quad: Quadtree) {
    if (!quad.hasNodes) return;

    const { context } = this;
    const { bounds } = quad;

    context.save();
    context.strokeStyle = 'gray';
    context.moveTo(bounds.left, bounds.y);
    context.lineTo(bounds.right, bounds.y);
    context.moveTo(bounds.x, bounds.top);
    context.lineTo(bounds.x, bounds.bottom);
    context.stroke();

    context.font = '20px Arial';
    context.textAlign = 'center';
    context.fillStyle = 'yellow';
    context.fillText(quad.objectCount, bounds.x, bounds.y + 5);

    quad.forEachChild(x => this.quad(x));
    context.restore();
  }

  cell(cell: Cell) {
    const { context } = this;
    const radius = cell.radius | 0;
    const padding = radius * 0.5;

    context.save();
    context.translate(cell.x, cell.y);
    context.rotate(cell.velocity.radians);
    context.fillStyle = 'white';

    context.beginPath();
    context.arc(0, 0, radius, 0, TAU);
    context.fill();
    context.moveTo(padding, radius);
    context.lineTo(radius * 1.5 + padding, 0);
    context.lineTo(padding, -radius);
    context.closePath();
    context.fill();

    if (RENDER_CELL_SENSES) {
      this.cellSenses(cell);
    }

    context.restore();
  }

  private cellSenses(cell: Cell) {
    const { context } = this;

    context.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    context.beginPath();
    context.arc(0, 0, cell.vision, 0, TAU);
    context.closePath();
    context.stroke();
  }
}
