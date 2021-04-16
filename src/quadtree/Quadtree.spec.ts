import '../../test/toBeSame';

import { Rectangle } from '../geometry/index';
import IQuadEntity from './IQuadEntity';
import { Quadtree } from './index';
import { QuadrantName } from './quadtree';

const QUADRANTS = ['nw', 'ne', 'sw', 'se'];
const DEFAULT_MAX_ENTITIES = 2;
const DEFAULT_MAX_DEPTH = 10;
const DEFAULT_SCREEN_SIZE = 100;

function createQuad({
  size = DEFAULT_SCREEN_SIZE,
  maxEntities = DEFAULT_MAX_ENTITIES,
  maxDepth = DEFAULT_MAX_DEPTH,
} = {}) {
  const bounds = Rectangle.fromCoords(0, 0, size, size);
  return new Quadtree(bounds, maxEntities, maxDepth);
}

// TODO: Change x and y to 10
function createEntity({ x = 5, y = 5, radius = 5 } = {}) {
  return Rectangle.fromCenter(x, y, radius, radius);
}

function createRectangle({ x = 0, y = 0, size = 5 }) {
  return Rectangle.fromXY(x, y, size, size);
}

function createFilledQuad({
  size = undefined,
  maxEntities = DEFAULT_MAX_ENTITIES,
  maxDepth = undefined,
} = {}) {
  const quad = createQuad({ size, maxEntities, maxDepth });

  for (let i = 0; i < maxEntities; i++) {
    quad.add(createEntity({ x: 10, y: 10 }));
  }

  return quad;
}

describe('Quadtree public API', () => {
  it('should be instanciable', () => {
    createQuad();
  });

  describe('Quadtree#isDivided', () => {
    it('should return false for a quadtree without entities', () => {
      const sut = createQuad();
      expect(sut.isDivided).toBe(false);
    });

    it("should return false while the amount of entities don't exceed the maxEntities threshold", () => {
      const maxEntities = 2;
      const sut = createQuad({ maxEntities });

      for (let i = 0; i < maxEntities; i++) {
        sut.add(createEntity());
        expect(sut.isDivided).toBe(false);
      }
    });

    it('should return true when the amount of entities exceeds the maxEntities threshold', () => {
      const sut = createFilledQuad();
      expect(sut.isDivided).toBe(false);

      for (let i = 0; i < 1; i++) {
        sut.add(createEntity());
        expect(sut.isDivided).toBe(true);
      }
    });
  });

  describe('Quadtree#entitiesCount', () => {
    it('should return 0 in a quad without entities', () => {
      const sut = createQuad();
      expect(sut.entitiesCount).toBe(0);
    });

    it('should return 1 in a quad with a single entity', () => {
      const sut = createQuad();
      sut.add(createEntity());
      expect(sut.entitiesCount).toBe(1);
    });

    it('should return 3 in a quad with a three entities even if split threshold is lower', () => {
      const sut = createQuad({ maxEntities: 2 });
      sut.add(createEntity());
      sut.add(createEntity());
      sut.add(createEntity());
      expect(sut.entitiesCount).toBe(3);
    });
  });

  describe('Quadtree#includes', () => {
    it('returns true if the passed argument is an entity registered in the quadtree', () => {
      const sut = createQuad();
      const entity = createEntity();

      sut.add(entity);
      expect(sut.includes(entity)).toBe(true);
    });

    it('returns false if the passed argument is not an entity added to the quadtree', () => {
      const sut = createQuad();
      const entity = createEntity();

      expect(sut.includes(entity)).toBe(false);
    });

    it('returns true even after the quadtree has been divided', () => {
      const sut = createFilledQuad({ size: 50 });
      const entity = createEntity({ x: 10, y: 10 });

      sut.add(entity);
      expect(sut.includes(entity)).toBe(true);
    });
  });

  describe('Quadtree#recalculate', () => {
    it('should return all entities outside the quad', () => {
      var sut = createQuad({ size: 30 });
      var entity = createEntity({ x: 15, y: 15 });

      sut.add(entity);
      expect(sut.entitiesCount).toBe(1);

      entity.x = 100;
      expect(sut.recalculate()).toContain(entity);
      expect(sut.entitiesCount).toBe(0);
    });

    it('should remove the nodes if entities count becomes equal minimum', () => {
      var sut = createQuad({ maxEntities: 1, maxDepth: 1, size: 30 });
      var first = createEntity({ x: 15, y: 15 });
      var second = createEntity({ x: 15, y: 15 });

      sut.add(first);
      sut.add(second);
      expect(sut.isDivided).toBe(true);

      second.x = 100;
      sut.recalculate();
      expect(sut.isDivided).toBe(false);
    });

    it('should remove the nodes if entities count becomes equal minimum', () => {
      var sut = createQuad({ maxEntities: 2, maxDepth: 1, size: 30 });
      var first = createEntity({ x: 15, y: 15 });
      var second = createEntity({ x: 15, y: 15 });
      var third = createEntity({ x: 15, y: 15 });

      sut.add(first);
      sut.add(second);
      sut.add(third);
      expect(sut.isDivided).toBe(true);

      second.x = 100;
      third.x = 100;
      sut.recalculate();
      expect(sut.isDivided).toBe(false);
    });
  });
});

