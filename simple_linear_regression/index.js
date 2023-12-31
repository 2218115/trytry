window.onload = () => {
  const el_canvas_plot = document.getElementById("ploting_canvas");
  const plot = create_simplot(el_canvas_plot);

  // @Part: input table stuff
  const el_table_body_input = document.getElementById('table_body_input');

  let input_data_buffer = [];
  init_input_table_event();

  function init_input_table_event() {
    input_data_buffer.push({
      x: 0,
      y: 0,
    });
    render_input_table(el_table_body_input, input_data_buffer);
  }

  function render_input_table(body_element, input_data_buffer) {
    let string_buffer = "";
    let index = 0;

    input_data_buffer.forEach(it => {
      string_buffer += `
      <tr>
        <td>${index + 1}</td>
        <td><input class="input-number" type="number" name="" id="input_table_x_${index}" value="${it.x}" onkeyup="on_keyup_inputx_table(${index})"></td>
        <td><input class="input-number" type="number" name="" id="input_table_y_${index}" value="${it.y}" onkeyup="on_keyup_inputy_table(${index})"></td>
        <td>
          <button class="button-icon" onclick="on_add_input_table_click(${index})">+</button> 
          <button class="button-icon" onclick="on_remove_input_table_click(${index})">-</button>
        </td>
      </tr>`;
      index++;
    });

    body_element.innerHTML = string_buffer;
  }

  // binding the function to global window
  window.on_remove_input_table_click = (index) => {
    if (input_data_buffer.length <= 1) return; 

    input_data_buffer.splice(index, 1);

    render_input_table(el_table_body_input, input_data_buffer);
    update_all_render();
  }

  window.on_add_input_table_click = (index) => {
    input_data_buffer.splice(index + 1, 0, {x: "", y: ""});

    render_input_table(el_table_body_input, input_data_buffer);
    update_all_render();
}

  window.on_keyup_inputx_table = (index) => {
    const el = document.getElementById(`input_table_x_${index}`);
    input_data_buffer[index].x = Number(el.value);
    
    update_all_render();
  }

  window.on_keyup_inputy_table = (index) => {
    const el = document.getElementById(`input_table_y_${index}`);
    input_data_buffer[index].y = Number(el.value);
    
    update_all_render();
  }

  window.on_btn_upload_from_csv = () => {
    // parsing a csv
    // loading to a data buffer 
  }

  window.on_btn_save_to_csv_in_input = () => {
    
  }

  window.on_btn_save_to_csv_in_helping_table = () => {

  }

  // compute value of helping table
  function calc_helping_value(input_data) {
    let result = [];

    input_data.forEach(it => {
      result.push({
        x: it.x,
        xx: it.x * it.x,
        y: it.y,
        yy: it.y * it.y,
        xy: it.x * it.y,
      });
    });

    return result;
  }

  // calculate the helping table value  
  const el_table_body_helping_output = document.getElementById('table_body_helping_output');
 
  function render_helping_output_table(body_element, helping_data) {
    let string_buffer = "";
    let index = 0;

    helping_data.forEach(it => {
      string_buffer += `
      <tr class="table_row">
        <td>${index + 1}</td>
        <td>${it.x}</td>
        <td>${it.y}</td>
        <td>${it.xx}</td>
        <td>${it.yy}</td>
        <td>${it.xy}</td>      
      </tr>`;
      index++;
    });

    // @Nocheckin: recalculation on calc_result_eval_formula(...)
    const sigX = helping_data.map(it => it.x).reduce((a, b) => a + b);
    const sigY = helping_data.map(it => it.y).reduce((a, b) => a + b);
    const sigXX = helping_data.map(it => it.xx).reduce((a, b) => a + b);
    const sigYY = helping_data.map(it => it.yy).reduce((a, b) => a + b);
    const sigXY = helping_data.map(it => it.xy).reduce((a, b) => a + b);
    
    string_buffer += `
      <tr class="table_row">
        <td>$$\\sum{}$$</td>
        <td>${sigX}</td>
        <td>${sigY}</td>
        <td>${sigXX}</td>
        <td>${sigYY}</td>
        <td>${sigXY}</td>      
      </tr>`;

    body_element.innerHTML = string_buffer;

    MathJax.typeset();
  }

  function calc_result_eval_formula(helping_data) {
    const n = helping_data.length;
    const sigX = helping_data.map(it => it.x).reduce((a, b) => a + b);
    const sigY = helping_data.map(it => it.y).reduce((a, b) => a + b);
    const sigXX = helping_data.map(it => it.xx).reduce((a, b) => a + b);
    const sigYY = helping_data.map(it => it.yy).reduce((a, b) => a + b);
    const sigXY = helping_data.map(it => it.xy).reduce((a, b) => a + b);
    const sigXPow = sigX * sigX;
    const sigYPow = sigY * sigY;
    const a = ((sigY * sigXX) - (sigX * sigXY)) / ((n * sigXX) - sigXPow);
    const b = ((n * sigXY) - (sigX * sigY)) / ((n * sigXX) - sigXPow); 
    return {n: n, sigX: sigX, sigY: sigY, sigXX: sigXX, sigYY: sigYY, sigXY: sigXY, sigXPow: sigXPow, sigYPow : sigYPow, a: a, b: b};
  }

  const el_output_formula_a_calculation = document.getElementById("output_formula_a_calculation");
  render_evaluation_formula_calculation(el_output_formula_a_calculation, 12, 1, 2, 3, 4, 32, 12, 123, 32, 2);

  function render_evaluation_formula_calculation (el, er) {
    el.innerHTML = `$$\\begin{aligned} 
    \\\\ a & = \\frac{(\\sum{} Y_{i})(\\sum{} Xi^{2})-(\\sum{} X_{i})(\\sum{} X_{i}Y_{i})}{n \\sum{} X_{i}^2 - (\\sum{} X_{i} )^2} 
    \\\\
    \\\\ a & = \\frac{(${er.sigY})(${er.sigXX})-(${er.sigX})(${er.sigXY})}{${er.n} \\ \\ .\\ ${er.sigXX} - ${er.sigXPow}} 
    \\\\
    \\\\ a & = ${er.a}
    \\\\
    \\\\
    \\\\ b & = \\frac{n (\\sum{} X_{i} Y_{i}) - (\\sum{} X_{i}) (\\sum{} Y_{i})}{n \\sum{} X_{i}^2 - (\\sum{} X_{i})^2}
    \\\\
    \\\\ b & = \\frac{(${er.n}) (${er.sigXY}) - (${er.sigX}) (${er.sigY})}{${er.n} \\ \\ .\\ ${er.sigXX} - ${er.sigXPow}}
    \\\\
    \\\\ b & = ${er.b}
    \\\\
    \\\\
    \\\\
    \\\\ \\hat{Y} & = a + bX
    \\\\
    \\\\ \\hat{Y} & = ${er.a} + ${er.b}\\ \\ .\\ X
    \\end{aligned} $$`; 
    MathJax.typeset(); // update math equation
  };

  function render_plot(eval_result) {
    function find_max(data) {
      let max = 0;

      data.forEach(it => {
        if (it > max) max = it;
      });

      return max;
    }

    function find_min(data) {
      let min = 0xffffffff;

      data.forEach(it => {
        if (it < min) min = it;
      });

      return min;
    }

    const max_x = find_max(input_data_buffer.map(it => it.x));
    const max_y = find_max(input_data_buffer.map(it => it.y));
    const min_x = find_min(input_data_buffer.map(it => it.x));
    const min_y = find_min(input_data_buffer.map(it => it.y));

    function do_linear_regression(X) {
      return eval_result.a + eval_result.b * X;
    }

    const max_span_y = max_y + max_y * 0.2;
    const max_span_x = max_x + max_x * 0.2;

    const min_span_x_in = min_x - min_x * 0.1;
    const max_span_x_in = max_x + max_x * 0.1; 

    plot.clear();
    // plot.draw_text(64, 64, "halo", 28, "green");
    plot.draw_relative_haxes(max_span_x, 8);
    plot.draw_relative_vaxes(max_span_y, 8);
    
    plot.draw_linear_line(min_span_x_in, do_linear_regression(min_span_x_in), max_span_x_in, do_linear_regression(max_span_x_in), max_span_x, max_span_y);
    
    input_data_buffer.forEach(it => {
      plot.draw_plot(it.x, it.y, max_span_x, max_span_y);
    });    
  }

  function update_all_render() {
    const helping_data = calc_helping_value(input_data_buffer);
    const eval_result = calc_result_eval_formula(helping_data);
    render_helping_output_table(el_table_body_helping_output, helping_data);
    render_evaluation_formula_calculation(el_output_formula_a_calculation , eval_result);
    render_plot(eval_result);
  }

  update_all_render();
};