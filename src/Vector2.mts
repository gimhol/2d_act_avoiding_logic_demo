export interface IVector2Like {
  x: number;
  y: number;
}
export class Vector2 implements IVector2Like {
  x: number;
  y: number;
  static dist(v1: Vector2, v2: Vector2) {
    return v1.sub(v2).mag();
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

  static normal(wallStart: Vector2, wallEnd: Vector2): Vector2 {
    const wallDir = wallEnd.sub(wallStart);
    const normal = new Vector2(-wallDir.y, wallDir.x);
    return normal.normalize();
  }

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }
  add(v: IVector2Like): Vector2 {
    return new Vector2(this.x + v.x, this.y + v.y);
  }
  sub(v: IVector2Like): Vector2 {
    return new Vector2(this.x - v.x, this.y - v.y);
  }
  mult(n: number): Vector2 {
    return new Vector2(this.x * n, this.y * n);
  }
  div(n: number): Vector2 {
    return new Vector2(this.x / n, this.y / n);
  }
  mag(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  normalize(): Vector2 {
    const m = this.mag();
    if (m === 0) return new Vector2(0, 0);
    return this.div(m);
  }
  copy(): Vector2 {
    return new Vector2(this.x, this.y);
  }
  set(x: number, y: number): Vector2 {
    this.x = x;
    this.y = y;
    return this;
  }
  dot(v: IVector2Like): number {
    return this.x * v.x + this.y * v.y;
  }
  reflect(n: Vector2): Vector2 {
    const dotProduct = this.dot(n);
    const reflection = n.mult(2 * dotProduct);
    return this.sub(reflection);
  }
  perpendicular(): Vector2 {
    return new Vector2(-this.y, this.x);
  }


}