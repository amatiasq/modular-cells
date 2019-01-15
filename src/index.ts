class Map {

}

class Cell implements ILocable {

}

interface ILocable {
  x: number;
  y: number;
}

class Vector implements ILocable {

  constructor(
    public readonly x: number,
    public readonly y: number,
  ) {}

}