import { Vector2, type IVector2Like } from "./Vector2.mjs";

export class Creature {
  readonly pos = new Vector2(0, 0);
  readonly dist = new Vector2(0, 0);
  readonly velocity = new Vector2(0, 0);
  speed: number = 50;
  debug: boolean = false
  strokeStyle = 'black';
  fillStyle = 'black';
  text = ''
  get x() { return this.pos.x; }
  set x(v) { this.pos.x = v; }
  get y() { return this.pos.y }
  set y(v) { this.pos.y = v }
  move_to(v: IVector2Like): this {
    this.dist.copy(v);
    return this;
  }
  update(dt: number) {
    const move_vector = this.dist.clone().sub(this.pos).normalize();
    this.velocity.x = this.speed * move_vector.x;
    this.velocity.y = this.speed * move_vector.y;
    const dx = this.velocity.x * dt
    const dy = this.velocity.y * dt
    const px = this.pos.x + dx;
    const py = this.pos.y + dy;
    if (dx) this.pos.x = Math[dx < 0 ? 'max' : 'min'](px, this.dist.x)
    if (dy) this.pos.y = Math[dy < 0 ? 'max' : 'min'](py, this.dist.y)
  }
  render(ctx: CanvasRenderingContext2D) {
    ctx.lineWidth = 1;
    ctx.setLineDash([])

    ctx.beginPath();
    ctx.ellipse(this.x, this.y, 15, 15, 0, 0, 2 * Math.PI);
    ctx.closePath();

    ctx.fillStyle = this.fillStyle;
    ctx.strokeStyle = this.strokeStyle;
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(this.x, this.y, 2, 2, 0, 0, 2 * Math.PI);
    ctx.closePath();

    ctx.fillStyle = this.fillStyle;
    ctx.strokeStyle = this.strokeStyle;
    ctx.fill();
    ctx.stroke();

    if (this.text) {
      ctx.fillStyle = 'black';
      ctx.textAlign = 'center'
      ctx.fillText(this.text, this.x, this.y - 18)
    }
  }
}