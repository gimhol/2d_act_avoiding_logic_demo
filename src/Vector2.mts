export interface IVector2Like {
  x: number;
  y: number;
}

export class Vector2 implements IVector2Like {
  x: number;
  y: number;
  static dist(v1: Readonly<IVector2Like>, v2?: Readonly<IVector2Like>) {
    let { x, y } = v1;
    if (v2) {
      x -= v2.x;
      y -= v2.y;
    }
    return Math.sqrt(x * x + y * y)
  }
  static sub(p: Readonly<IVector2Like>, ...v: Readonly<IVector2Like>[]): Vector2 {
    return new Vector2(
      v.reduce((r, i) => r - i.x, p.x),
      v.reduce((r, i) => r - i.y, p.y),
    );
  }
  static add(...v: Readonly<IVector2Like>[]): Vector2 {
    return new Vector2(
      v.reduce((r, i) => r + i.x, 0),
      v.reduce((r, i) => r + i.y, 0),
    );
  }
  static intersect(
    p1: IVector2Like, p2: IVector2Like,
    p3: IVector2Like, p4: IVector2Like
  ): Vector2 | null {
    const x1 = p1.x, y1 = p1.y;
    const x2 = p2.x, y2 = p2.y;
    const x3 = p3.x, y3 = p3.y;
    const x4 = p4.x, y4 = p4.y;

    const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (Math.abs(denominator) < 0.00001) {
      return null;
    }
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denominator;

    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      const ix = x1 + t * (x2 - x1);
      const iy = y1 + t * (y2 - y1);
      return new Vector2(ix, iy);
    }
    return null;
  }
  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }
  add(v: Readonly<IVector2Like>): this {
    this.x += v.x;
    this.y += v.y;
    return this;
  }
  sub(v: Readonly<IVector2Like>): Vector2 {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }
  mult(n: number): this {
    this.x *= n;
    this.y *= n;
    return this;
  }
  div(n: number): this {
    this.x /= n;
    this.y /= n;
    return this;
  }
  copy(v: Readonly<IVector2Like>): this {
    this.x = v.x;
    this.y = v.y;
    return this;
  }

  set(x: number, y: number): Vector2 {
    this.x = x;
    this.y = y;
    return this;
  }
  dot(v: Readonly<IVector2Like>): number {
    return this.x * v.x + this.y * v.y;
  }
  clone(): Vector2 { return new Vector2(this.x, this.y); }
  mag(): number { return Math.hypot(this.x, this.y) }
  normalize(): this {
    const m = this.mag();
    if (!m) {
      this.x = 0;
      this.y = 0;
    } else {
      this.x /= m
      this.y /= m
    }
    return this
  }
  reflect(n: Readonly<IVector2Like>): this {
    const dotProduct = this.dot(n);
    this.x -= n.x * 2 * dotProduct
    this.y -= n.y * 2 * dotProduct
    return this;
  }

}