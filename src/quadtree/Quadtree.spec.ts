import '../../test/toBeSame';

import { Rectangle } from '../geometry/index';
import { IQuadEntity } from './IQuadEntity';
import { Quadtree } from './index';

describe('Quadtree data structure', () => {
  const QUADRANTS = ['nw', 'ne', 'sw', 'se'];
  const DEFAULT_MAX_ENTITIES = 2;
  const DEFAULT_MAX_DEPTH = 10;
  const DEFAULT_SCREEN_SIZE = 100;

  function createQuad({
    screenSize = DEFAULT_SCREEN_SIZE,
    maxEntities = DEFAULT_MAX_ENTITIES,
    maxDepth = DEFAULT_MAX_DEPTH,
  } = {}) {
    const bounds = Rectangle.fromCoords(0, 0, screenSize, screenSize);
    return new Quadtree(bounds, maxEntities, maxDepth);
  }

  function createEntity({ x = 5, y = 5, radius = 5 } = {}) {
    return Rectangle.fromCenter(x, y, radius, radius);
  }

  function createRectangle({ x = 0, y = 0, size = 5 }) {
    return Rectangle.fromXY(x, y, size, size);
  }

  function fillQuad(quad: Quadtree, maxEntities: number) {
    for (let i = 0; i < maxEntities; i++) {
      quad.add(createEntity());
    }
  }

  function getNodes(quad: Quadtree) {
    return (quad as any) as {
      nw: Quadtree;
      ne: Quadtree;
      sw: Quadtree;
      se: Quadtree;
    };
  }

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
      const maxEntities = 2;
      const sut = createQuad({ maxEntities });

      fillQuad(sut, maxEntities);
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

  describe('Quadtree#contains', () => {
    it('returns true if the passed argument is an entity registered in the quadtree', () => {
      const sut = createQuad();
      const entity = createEntity();

      sut.add(entity);
      expect(sut.includes(entity)).toBe(true);
    });
  });

  describe('split up calculation', () => {
    function getSplitted() {
      const maxEntities = 2;
      const sut = createQuad({
        screenSize: 10,
        maxEntities,
      });

      fillQuad(sut, maxEntities);
      sut.add(createEntity());

      expect(sut.isDivided).toBe(true);
      return getNodes(sut);
    }

    it('north west should be top left square', () => {
      const { nw } = getSplitted();
      expect(nw.bounds).toBeSame(createRectangle({ x: 0, y: 0, size: 5 }));
    });

    it('north east should be top right square', () => {
      const { ne } = getSplitted();
      expect(ne.bounds).toBeSame(createRectangle({ x: 5, y: 0, size: 5 }));
    });

    it('south west should be bottom left square', () => {
      const { sw } = getSplitted();
      expect(sw.bounds).toBeSame(createRectangle({ x: 0, y: 5, size: 5 }));
    });

    it('south east should be bottom right square', () => {
      const { se } = getSplitted();
      expect(se.bounds).toBeSame(createRectangle({ x: 5, y: 5, size: 5 }));
    });
  });

  describe('main behaviour', () => {
    function createAndAddToo(
      target: IQuadEntity,
      quadrantName: 'nw' | 'ne' | 'sw' | 'se',
      firstEntity = createEntity(),
      expected = true,
    ) {
      const sut = createQuad({ screenSize: 100, maxEntities: 1 });

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
          screenSize: 100,
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
});
