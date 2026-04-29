import { Vector2 } from "./Vector2.mjs"
export class Creature {
  pos = new Vector2(0, 0)
  get x() { return this.pos.x };
  set x(v) { this.pos.x = v };
  get y() { return this.pos.y };
  set y(v) { this.pos.y = y };

  strokeStyle = 'black'
  fillStyle = 'black'
  move(x, y) {
    this.pos.x = x;
    this.pos.y = y;
  }
  /**
   * @param {CanvasRenderingContext2D} ctx
   */
  render(ctx) {
    ctx.beginPath()
    ctx.ellipse(this.x, this.y, 15, 15, 0, 0, 2 * Math.PI)
    ctx.closePath()
    
    ctx.fillStyle = this.fillStyle
    ctx.strokeStyle = this.strokeStyle
    ctx.fill()
    ctx.stroke()

    ctx.beginPath()
    ctx.ellipse(this.x, this.y, 2, 2, 0, 0, 2 * Math.PI)
    ctx.closePath()

    ctx.fillStyle = this.fillStyle
    ctx.strokeStyle = this.strokeStyle
    ctx.fill()
    ctx.stroke()
  }
}
