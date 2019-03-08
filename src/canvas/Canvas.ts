export default class Canvas {
  public readonly element: HTMLCanvasElement;
  public readonly context: CanvasRenderingContext2D;

  get width() {
    return this.element.width;
  }
  set width(value: number) {
    this.element.width = value;
  }

  get height() {
    return this.element.height;
  }
  set height(value: number) {
    this.element.height = value;
  }

  constructor(public readonly selector: string, { fillScreen = true } = {}) {
    this.element = document.querySelector(selector);
    this.context = this.element.getContext('2d');
    this.fillScreenSize = this.fillScreenSize.bind(this);

    if (fillScreen) {
      this.fillScreen();
    }
  }

  fillScreen({ watchResize = true } = {}) {
    this.fillScreenSize();

    if (watchResize) {
      window.addEventListener('resize', this.fillScreenSize);
    }
  }

  private fillScreenSize() {
    console.log('resize');

    if (this.element.width !== window.innerWidth) {
      console.log('width');
      this.element.width = window.innerWidth;
    }

    if (this.element.height !== window.innerHeight) {
      console.log('height');
      this.element.height = window.innerHeight;
    }
  }
}
