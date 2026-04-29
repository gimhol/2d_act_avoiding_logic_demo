import { Vector2 } from "./Vector2.mjs";
import { Creature } from "./Creature.mjs";


function main() {
  const canvas = document.getElementById('canvas')?.closest('canvas');
  const ctx = canvas?.getContext('2d');
  if (!ctx) return;
  if (!canvas) return;

  function line(x0: number, y0: number, x1: number, y1: number, c: string): void {
    if (!ctx) return;
    ctx.strokeStyle = c;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  }

  function arrow(ed: Vector2, ndv: Vector2, color: string): void {
    if (!ctx) return;
    ctx.strokeStyle = color;
    const arrowLength = 10;
    const arrowWidth = 5;
    const leftX = ed.x - ndv.x * arrowLength - ndv.y * arrowWidth;
    const leftY = ed.y - ndv.y * arrowLength + ndv.x * arrowWidth;
    const rightX = ed.x - ndv.x * arrowLength + ndv.y * arrowWidth;
    const rightY = ed.y - ndv.y * arrowLength - ndv.x * arrowWidth;
    ctx.beginPath();
    ctx.moveTo(leftX, leftY);
    ctx.lineTo(ed.x, ed.y);
    ctx.lineTo(rightX, rightY);
    ctx.stroke();
  }

  const avoider = new Creature();
  avoider.move(250, 250);
  avoider.fillStyle = 'rgb(122, 122, 255)';
  const player = new Creature();
  player.fillStyle = 'rgb(255, 106, 106)';

  canvas.addEventListener('pointermove', (e: PointerEvent) => {
    player.move(e.offsetX, e.offsetY);
  });

  const danger_top: { start: Vector2; end: Vector2; readonly perpendicular: Vector2 } = {
    start: new Vector2(0, 0),
    end: new Vector2(500, 0),
    get perpendicular() {
      return this.end.sub(this.start).normalize().perpendicular();
    }
  };

  const update = (dt: number): void => {
    ctx.lineWidth = 2;
    const min_x = 25;
    const min_y = 25;
    const max_x = canvas.width = 450;
    const max_y = canvas.height = 450;
    avoider.render(ctx);
    player.render(ctx);

    const diff_vector = avoider.pos.sub(player.pos);
    const diff_vector_n = diff_vector.normalize();





    
    const endpoint = player.pos.add(diff_vector_n.mult(200));
    const cd = endpoint.add(diff_vector.sub(diff_vector_n.mult(200)));
    const edge_pos = Vector2.intersect(
      avoider.pos,
      endpoint,
      danger_top.start,
      danger_top.end
    );

    let force_vector = endpoint.sub(avoider);
    let move_vector: Vector2;
    let move_speed = 200;



    if (diff_vector.mag() < 100) {
      move_vector = endpoint.sub(avoider);
      line(player.x, player.y, avoider.x, avoider.y, '#333333');
      line(avoider.x, avoider.y, endpoint.x, endpoint.y, 'red');
      const o = avoider.pos.add(move_vector.normalize().mult(move_speed * dt));
      o.x = Math.max(Math.min(o.x, max_x), min_x);
      o.y = Math.max(Math.min(o.y, max_y), min_y);
      avoider.move(o.x, o.y);
    } else {
      line(player.x, player.y, endpoint.x, endpoint.y, '#333333');
      line(endpoint.x, endpoint.y, avoider.x, avoider.y, '#00000022');
      move_vector = new Vector2();
    }
    arrow(endpoint, diff_vector_n, diff_vector.mag() > 100 ? '#333333' : 'red');



    if (edge_pos) {
      const head_force_length = edge_pos.sub(avoider.pos).mag();
      const head_force = force_vector.normalize().mult(head_force_length);
      const tail_force_length = force_vector.mag() - head_force_length;
      const tail_force_vector = force_vector.reflect(danger_top.perpendicular).normalize().mult(tail_force_length);
      const out_end_pos = edge_pos.add(tail_force_vector);
      ctx.setLineDash([2, 2])
      line(avoider.x, avoider.y, edge_pos.x, edge_pos.y, diff_vector.mag() < 100 ? 'red' : 'green');
      line(edge_pos.x, edge_pos.y, out_end_pos.x, out_end_pos.y, diff_vector.mag() < 100 ? 'red' : 'green');
      arrow(out_end_pos, tail_force_vector.normalize(), diff_vector.mag() < 100 ? 'red' : 'green');
      arrow(edge_pos, head_force.normalize(), diff_vector.mag() < 100 ? 'red' : 'green');
    }
  };

  let prev_time = -1;
  const loop = (time: number): void => {
    if (prev_time < 0) {
      prev_time = time;
    } else {
      update((time - prev_time) / 1000);
      prev_time = time;
    }
    requestAnimationFrame(loop);
  };

  requestAnimationFrame(loop);
}
main();