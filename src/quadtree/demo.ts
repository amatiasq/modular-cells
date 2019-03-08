import { Canvas } from '../canvas/index';
import Vector from '../geometry/Vector';
import { Rectangle, random } from '../geometry/index';
import getParam from '../util/getParam';
import IQuadEntity from './IQuadEntity';
import QuadtreeCanvasRenderer from './QuadtreeCanvasRenderer';
import Quadtree from './quadtree';

const maxEntities = getParam('maxEntities', 3);
const maxDepth = getParam('maxDepth', 5);
const entitiesCount = getParam('entitiesCount', 100);
const entitySize = getParam('entitySize', 3);

class Entity extends Rectangle implements IQuadEntity {
  velocity = Vector.fromRandom(-10, 10);

  update() {
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}

const canvas = new Canvas('canvas', { fillScreen: true });
const { width, height } = canvas;
const bounds = Rectangle.fromXY(0, 0, width, height);
const quadtree = new Quadtree(bounds, maxEntities, maxDepth);
const renderer = new QuadtreeCanvasRenderer(quadtree, canvas.element);
const entities = new Set();

for (let i = 0; i < entitiesCount; i++) {
  const entity = Entity.fromXY(
    random(entitySize, width - entitySize),
    random(entitySize, height - entitySize),
    entitySize,
    entitySize,
  );

  quadtree.add(entity);
  entities.add(entity);
}

render();
requestAnimationFrame(update);

Object.assign(window, {
  quadtree,
  renderer,
  entities,
});

function update() {
  for (const entity of entities) {
    entity.update();
  }

  const excluded = quadtree.recalculate() as Entity[];

  for (const entry of excluded) {
    while (!quadtree.contains(entry)) {
      if (entry.left < 0 || entry.right > width) {
        entry.velocity = Vector.of(-entry.velocity.x, entry.velocity.y);
      }

      if (entry.top < 0 || entry.bottom > height) {
        entry.velocity = Vector.of(entry.velocity.x, -entry.velocity.y);
      }

      entry.update();
    }

    quadtree.add(entry);
  }

  render();
  requestAnimationFrame(update);
}

function render() {
  renderer.render();

  for (const entity of entities) {
    renderer.renderEntity(entity);
  }
}
