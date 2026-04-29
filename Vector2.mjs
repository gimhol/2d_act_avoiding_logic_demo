export class Vector2 {
  static dist(v1, v2) {
    return v1.sub(v2).mag();
  }
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  add(v) {
    return new Vector2(this.x + v.x, this.y + v.y);
  }
  sub(v) {
    return new Vector2(this.x - v.x, this.y - v.y);
  }
  mult(n) {
    return new Vector2(this.x * n, this.y * n);
  }
  div(n) {
    return new Vector2(this.x / n, this.y / n);
  }
  mag() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  normalize() {
    const m = this.mag();
    if (m === 0) return new Vector2(0, 0);
    return this.div(m);
  }
  copy() {
    return new Vector2(this.x, this.y);
  }
  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }
  dot(v) {
    return this.x * v.x + this.y * v.y;
  }
  reflect(n) {
    const dotProduct = this.dot(n);
    const reflection = n.mult(2 * dotProduct);
    return this.sub(reflection);
  }
  perpendicular() {
    return new Vector2(-this.y, this.x);
  }
  /**
   * 计算两条线段的交点
   * @param {Vector2} p1 - 线段1的起点
   * @param {Vector2} p2 - 线段1的终点
   * @param {Vector2} p3 - 线段2的起点
   * @param {Vector2} p4 - 线段2的终点
   * @returns {Vector2|null} - 如果相交返回交点坐标，如果不相交或平行返回 null
   */
  static intersect(p1, p2, p3, p4) {
    const x1 = p1.x, y1 = p1.y;
    const x2 = p2.x, y2 = p2.y;
    const x3 = p3.x, y3 = p3.y;
    const x4 = p4.x, y4 = p4.y;

    // 计算分母，用于判断平行
    const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

    // 如果分母为 0，说明两条线段平行或共线，没有交点（或者无数交点）
    if (Math.abs(denominator) < 0.00001) {
      return null;
    }

    // 计算 t 和 u 参数
    // t 代表交点在第一条线段上的位置 (0~1之间表示在线段上)
    // u 代表交点在第二条线段上的位置
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denominator;

    // 如果 t 和 u 都在 0 到 1 之间，说明交点确实在这两条线段上（而不是延长线上）
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      // 计算交点坐标：P = P1 + t * (P2 - P1)
      const ix = x1 + t * (x2 - x1);
      const iy = y1 + t * (y2 - y1);
      return new Vector2(ix, iy);
    }

    // 线段没有相交（交点在延长线上）
    return null;
  }

  static getNormal(wallStart, wallEnd) {
    // 1. 计算墙壁方向向量
    const wallDir = wallEnd.sub(wallStart);
    // 2. 垂直向量 (x, y) -> (-y, x) 或 (y, -x)
    // 这里取 (-y, x) 表示法线指向墙壁的“左侧/上方”
    const normal = new Vector2(-wallDir.y, wallDir.x);
    // 3. 归一化
    return normal.normalize();
  }
}