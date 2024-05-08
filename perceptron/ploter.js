// @author: makrusali
// this is very simple ploter in javascript
// use this for learning purpose
// no guaranty

// TODO(markusali): cleanup this entire code

function create_simplot(el_canvas) {
  const ctx = el_canvas.getContext("2d");
  let result = {
    ctx: ctx,
    cvs: el_canvas,
    width: el_canvas.width,
    height: el_canvas.height,
    left_padding: 80,
    right_padding: 48,
    top_padding: 16,
    bottom_padding: 64,
      
    draw_text(x, y, text, size = 28, color = "black") {
      this.ctx.font = `${size}px Computer Modern Serif`;
      this.ctx.fillStyle = color;
      this.ctx.fillText(text, x, y);
    },

    draw_relative_haxes(max, step_count) {
      this.ctx.beginPath();
      this.ctx.moveTo(this.left_padding + 0, this.height - this.bottom_padding);
      this.ctx.lineTo(this.width - this.right_padding, this.height - this.bottom_padding);
      this.ctx.stroke();

      const font_size = 16;
      const half_font_size = font_size / 4; // @Hacking: hmm this is not half but 1/4

      const marker_width = 16;

      const incr_x = max / step_count;

      function text_center_offset(x) {
        return (half_font_size * String(x.toFixed(2)).length);
      }

      const y = this.height - 7;

      for (let x = 0;x < max;x += incr_x) {
        const pos_x = this.left_padding - (text_center_offset(x)) + x * ((this.width - this.right_padding - this.left_padding) / max);

        this.ctx.font = `16px Computer Modern Serif`;
        this.ctx.fillStyle = "black";
        this.ctx.fillText(String(x.toFixed(2)), pos_x, y);
        
        // drawing a hline marker
        this.ctx.beginPath();
        this.ctx.moveTo(pos_x + text_center_offset(x), this.height - this.bottom_padding);
        this.ctx.lineTo(pos_x + text_center_offset(x), this.height - this.bottom_padding + marker_width);
        this.ctx.stroke();
      }

      // drawing a last thing
      const pos_x = this.left_padding - (text_center_offset(max)) + max * ((this.width - this.right_padding - this.left_padding) / max);
      this.ctx.font = `16px Computer Modern Serif`;
      this.ctx.fillStyle = "black";
      this.ctx.fillText(String(max.toFixed(2)), pos_x, this.height - 7);
      this.ctx.beginPath();
      this.ctx.moveTo(pos_x + text_center_offset(max), this.height - this.bottom_padding);
      this.ctx.lineTo(pos_x + text_center_offset(max), this.height - this.bottom_padding + marker_width);
      this.ctx.stroke();

    },

    draw_relative_vaxes( max, step_count) {
      this.ctx.beginPath();
      this.ctx.moveTo(this.left_padding + 0, this.top_padding);
      this.ctx.lineTo(this.left_padding + 0, this.height - this.bottom_padding);
      this.ctx.stroke();

      const font_size = 16;

      function text_length_offset(x) {
        return String(x.toFixed(2)).length * font_size / 2; // @Hacking: i don't know yet why is dividing by 2
      }

      const marker_width = 16;
      const incr_y = max / step_count;
      const pos_x = this.left_padding - 28;
      const calc_height = this.height - this.top_padding - this.bottom_padding;

      for (let y = 0;y < max;y += incr_y) {
        const pos_y = this.bottom_padding + (y * calc_height / max);

        this.ctx.font = `16px Computer Modern Serif`;
        this.ctx.fillStyle = "black";
        this.ctx.fillText(String(y.toFixed(2)), pos_x - text_length_offset(y), this.height - pos_y + 7);

        // drawing a vline marker
        this.ctx.beginPath();
        this.ctx.moveTo(this.left_padding, this.height - pos_y);
        this.ctx.lineTo(this.left_padding - marker_width, this.height - pos_y);
        this.ctx.stroke();
      }

      // drawing a last things
      const pos_y = this.bottom_padding + (max * calc_height / max);

      this.ctx.font = `16px Computer Modern Serif`;
      this.ctx.fillStyle = "black";
      this.ctx.fillText(String(max.toFixed(2)), pos_x - text_length_offset(max), this.height - pos_y + 7);

      // drawing a vline marker
      this.ctx.beginPath();
      this.ctx.moveTo(this.left_padding, this.height - pos_y);
      this.ctx.lineTo(this.left_padding - marker_width, this.height - pos_y);
      this.ctx.stroke();
    },
    
    draw_plot(x, y, max_x, max_y, radius = 5) {
      const calc_height = (this.height - this.top_padding - this.bottom_padding); 
      const cacl_width = (this.width - this.left_padding - this.right_padding);
      const pos_x = x * (cacl_width / max_x);
      const pos_y = y * (calc_height / max_y);

      // drawing a circle plot
      ctx.fillStyle = "green"; // color of plot
      ctx.beginPath();
      ctx.arc(this.left_padding + pos_x, this.top_padding + (calc_height - pos_y), radius, 0, 2 * Math.PI);
      ctx.fill();
    },

    draw_linear_line(x0, y0, x1, y1, max_x, max_y) {
      const calc_height = (this.height - this.top_padding - this.bottom_padding); 
      const cacl_width = (this.width - this.left_padding - this.right_padding);
      const pos_x0 = x0 * (cacl_width / max_x);
      const pos_y0 = y0 * (calc_height / max_y);
      const pos_x1 = x1 * (cacl_width / max_x);
      const pos_y1 = y1 * (calc_height / max_y);

      this.ctx.beginPath();
      this.ctx.moveTo(this.left_padding + pos_x0, this.top_padding + (calc_height - pos_y0));
      this.ctx.lineTo(this.left_padding + pos_x1, this.top_padding + (calc_height - pos_y1));
      this.ctx.stroke();
    },

    clear() {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
  };

  return result;
}