// Since this tool does optimization some behaviour is not visible from the public API
describe('Quadtree internals', () => {
  function getNodes(quad: Quadtree) {
    return (quad as any) as {
      nw: Quadtree;
      ne: Quadtree;
      sw: Quadtree;
      se: Quadtree;
    };
  }

  describe('split up calculation', () => {
    function getSplitted() {
      const sut = createFilledQuad({ size: 100 });
      sut.add(createEntity());

      expect(sut.isDivided).toBe(true);
      return getNodes(sut);
    }

    it('north west should be top left square', () => {
      const { nw } = getSplitted();
      expect(nw.bounds).toBeSame(createRectangle({ x: 0, y: 0, size: 50 }));
    });

    it('north east should be top right square', () => {
      const { ne } = getSplitted();
      expect(ne.bounds).toBeSame(createRectangle({ x: 50, y: 0, size: 50 }));
    });

    it('south west should be bottom left square', () => {
      const { sw } = getSplitted();
      expect(sw.bounds).toBeSame(createRectangle({ x: 0, y: 50, size: 50 }));
    });

    it('south east should be bottom right square', () => {
      const { se } = getSplitted();
      expect(se.bounds).toBeSame(createRectangle({ x: 50, y: 50, size: 50 }));
    });
  });

  describe('main behaviour', () => {
    function createAndAddToo(
      target: IQuadEntity,
      quadrantName: QuadrantName,
      firstEntity = createEntity(),
      expected = true,
    ) {
      const sut = createQuad({ size: 100, maxEntities: 1 });

      sut.add(firstEntity);
      sut.add(target);

      const quadrant = getNodes(sut)[quadrantName];
      expect(quadrant.includes(target)).toBe(expected);
    }

    describe('north west', () => {
      it('should contain any entity in the top left square', () => {
        createAndAddToo(
          createEntity({ x: 10, y: 10 }),
          'nw',
          createEntity({ x: 70, y: 70 }),
        );
      });

      it("should not contain entities outside it's area", () => {
        const out = { x: 70, y: 70 };
        createAndAddToo(createEntity(out), 'nw', createEntity(out), false);
      });
    });

    describe('north east', () => {
      it('should contain any entity in the top right square', () => {
        createAndAddToo(createEntity({ x: 90, y: 10 }), 'ne');
      });

      it("should not contain entities outside it's area", () => {
        createAndAddToo(createEntity(), 'ne', createEntity(), false);
      });
    });

    describe('south west', () => {
      it('should contain any entity in the top left square', () => {
        createAndAddToo(createEntity({ x: 10, y: 90 }), 'sw');
      });

      it("should not contain entities outside it's area", () => {
        createAndAddToo(createEntity(), 'sw', createEntity(), false);
      });
    });

    describe('south east', () => {
      it('should contain any entity in the top right square', () => {
        createAndAddToo(createEntity({ x: 90, y: 90 }), 'se');
      });

      it("should not contain entities outside it's area", () => {
        createAndAddToo(createEntity(), 'se', createEntity(), false);
      });
    });

    describe('"edge" cases (see what I did there?)', () => {
      function createQuadWithEdgeNodes() {
        const quad = createQuad({
          size: 100,
          maxEntities: 2,
        });

        quad.add(createEntity({ radius: 5, x: 50, y: 50 }));
        quad.add(createEntity({ radius: 5, x: 5, y: 50 }));
        quad.add(createEntity({ radius: 5, x: 50, y: 5 }));

        return quad;
      }

      it('all entities should be in the parent quad', () => {
        const sut = createQuadWithEdgeNodes();
        expect(sut.entitiesCount).toBe(3);
      });

      for (const quadrant of QUADRANTS) {
        it(`no entities should be at ${quadrant}`, () => {
          const sut = getNodes(createQuadWithEdgeNodes())[quadrant];
          expect(sut.entitiesCount).toBe(0);
        });
      }
    });
  });

  describe('Quadtree#recalculate', () => {
    function testNodesMovement(from, to = from, props = null) {
      it(`should update node moving from ${from} to ${to}`, () => {
        const sut = createQuad({ size: 100, maxEntities: 2 });
        const entities = {
          nw: createEntity({ x: 15, y: 15 }),
          ne: createEntity({ x: 85, y: 15 }),
          sw: createEntity({ x: 15, y: 85 }),
          se: createEntity({ x: 85, y: 85 }),
        };

        sut.add(entities.nw);
        sut.add(entities.ne);
        sut.add(entities.sw);
        sut.add(entities.se);

        const target = entities[from];
        let nodes = getNodes(sut);

        expect(nodes[from].contains(target));

        if (props) {
          Object.assign(target, props);
        }

        sut.recalculate();
        nodes = getNodes(sut);

        if (props) {
          expect(nodes[from].contains(target)).toBe(false);
          expect(nodes[to].contains(target)).toBe(true);
        } else {
          expect(nodes[from].contains(target)).toBe(true);
        }
      });
    }

    describe('keep entity cuadrant when entity still insdie', () => {
      testNodesMovement('nw');
      testNodesMovement('ne');
      testNodesMovement('sw');
      testNodesMovement('se');
    });

    describe('change the entity quadrant as the entity moves', () => {
      testNodesMovement('nw', 'ne', { x: 85 });
      testNodesMovement('nw', 'sw', { y: 85 });
      testNodesMovement('nw', 'se', { x: 85, y: 85 });
      testNodesMovement('ne', 'nw', { x: 15 });
      testNodesMovement('ne', 'se', { y: 85 });
      testNodesMovement('ne', 'sw', { x: 15, y: 85 });
      testNodesMovement('sw', 'se', { x: 85 });
      testNodesMovement('sw', 'nw', { y: 15 });
      testNodesMovement('sw', 'ne', { x: 85, y: 15 });
      testNodesMovement('se', 'sw', { x: 15 });
      testNodesMovement('se', 'ne', { y: 15 });
      testNodesMovement('se', 'nw', { x: 15, y: 15 });
    });
  });

  describe('Quadtree#add after divide', () => {
    function testAddAfterDivided(quadrant: QuadrantName, entity) {
      it(`should add entities when corresponding to the ${quadrant} quadrant`, () => {
        const sut = createFilledQuad({ size: 50 });

        sut.add(entity);
        const nodes = getNodes(sut);

        expect(nodes[quadrant].includes(entity)).toBe(true);
      });
    }

    testAddAfterDivided('nw', createEntity({ x: 15, y: 15 }));
    testAddAfterDivided('ne', createEntity({ x: 35, y: 15 }));
    testAddAfterDivided('sw', createEntity({ x: 15, y: 35 }));
    testAddAfterDivided('se', createEntity({ x: 35, y: 35 }));

    describe('add to the parent node if it touches the quadrant division', () => {
      function testQuadrantDivision(coords) {
        const sut = createFilledQuad({ size: 50 });
        const entity = createEntity(coords);

        sut.add(entity);

        const { nw, ne, sw, se } = getNodes(sut);
        expect(sut.includes(entity)).toBe(true);
        expect(nw.includes(entity)).toBe(false);
        expect(ne.includes(entity)).toBe(false);
        expect(sw.includes(entity)).toBe(false);
        expect(se.includes(entity)).toBe(false);
      }

      it('should work if entity is at center', () => {
        testQuadrantDivision({ x: 25, y: 25 });
      });

      it('should work if entity is at top border', () => {
        testQuadrantDivision({ x: 25, y: 15 });
      });

      it('should work if entity is at left border', () => {
        testQuadrantDivision({ x: 15, y: 25 });
      });

      it('should work if entity is at right border', () => {
        testQuadrantDivision({ x: 35, y: 25 });
      });

      it('should work if entity is at bottom border', () => {
        testQuadrantDivision({ x: 25, y: 35 });
      });
    });
  });

  describe('maxDepth option', () => {
    describe('should not divide deeper than the maxDepth option', () => {
      function createHugeFilledQuad({ maxDepth = 1 } = {}) {
        const maxEntities = 2;
        const sut = createFilledQuad({
          maxDepth,
          maxEntities,
          // huge so entities fall always in nw
          size: 1000000000,
        });

        sut.add(createEntity({ x: 10, y: 10 }));
        return sut;
      }

      it('when maxDepth is 0', () => {
        const sut = createHugeFilledQuad({ maxDepth: 0 });
        expect(sut.isDivided).toBe(false);
      });

      it('when maxDepth is 1', () => {
        const sut = createHugeFilledQuad({ maxDepth: 1 });
        expect(sut.isDivided).toBe(true);
        const first = getNodes(sut).nw;
        expect(first.isDivided).toBe(false);
      });

      it('when maxDepth is 2', () => {
        const sut = createHugeFilledQuad({ maxDepth: 2 });
        expect(sut.isDivided).toBe(true);
        const first = getNodes(sut).nw;
        expect(first.isDivided).toBe(true);
        const second = getNodes(first).nw;
        expect(second.isDivided).toBe(false);
      });
    });
  });

  describe('Quadtree#resize', () => {
    it('should update bounds', () => {
      // TODO:
    });
  });

  // TODO: TDD #retrieve
});
