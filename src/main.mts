import { Creature } from "./Creature.mjs";
import { Vector2, type IVector2Like } from "./Vector2.mjs";


function main() {
  const canvas = document.getElementById('canvas')?.closest('canvas');
  const ctx = canvas?.getContext('2d');
  if (!ctx) return;
  if (!canvas) return;

  function line(v0: Readonly<IVector2Like>, v1: Readonly<IVector2Like>, color: string, dash: number[] = []): void {
    if (!ctx) return;
    ctx.strokeStyle = color;
    ctx.setLineDash(dash)
    ctx.beginPath();
    ctx.moveTo(v0.x, v0.y);
    ctx.lineTo(v1.x, v1.y);
    ctx.stroke();
  }

  function arrow(pos: Readonly<IVector2Like>, direction: Readonly<IVector2Like>, color: string, dash: number[] = []): void {
    if (!ctx) return;
    const height = 10;
    const width = 5;
    const x1 = pos.x - direction.x * height - direction.y * width;
    const y1 = pos.y - direction.y * height + direction.x * width;
    const x2 = pos.x - direction.x * height + direction.y * width;
    const y2 = pos.y - direction.y * height - direction.x * width;
    ctx.strokeStyle = color;
    ctx.setLineDash(dash)
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(pos.x, pos.y);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  const avoider = new Creature();
  avoider.debug = true
  avoider.x = 250
  avoider.y = 250
  avoider.move_to(avoider.pos)
  avoider.fillStyle = 'rgb(122, 122, 255)';

  const chaser = new Creature();
  chaser.fillStyle = 'rgb(255, 106, 106)';
  chaser.speed = 250
  canvas.addEventListener('pointermove', (e: PointerEvent) => {
    chaser.x = e.offsetX
    chaser.y = e.offsetY
    chaser.move_to(chaser.pos);
  });
  class Edge {
    readonly p1: Vector2 = new Vector2(0, 0);
    readonly p2: Vector2 = new Vector2(0, 0);
    readonly perpendicular: Vector2 = new Vector2(0, 0);
    constructor(p1: IVector2Like, p2: IVector2Like) {
      this.p1.copy(p1)
      this.p2.copy(p2)
      this.perpendicular.copy(p1).sub(p2).normalize();
      const temp = this.perpendicular.x
      this.perpendicular.x = this.perpendicular.y
      this.perpendicular.y = temp
    }
  }
  const min_x = 50;
  const min_y = 50;
  const max_x = 450;
  const max_y = 450;
  const edge = [
    new Edge({ x: min_x, y: min_y }, { x: min_x, y: max_y }),
    new Edge({ x: min_x, y: max_y }, { x: max_x, y: max_y }),
    new Edge({ x: max_x, y: max_y }, { x: max_x, y: min_y }),
    new Edge({ x: max_x, y: min_y }, { x: min_x, y: min_y }),
  ]

  let diff_vector = avoider.pos.clone().sub(chaser.pos);
  let diff_vector_n = diff_vector.clone().normalize();
  let diff_vector_l = diff_vector.mag()
  let threat_distance = 100;
  let safe_distance = 200;
  let threat_pos = chaser.pos.clone().add(diff_vector_n.clone().mult(threat_distance))
  let safe_pos = chaser.pos.clone().add(diff_vector_n.clone().mult(safe_distance))
  let extra_vector: Vector2 | null = null
  let nearest_wall: Edge | null = null;
  let nearest_edge_pos: Vector2 | null = null
  let nearest = -1;
  let farest_wall: Edge | null = null;
  let farest_edge_pos: Vector2 | null = null
  let farest = -1;
  const move_vector = new Vector2(0, 0)

  const update = (dt: number): void => {
    diff_vector = avoider.pos.clone().sub(chaser.pos);
    diff_vector_n = diff_vector.clone().normalize();
    diff_vector_l = diff_vector.mag()
    threat_pos = chaser.pos.clone().add(diff_vector_n.clone().mult(threat_distance))
    safe_pos = chaser.pos.clone().add(diff_vector_n.clone().mult(safe_distance))
    extra_vector = null
    nearest_wall = null;
    nearest_edge_pos = null
    nearest = -1;
    farest_wall = null;
    farest_edge_pos = null
    farest = -1;
    for (const wall of edge) {
      const edge_pos = Vector2.intersect(
        chaser,
        diff_vector.clone().mult(1000),
        wall.p1,
        wall.p2
      );
      if (!edge_pos) continue
      const disss = Vector2.dist(edge_pos, chaser);
      if (nearest < 0 || disss < nearest) {
        nearest = disss
        nearest_wall = wall
        nearest_edge_pos = edge_pos;
      }
      if (farest < 0 || disss > farest) {
        farest = disss;
        farest_wall = wall;
        farest_edge_pos = edge_pos;
      }
    }
    if (
      farest_edge_pos &&
      farest_wall &&
      farest < safe_distance &&
      avoider.text !== 'Idle'
    ) {
      const wall = farest_wall;
      const edge_pos = farest_edge_pos;
      const dist = Vector2.dist(avoider, edge_pos);
      if (dist < 100) {
        const head_length = Math.floor(Vector2.dist(edge_pos, chaser.pos));
        const tail_length = safe_pos.clone().sub(chaser).mag() - head_length;
        const tail_vector = diff_vector_n.clone().mult(tail_length);
        const reflected_tail_vector = tail_vector.clone().reflect(wall.perpendicular)
        const reflected_tail_end = edge_pos.clone().add(reflected_tail_vector);
        const v = Vector2.sub(reflected_tail_end, edge_pos)
        extra_vector = Vector2.add(reflected_tail_vector, v).normalize().mult(100 - dist)
      }
    }

    if (avoider.text === 'Avoiding') {
      if (diff_vector_l >= safe_distance) {
        avoider.text = 'Idle'
      } else {
        move_vector.copy(diff_vector)
        if (extra_vector) move_vector.add(extra_vector)
      }
    } else if (avoider.text === 'Idle') {
      if (diff_vector_l < threat_distance) {
        avoider.text = 'Avoiding'
        move_vector.copy(diff_vector)
        if (extra_vector) move_vector.add(extra_vector)
      }
    }

    if (avoider.velocity.mag() == 0)
      avoider.text = 'Idle'
    for (const wall of edge) {
      line(wall.p1, wall.p2, 'gray', [1, 1])
    }

    avoider.move_to({
      x: Math.max(Math.min(avoider.x + move_vector.x, 500), 0),
      y: Math.max(Math.min(avoider.y + move_vector.y, 500), 0),
    });

    // const endpoint = chaser.pos.add(diff_vector_n.mult(200));
    // const cd = endpoint.add(diff_vector.sub(diff_vector_n.mult(200)));
    // let force_vector = endpoint.sub(avoider);
    // let move_vector: Vector2;
    // let move_speed = 200;
    // if (diff_vector.mag() < 100) {
    //   move_vector = endpoint.sub(avoider);
    //   line(chaser.x, chaser.y, avoider.x, avoider.y, '#333333');
    //   line(avoider.x, avoider.y, endpoint.x, endpoint.y, 'red');
    //   const o = avoider.pos.add(move_vector.normalize().mult(move_speed * dt));
    //   o.x = Math.max(Math.min(o.x, max_x), min_x);
    //   o.y = Math.max(Math.min(o.y, max_y), min_y);
    //   avoider.move(o.x, o.y);
    // } else {
    //   line(chaser.x, chaser.y, endpoint.x, endpoint.y, '#333333');
    //   line(endpoint.x, endpoint.y, avoider.x, avoider.y, '#00000022');
    //   move_vector = new Vector2();
    // }
    // arrow(endpoint, diff_vector_n, diff_vector.mag() > 100 ? '#333333' : 'red');

    // if (edge_pos) {
    //   const head_force_length = edge_pos.sub(avoider.pos).mag();
    //   const head_force = force_vector.normalize().mult(head_force_length);
    //   const tail_force_length = force_vector.mag() - head_force_length;
    //   const tail_force_vector = force_vector.reflect(danger_top.perpendicular).normalize().mult(tail_force_length);
    //   const out_end_pos = edge_pos.add(tail_force_vector);
    //   ctx.setLineDash([2, 2])
    //   line(avoider.x, avoider.y, edge_pos.x, edge_pos.y, diff_vector.mag() < 100 ? 'red' : 'green');
    //   line(edge_pos.x, edge_pos.y, out_end_pos.x, out_end_pos.y, diff_vector.mag() < 100 ? 'red' : 'green');
    //   arrow(out_end_pos, tail_force_vector.normalize(), diff_vector.mag() < 100 ? 'red' : 'green');
    //   arrow(edge_pos, head_force.normalize(), diff_vector.mag() < 100 ? 'red' : 'green');
    // }j

    if (!pause) {
      avoider.update(dt);
      chaser.update(dt)
    }
  };

  let prev_time = -1;
  let pause = 0

  const loop = (time: number): void => {
    const dt = (time - prev_time) / 1000
    if (prev_time > 0)
      update(dt);
    if (prev_time > 0) {
      canvas.width = 500;
      canvas.height = 500;
      ctx.lineWidth = 1;
      avoider.render(ctx)
      chaser.render(ctx)
      for (const wall of edge) {
        line(wall.p1, wall.p2, 'gray', [1, 1])
      }
      if (diff_vector_l < threat_distance) {
        line(chaser.pos, avoider.pos, 'black')
        line(avoider.pos, threat_pos, 'red')
        line(threat_pos, safe_pos, 'orange', [2, 2])
        arrow(safe_pos, diff_vector_n, 'orange')
      } else if (diff_vector_l < safe_distance) {
        line(chaser.pos, threat_pos, 'black')
        line(threat_pos, safe_pos, 'black', [2, 2])
        arrow(safe_pos, diff_vector_n, 'black', [2, 2])
      } else {
        line(chaser.pos, threat_pos, 'black')
        line(threat_pos, safe_pos, 'black', [2, 2])
        arrow(safe_pos, diff_vector_n, 'black', [2, 2])
        line(safe_pos, avoider.pos, 'lightgray', [2, 2])
      }
      if (farest_edge_pos) {
        const { x, y } = farest_edge_pos
        ctx.fillStyle = 'red';
        ctx.beginPath()
        ctx.ellipse(x, y, 3, 3, 0, 0, Math.PI * 2)
        ctx.fill();
      }

      if (move_vector.x || move_vector.y) {
        line(avoider, Vector2.add(avoider, move_vector), 'red', [1, 1]);
        arrow(Vector2.add(avoider, move_vector), move_vector.normalize(), 'red')
      }

      if (extra_vector) {
        line(avoider, Vector2.add(avoider, extra_vector), 'blue', [1, 1]);
      }

    }
    prev_time = time;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() == 'j')
      pause = pause ? 0 : 1
  })
}
main();