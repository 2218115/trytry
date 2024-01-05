window.onload = () => {
  const canvas = document.getElementById("main_canvas");
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const image_data = ctx.getImageData(0, 0, width, height);
  const canvas_data = image_data.data;

  let mouse_pos = v2(0, 0);
  let mouse_button_left_is_pressed = false;

  canvas.onmousemove = (e) => {
    mouse_pos = v2(e.offsetX, e.offsetY);
  }

  window.onmousedown = (e) => {
    if (e.button == 0) {
      mouse_button_left_is_pressed = true;
    }
  }

  window.onmouseup = (e) => {
    if (e.button == 0) {
      mouse_button_left_is_pressed = false;
    }
  }

  let x = 0;
  let y = 0;

  const box_color = 0xff0000ff;
  const box_hot_color = 0xaa0000ff;
  const box_active_color = 0x330000ff;
  const box_size = v2(100, 80);


  function create_ui_context() {
    return {
      hot_id: -1,
      active_id: -1,
      offset_to_mouse: v2(0, 0),
      components: Array.from({ length: 256 }, e => {
        return {
          active: false,
          pos: v2(0, 0),
          size: box_size,
          color: box_color, hot_color: box_hot_color, active_color: box_active_color
        };
      })
    }
  }

  function ui_add_components(ctx, pos, size) {
    for (let i = 0; i < ctx.components.length; ++i) {
      let component = ctx.components[i];
      if (!component.active) {
        component.active = true;
        component.pos = pos;
        component.size = size;
        return;
      }
    }
  }

  function ui_update(ctx, dt) {
    let finded = false;
    for (let i = 0; i < ctx.components.length; ++i) {
      let component = ctx.components[i];
      if (component.active) {
        // already active
        if (ctx.active_id == i) {
          const dPos = v2_sub(mouse_pos, v2_add(component.pos, ctx.offset_to_mouse));
          component.pos = v2_add(component.pos, dPos);
        }

        if (ctx.hot_id == i) {

        }

        if (aabb_point_is_inside(component.pos, component.size, mouse_pos)) {
          ctx.hot_id = i;
          ctx.offset_to_mouse = v2_sub(mouse_pos, component.pos);
          finded = true;
          if (mouse_button_left_is_pressed) {
            ctx.active_id = i;
          } else {
            ctx.active_id = -1;
          }
        }
      }
    }

    if (!finded) {
      pickup_offset = v2(0, 0);
      ctx.hot_id = -1;
      ctx.active_id = -1;
    }
  }

  function ui_render(ctx, dt) {
    for (let i = 0; i < ctx.components.length; ++i) {
      let component = ctx.components[i];
      if (component.active) {
        let color = component.color;
        console.log(ctx.hot_id);

        switch (i) {
          case ctx.active_id: {
            color = component.active_color;
          } break;

          case ctx.hot_id: {
            color = component.hot_color;
          } break;
        }
        draw_rect(component.pos, component.size, color);
      }
    }


  }

  let ui = create_ui_context();

  ui_add_components(ui, v2(32, 32), v2(64, 64));
  ui_add_components(ui, v2(100, 100), v2(100, 64));


  function update_and_render(dt) {
    // clear
    draw_rect(v2(0, 0), v2(width, height), 0x323232ff);

    ui_update(ui, dt);

    ui_render(ui, ctx);
    // put to the canvas
    ctx.putImageData(image_data, 0, 0);
  }


  // drawing utility
  function aabb_point_is_inside(pos, size, point) {
    const a = pos.x;
    const b = pos.x + size.x;
    const c = pos.y + size.y;
    const d = pos.y;

    return (point.x >= a && point.x < b) && (point.y >= d && point.y < c);
  }

  function v2(x, y) {
    return { x, y };
  }

  function v2_add(a, b) {
    return { x: a.x + b.x, y: a.y + b.y };
  }

  function v2_sub(a, b) {
    return { x: a.x - b.x, y: a.y - b.y };
  }

  function v2_length({ x, y }) {
    return Math.sqrt(x * x + y * y);
  }

  function v2_scalar_mul({ x, y }, scalar) {
    return { x: x * scalar, y: y * scalar };
  }

  function v2_scalar_div({ x, y }) {
    return { x: x / scalar, y: y / scalar };
  }

  function unpack_rgba(c) {
    return {
      r: (c >> 24) & 0xff,
      g: (c >> 16) & 0xff,
      b: (c >> 8) & 0xff,
      a: (c >> 0) & 0xff,
    }
  }

  function clamp(val, min, max) {
    if (val < min) return min;
    if (val > max) return max;
    return val;
  }

  function draw_rect({ x, y }, size, color) {
    const x0 = Math.round(clamp(x, 0, width));
    const x1 = Math.round(clamp(x + size.x, 0, width));
    const y0 = Math.round(clamp(y, 0, height));
    const y1 = Math.round(clamp(y + size.y, 0, height));

    for (let i = y0; i < y1; ++i) {
      for (let j = x0; j < x1; ++j) {
        const index = (j * 4) + (i * width * 4);
        const { r, g, b, a } = unpack_rgba(color);
        canvas_data[index + 0] = r;
        canvas_data[index + 1] = g;
        canvas_data[index + 2] = b;
        canvas_data[index + 3] = a;
      }
    }
  }

  function draw_pixel(x, y, color) {
    const index = (x * 4) + (y * width * 4);
    const { r, g, b, a } = unpack_rgba(color);
    canvas_data[index + 0] = r;
    canvas_data[index + 1] = g;
    canvas_data[index + 2] = b;
    canvas_data[index + 3] = a;
  }

  let prev_timestamp = 0;
  function loop(timestamp) {
    const dt = timestamp - prev_timestamp;
    prev_timestamp = timestamp;
    update_and_render(dt * 0.001);
    window.requestAnimationFrame(loop);
  }

  window.requestAnimationFrame(loop);

}