window.onload = async () => {
  const canvas = document.getElementById("main_canvas");
  const ctx = canvas.getContext("2d",);
  const width = canvas.width;
  const height = canvas.height;
  const imageData = ctx.getImageData(0, 0, width, height);

  // sound
  // this maybe not best solution to playing sound
  // another soulition that better maybe is using a WEB Audio Api
  const shoot_sound = new Audio("./sound/shoot.wav");
  const enemy_shoot_sound = new Audio("./sound/enemy_shoot.wav");
  const back_sound = new Audio("./sound/back.wav");
  const special_shoot_sound = new Audio("./sound/special_shoot.wav");
  const hit_sound = new Audio("./sound/hit.wav");
  const power_up_sound = new Audio("./sound/power_up.wav");
  const noise = new Audio("./sound/noise.wav");

  back_sound.loop = true;


  let can_special_shoot = false;

  let is_playing = false;
  let is_audio_on = true;

  let player_point = 0;
  let ls_player_point = -1;
  let player_life = 10;
  let ls_player_life = -1;
  let rainbow_power = 0;

  let player_color = 0xff000000;
  let enemy_color = 0x00ff00ff;
  let bullet_color_for_player = 0xff000000;
  let bullet_color_for_enemy = 0x00000000;

  let mouse_x = 0;
  let mouse_y = 0;

  let action_up = false;
  let action_left = false;
  let action_right = false;
  let action_down = false;
  let action_shoot = false;

  let prev_timestamp = null;

  // saving index of enemy
  let enemy_can_shoot = -1;

  on_special_shoot_change();

  function on_special_shoot_change() {
    if (can_special_shoot) {
      //console.log(can_special_shoot);
      document.getElementById("special_shoot_card").classList.add("up");
      document.getElementById("special_shoot_card").style.display = 'inline-block';
      setTimeout(() => {
        document.getElementById("special_shoot_card").classList.remove("up");
      }, 400);
    } else {
      document.getElementById("special_shoot_card").classList.remove("up");
      document.getElementById("special_shoot_card").classList.add("down");
      setTimeout(() => {
        document.getElementById("special_shoot_card").classList.remove("down");
        document.getElementById("special_shoot_card").style.display = 'none';
      }, 400);
    }
  }

  document.getElementById("toogle_pause").onclick = () => {
    is_playing = !is_playing;
    if (is_playing) {
      back_sound.play();
      document.getElementById("toogle_pause").innerHTML = "Playing";
      document.getElementById("toogle_pause").parentElement.classList.remove("animated");
    } else {
      document.getElementById("toogle_pause").innerHTML = "Paused";
      document.getElementById("toogle_pause").parentElement.classList.add("animated");
    }


  }

  document.getElementById("toogle_audio").onclick = () => {
    is_audio_on = !is_audio_on;
    if (is_audio_on) {
      document.getElementById("toogle_audio").innerHTML = "Audio ON";
    } else {
      document.getElementById("toogle_audio").innerHTML = "Audio OFF";
    }
  }

  // color stuff
  const LS_PLAYER_COLOR = "LS_PLAYER_COLOR";
  const old_player_color = localStorage.getItem(LS_PLAYER_COLOR);
  if (old_player_color != null) {
    document.getElementById("player_color").value = old_player_color;
    player_color = Number(`0x${old_player_color.slice(1)}`) << 8 | 0xff;
  }
  document.getElementById("player_color").oninput = (e) => {
    player_color = Number(`0x${e.target.value.slice(1)}`) << 8 | 0xff;
    localStorage.setItem(LS_PLAYER_COLOR, e.target.value);
  }

  const LS_ENEMY_COLOR = "LS_ENEMY_COLOR";
  const old_enemy_color = localStorage.getItem(LS_ENEMY_COLOR);
  if (old_enemy_color != null) {
    document.getElementById("enemy_color").value = old_enemy_color;
    enemy_color = Number(`0x${old_enemy_color.slice(1)}`) << 8 | 0xff;
  }
  document.getElementById("enemy_color").oninput = (e) => {
    enemy_color = Number(`0x${e.target.value.slice(1)}`) << 8 | 0xff;
    localStorage.setItem(LS_ENEMY_COLOR, e.target.value);
  }

  const LOCAL_STORAGE_PLAYER_POINT = "LS_PLAYER_POINT";
  const old_point = localStorage.getItem(LOCAL_STORAGE_PLAYER_POINT);
  if (old_point) {
    document.getElementById("old_point").innerHTML = `${old_point}`;
  }

  function on_rainbow_power_change() {
    document.getElementById("rainbow_power").innerHTML = `${rainbow_power}`;
  }

  function on_player_life_change() {
    // hacky
    if (player_life < 0) {
      player_life = 0;
    }

    if (player_life <= 3) {
      document.getElementById("player_life").parentElement.classList.add("animated-red");
    } else {
      document.getElementById("player_life").parentElement.classList.remove("animated-red");
    }

    document.getElementById("player_life").innerHTML = `${player_life}`;
    if (player_life == 0) {
      alert("Thanks For Playing...😃");
      const old_point = localStorage.getItem(LOCAL_STORAGE_PLAYER_POINT);
      if (player_point > old_point || player_point == null) {
        localStorage.setItem(LOCAL_STORAGE_PLAYER_POINT, `${player_point}`);
      }
      location.reload();
    }
  }

  function on_player_point_change() {
    document.getElementById("player_point").innerHTML = `${player_point}`;
  }


  canvas.onmousedown = (e) => {
    if (e.button == 0) {
      action_shoot = true;
    }
  }

  canvas.onmousemove = (e) => {
    mouse_x = e.offsetX;
    mouse_y = e.offsetY;
  }

  function reset_input() {
    action_up = false;
    action_down = false;
    action_left = false;
    action_right = false;
  }

  window.onkeydown = (e) => {
    if (e.key === 'w') {
      action_up = true;
    }

    if (e.key === 'a') {
      action_left = true;
    }

    if (e.key === 's') {
      action_down = true;
    }

    if (e.key === 'd') {
      action_right = true;
    }
  }

  window.onkeyup = (e) => {
    if (e.key === 'w') {
      action_up = false;
    }

    if (e.key === 'a') {
      action_left = false;
    }

    if (e.key === 's') {
      action_down = false;
    }

    if (e.key === 'd') {
      action_right = false;
    }
  }

  let player = {
    pos: {
      x: width / 2 - 16,
      y: height / 2 - 16,
    },
    velocity: {
      x: 0,
      y: 0,
    }
  }

  function v2_scalar_mul(input, scalar) {
    return {
      x: input.x * scalar,
      y: input.y * scalar,
    }
  }

  let bullet_iota = 0;
  const UKNOWN_BULLET = bullet_iota++;
  const PLAYER_BULLET = bullet_iota++;
  const ENEMY_BULLET = bullet_iota++;

  let bullets = Array.from({ length: 10 }, () => {
    return {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life_span: 0,
      life: false,
      type: UKNOWN_BULLET,
      special: false,
    }
  });

  function add_bullets(x, y, vx, vy, life_span = 1, type = UKNOWN_BULLET, special = false) {
    for (let i = 0; i < bullets.length; ++i) {
      if (bullets[i].life === false) {
        bullets[i].x = x;
        bullets[i].y = y;
        bullets[i].vx = vx;
        bullets[i].vy = vy;
        bullets[i].life = true;
        bullets[i].life_span = life_span;
        bullets[i].type = type;
        bullets[i].special = special;
        return;
      }
    }
  }

  function rand_color() {
    function rand(max) {
      return Math.round(Math.random() * 255);
    }

    return (100 + rand(100) << 24) | (rand(255) << 16) | (rand(255) << 8);
  }

  function update_bullets(dt) {
    for (let i = 0; i < bullets.length; ++i) {
      let b = bullets[i];
      if (b.life === true) {
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.life_span -= dt * 1;
        if (b.type == PLAYER_BULLET) {
          add_particles(b.x, b.y, 0, 0, 0.5, rand_color());
        }
        if (b.type == PLAYER_BULLET && b.special) {
          add_particles(b.x, b.y, 0, 0, 0.5, rand_color());
        }

        if (b.type == ENEMY_BULLET) {
          add_particles(b.x, b.y, 0, 0, 0.2, enemy_color & ~(0xff));
        }

        if (b.x < 0 || b.x > width) {
          b.vx = -b.vx;
        }

        if (b.y < 0 || b.y > height) {
          b.vy = -b.vy;
        }

        if (b.life_span <= 0) {
          b.special = false;
          b.life = false;
        }
      }
    }
  }


  let enemies = Array.from({ length: 20 }, () => {
    return {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: false,
      interval_shoot: Math.random() + 5,
      timer_counter: 0,
    }
  });

  function add_enemies(x, y, vx, vy, shoot_interval) {
    for (let i = 0; i < enemies.length; ++i) {
      if (enemies[i].life === false) {
        if (enemy_can_shoot == -1) {
          enemy_can_shoot = i;
        }

        enemies[i].x = x;
        enemies[i].y = y;
        enemies[i].vx = vx;
        enemies[i].vy = vy;
        enemies[i].life = true;
        enemies[i].timer_counter = 0;
        enemies[i].interval_shoot = shoot_interval;
        return;
      }
    }
  }

  function update_enemies(dt) {
    for (let i = 0; i < enemies.length; ++i) {
      let e = enemies[i];
      if (e.life === true) {
        e.x += e.vx * dt;
        e.y += e.vy * dt;

        if (e.x > width || e.x < 0) {
          e.vx = -e.vx;
        }

        if (e.y > height || e.y < 0) {
          e.vy = -e.vy;
        }

        if (enemy_can_shoot == i) {
          e.timer_counter += 1 * dt;
          if (e.timer_counter > e.interval_shoot) {
            enemy_can_shoot = -1;

            e.timer_counter = 0;
            const dx = e.x - player.pos.x;
            const dy = e.y - player.pos.y;
            const l = Math.sqrt(dx * dx + dy * dy);
            const nx = dx / l;
            const ny = dy / l;

            add_bullets(e.x, e.y, -nx * 700, -ny * 700, 3, ENEMY_BULLET);

            // playing
            enemy_shoot_sound.play();

            // shake camera
            cam_offset_x = Math.round(-8 + Math.random() * 16);
            cam_offset_y = Math.round(-8 + Math.random() * 16);
          }
        }
      }
    }
  }

  let particles = Array.from({ length: 256 }, () => {
    return {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: false,
      life_span: 0,
      color: 0x00000000,
    }
  });

  function add_particles(x, y, vx, vy, life_span, color) {
    for (let i = 0; i < particles.length; ++i) {
      if (particles[i].life === false) {
        particles[i].x = x;
        particles[i].y = y;
        particles[i].vx = vx;
        particles[i].vy = vy;
        particles[i].life = true;
        particles[i].life_span = life_span;
        particles[i].color = color;
        return;
      }
    }
  }

  function update_particles(dt) {
    for (let i = 0; i < particles.length; ++i) {
      if (particles[i].life === true) {
        particles[i].x += particles[i].vx * dt;
        particles[i].y += particles[i].vy * dt;
        particles[i].life_span -= dt * 1;
        if (particles[i].life_span <= 0) {
          particles[i].life = false;
        }
      }
    }
  }

  let rainbow_boxs = Array.from({ length: 100 }, () => {
    return {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: false,
      life_span: 0,
      color: 0x00000000,
    }
  });

  function add_rainbow_boxs(x, y, vx, vy, life_span, color) {
    for (let i = 0; i < rainbow_boxs.length; ++i) {
      if (rainbow_boxs[i].life === false) {
        rainbow_boxs[i].x = x;
        rainbow_boxs[i].y = y;
        rainbow_boxs[i].vx = vx;
        rainbow_boxs[i].vy = vy;
        rainbow_boxs[i].life = true;
        rainbow_boxs[i].life_span = life_span;
        rainbow_boxs[i].color = color;
        return;
      }
    }
  }

  function update_rainbow_boxs(dt) {
    for (let i = 0; i < rainbow_boxs.length; ++i) {
      if (rainbow_boxs[i].life === true) {
        rainbow_boxs[i].x += rainbow_boxs[i].vx * dt;
        rainbow_boxs[i].y += rainbow_boxs[i].vy * dt;
        rainbow_boxs[i].life_span -= dt * 1;
        if (rainbow_boxs[i].life_span <= 0) {
          rainbow_boxs[i].life = false;
        }
      }
    }
  }


  function aabb_is_collide(a, a_dim, b, b_dim) {
    let x_in_inner_line = false;
    if (a.x < (b.x + b_dim.x) && (a.x + a_dim.x) > b.x) {
      x_in_inner_line = true;
    }

    let y_in_inner_line = false;
    if (a.y < (b.y + b_dim.y) && (a.y + a_dim.y) > b.y) {
      y_in_inner_line = true;
    }

    return x_in_inner_line == true && y_in_inner_line == true;
  }


  // variable
  let cam_scale_y = 1;
  let cam_scale_x = 1;
  let cam_offset_x = 0;
  let cam_offset_y = 0;

  const spawn_time_interval = 3;
  let timer_counter = spawn_time_interval;

  let init = false;


  function update_and_render(dt) {
    if (is_playing) {

      // input
      let acceleration = { x: 0, y: 0 };

      if (action_down) {
        acceleration.y = 1;
      }

      if (action_left) {
        acceleration.x = -1;
      }

      if (action_right) {
        acceleration.x = 1;
      }

      if (action_up) {
        acceleration.y = -1;
      }

      if (action_shoot === true) {
        const dx = mouse_x - player.pos.x;
        const dy = mouse_y - player.pos.y;
        const l = Math.sqrt(dx * dx + dy * dy);
        const nx = dx / l;
        const ny = dy / l;

        if (can_special_shoot) {
          // special shoot change
          can_special_shoot = false;
          on_special_shoot_change();
          add_bullets(player.pos.x, player.pos.y, nx * 1000 + (rainbow_power * 10), ny * 1000 + (rainbow_power * 10), 5 + (rainbow_power * 0.1), PLAYER_BULLET, true);
          add_bullets(player.pos.x, player.pos.y, -nx * 1000 + (rainbow_power * 10), ny * 1000 + (rainbow_power * 10), 5 + (rainbow_power * 0.1), PLAYER_BULLET, true);
          add_bullets(player.pos.x, player.pos.y, nx * 1000 + (rainbow_power * 10), -ny * 1000 + (rainbow_power * 10), 5 + (rainbow_power * 0.1), PLAYER_BULLET, true);
          add_bullets(player.pos.x, player.pos.y, -nx * 1000 + (rainbow_power * 10), -ny * 1000 + (rainbow_power * 10), 5 + (rainbow_power * 0.1), PLAYER_BULLET, true);
          special_shoot_sound.play();
          //noise.play();
        } else {
          add_bullets(player.pos.x, player.pos.y, nx * 700 + (rainbow_power * 10), ny * 700 + (rainbow_power * 10), 1 + (rainbow_power * 0.1), PLAYER_BULLET);
          shoot_sound.play();
          //noise.play();
        }

        // play sound

        action_shoot = false;
        // cam_scale_x = Math.round(1 + Math.random());
        // cam_scale_y = cam_scale_x;
      }

      if (acceleration.x != 0 && acceleration.y != 0) {
        acceleration = v2_scalar_mul(acceleration, Math.sqrt(0.5));
        add_particles(player.pos.x, player.pos.y, Math.sin(Math.random() * Math.PI) * 100, Math.sin(Math.random() * Math.PI) * 100, 0.5, player_color);
      }

      acceleration = v2_scalar_mul(acceleration, 5);
      if (acceleration.x != 0 || acceleration.y != 0) {
        add_particles(player.pos.x, player.pos.y, Math.sin(Math.random() * Math.PI) * 100, Math.sin(Math.random() * Math.PI) * 100, 0.5, player_color);
      }

      timer_counter += dt;
      if (timer_counter >= spawn_time_interval - clamp(player_point / 100, 0, 2.5)) {
        add_enemies(Math.round(Math.random() * width), Math.round(Math.random() * height), 50 + player_point, 50 + player_point, 2 + Math.random() * 5 - clamp(player_point * 0.001, 0, 5));
        timer_counter = 0;
      }

      // update
      player.pos.x += acceleration.x;
      player.pos.y += acceleration.y;
      update_bullets(dt);
      update_enemies(dt);
      update_particles(dt);
      update_rainbow_boxs(dt);

      if (cam_scale_x > 1) {
        cam_scale_x -= 1 * dt;
      }
      if (cam_scale_y > 1) {
        cam_scale_y -= 1 * dt;
      }

      if (cam_offset_x > 0) {
        cam_offset_x += -2 * dt;
      }
      if (cam_offset_x < 0) {
        cam_offset_x += 2 * dt;
      }

      if (cam_offset_y > 0) {
        cam_offset_y += -2 * dt;
      }
      if (cam_offset_y < 0) {
        cam_offset_y += 2 * dt;
      }

      // collision player with box rainbow_boxs
      for (let i = 0; i < rainbow_boxs.length; ++i) {
        let rb = rainbow_boxs[i];
        const w = 64;
        const h = 64;
        if (rb.life) {
          if (aabb_is_collide(player.pos, { x: 32, y: 32 }, rb, { x: w, y: h })) {
            rb.life = false;
            player_life++;
            rainbow_power++;
            on_rainbow_power_change();
            for (let i = 0; i < Math.PI * 2; i += 0.5) {
              add_particles(rb.x, rb.y, Math.cos(i) * 200, Math.sin(i) * 200, 1, player_color);
            }

            // shake camera
            cam_offset_x = Math.round(-16 + Math.random() * 32);
            cam_offset_y = Math.round(-16 + Math.random() * 32);

            power_up_sound.play();
          }
        }
      }

      // collision of player with enemy
      for (let i = 0; i < enemies.length; ++i) {
        let e = enemies[i];
        if (e.life) {
          if (aabb_is_collide(player.pos, { x: 32, y: 32 }, e, { x: 24, y: 24 })) {
            e.life = false;

            // shake camera
            cam_offset_x = Math.round(-8 + Math.random() * 16);
            cam_offset_y = Math.round(-8 + Math.random() * 16);

            if (enemy_can_shoot == i) {
              player_life -= 2; // minus 2 if player intersect with bullet that can shoot
              enemy_can_shoot = -1;
            }

            for (let j = 0; j < Math.PI * 2; j += 1) {
              add_particles(e.x, e.y, Math.cos(j) * 50, Math.sin(j) * 50, 1, enemy_color);
            }

            player_life--;
            // playing sound
            hit_sound.play();
          }
        }
      }

      // collision player with bullet_enemy
      for (let i = 0; i < bullets.length; ++i) {
        const b = bullets[i];
        const bw = 12 * cam_scale_x;
        const bh = 12 * cam_scale_y;
        if (b.life && b.type == ENEMY_BULLET) {
          if (aabb_is_collide(player.pos, { x: 32, y: 32 }, b, { x: bw, y: bh })) {
            bullets[i].life = false;

            cam_offset_x = Math.round(-8 + Math.random() * 16);
            cam_offset_y = Math.round(-8 + Math.random() * 16);

            for (let i = 0; i < Math.PI * 2; i += 0.5) {
              add_particles(player.pos.x, player.pos.y, Math.cos(i) * 100, Math.sin(i) * 100, 1, player_color);
            }

            player_life--;

            // playing sound
            hit_sound.play();
          }
        }
      }


      // collision player_bullet with enemy
      for (let i = 0; i < bullets.length; ++i) {
        const b = bullets[i];
        const bw = 12 * cam_scale_x;
        const bh = 12 * cam_scale_y;
        if (b.life && b.type == PLAYER_BULLET) {
          for (let j = 0; j < enemies.length; ++j) {
            const e = enemies[j];
            if (e.life) {
              const ew = 24 * cam_scale_x;
              const eh = 24 * cam_scale_y;
              if (aabb_is_collide(e, { x: ew, y: eh }, b, { x: bw, y: bh })) {
                enemies[j].life = false;
                // if not special bullet destroy if they colliding
                // if special, bullet on destroy only with our life_span 
                if (!b.special) {
                  bullets[i].life = false;
                }

                cam_offset_x = Math.round(-8 + Math.random() * 16);
                cam_offset_y = Math.round(-8 + Math.random() * 16);

                if (enemy_can_shoot == j) {
                  player_point += 2; // add 2 if player shoot bullet that can shoot
                  add_rainbow_boxs(e.x, e.y, 0, 0, 5);
                  enemy_can_shoot = -1;


                  // special shoot change
                  if (Math.round(Math.random() * 3) == 1) {
                    can_special_shoot = true;
                    on_special_shoot_change();
                  }

                } else {
                  for (let i = 0; i < Math.PI * 2; i += 1) {
                    add_particles(e.x, e.y, Math.cos(i) * 50, Math.sin(i) * 50, 1, enemy_color);
                  }
                }

                // playing sound
                hit_sound.play();

                player_point++;
              }
            }
          }
        }
      }
    }

    // render
    draw_rect(imageData.data, 0, 0, width, height, 0xffffffff);
    for (let i = 0; i < particles.length; ++i) {
      if (particles[i].life === true) {
        const c = particles[i].color | clamp(particles[i].life_span * 255, 10, 255);
        // console.log(c);
        draw_rect(imageData.data, cam_offset_x + particles[i].x - (4 * cam_scale_x), cam_offset_y + particles[i].y - (4 * cam_scale_y), 8 * cam_scale_x, 8 * cam_scale_y, c);
      }
    }

    for (let i = 0; i < rainbow_boxs.length; ++i) {
      const rb = rainbow_boxs[i];
      if (rb.life === true) {
        draw_gradien_rect(imageData.data, cam_offset_x + rb.x - (32 * cam_scale_x), cam_offset_y + rb.y - (32 * cam_scale_y), 64 * cam_scale_x, 64 * cam_scale_y);
      }
    }

    for (let i = 0; i < bullets.length; ++i) {
      const b = bullets[i];
      if (b.life) {
        if (b.type == PLAYER_BULLET) {
          const c = bullet_color_for_player | clamp(b.life_span * 255, 10, 255);
          draw_rect(imageData.data, cam_offset_x + b.x - (6 * cam_scale_x), cam_offset_y + b.y - (6 * cam_scale_y), 12 * cam_scale_x, 12 * cam_scale_y, c);
        } else if (b.type == ENEMY_BULLET) {
          const c = enemy_color | clamp(b.life_span * 255, 10, 255);
          draw_rect(imageData.data, cam_offset_x + b.x - (6 * cam_scale_x), cam_offset_y + b.y - (6 * cam_scale_y), 12 * cam_scale_x, 12 * cam_scale_y, c);
        }
      }
    }

    for (let i = 0; i < enemies.length; ++i) {
      const e = enemies[i];
      if (e.life === true) {
        const c = enemy_color;
        if (enemy_can_shoot == i) {
          draw_rect(imageData.data, cam_offset_x + e.x - (12 * cam_scale_x), cam_offset_y + e.y - (12 * cam_scale_y), 24 * cam_scale_x, 24 * cam_scale_y, enemy_color | (Math.round(e.timer_counter * e.timer_counter * 100)) << 24 | (Math.round(e.timer_counter * e.timer_counter * 255)) << 16);
        } else {
          draw_rect(imageData.data, cam_offset_x + e.x - (12 * cam_scale_x), cam_offset_y + e.y - (12 * cam_scale_y), 24 * cam_scale_x, 24 * cam_scale_y, c);
        }
      }
    }

    draw_rect(imageData.data, cam_offset_x + player.pos.x - 16 * cam_scale_x, cam_offset_y + player.pos.y - 16 * cam_scale_y, 32 * cam_scale_x, 32 * cam_scale_y, player_color | 0xff);
    ctx.putImageData(imageData, 0, 0);

    if (player_life != ls_player_life) {
      ls_player_life = player_life;
      on_player_life_change();
    }

    if (player_point != ls_player_point) {
      ls_player_point = player_point;
      on_player_point_change();
    }
  }

  function clamp(val, min, max) {
    if (val < min) return min;
    if (val > max) return max;
    return val;
  }

  function draw_rect(data, x, y, w, h, color) {
    const x0 = clamp(Math.round(x), 0, width);
    const y0 = clamp(Math.round(y), 0, height);
    const x1 = clamp(Math.round(x) + w, 0, width);
    const y1 = clamp(Math.round(y) + h, 0, height);

    for (let row = y0; row < y1; row++) {
      for (let col = x0; col < x1; ++col) {
        const index = col * 4 + (row * width * 4);

        const { r, g, b, a } = { r: (color >> 24) & 0xff, g: (color >> 16) & 0xff, b: (color >> 8) & 0xff, a: (color >> 0) & 0xff };
        data[index + 0] = r;
        data[index + 1] = g;
        data[index + 2] = b;
        data[index + 3] = a;
      }
    }
  }

  function draw_gradien_rect(data, x, y, w, h) {
    const x0 = clamp(Math.round(x), 0, width);
    const y0 = clamp(Math.round(y), 0, height);
    const x1 = clamp(Math.round(x) + w, 0, width);
    const y1 = clamp(Math.round(y) + h, 0, height);

    let c_x = 0;
    let c_y = 0;

    for (let row = y0; row < y1; row++) {
      for (let col = x0; col < x1; ++col) {
        const index = col * 4 + (row * width * 4);
        data[index + 0] = (enemy_color >> 24 & 0xff) | (255 - c_x) % 255;
        data[index + 1] = (enemy_color >> 16 & 0xff) | (c_y) % 255;
        data[index + 2] = (enemy_color >> 8 & 0xff) | (c_y) % 255;
        data[index + 3] = 255;

        c_x += 0.04;
        c_y += 0.04;
      }
    }
  }

  function loop(timestamp) {
    if (prev_timestamp === null) {
      prev_timestamp = timestamp;
    }
    const dt = timestamp - prev_timestamp;
    update_and_render(dt * 0.001);
    prev_timestamp = timestamp;
    window.requestAnimationFrame(loop); // calling loop itself
  }

  window.requestAnimationFrame(loop);
}