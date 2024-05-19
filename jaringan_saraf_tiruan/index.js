window.onload = function () {
    const el_input_count = document.getElementById("input_count");
    const el_rule_selection = document.getElementById("rule_selection");
    const el_input_precission = document.getElementById("input_precission");
    const el_input_reviews = document.getElementById("input_reviews");
    const el_button_process = document.getElementById("button_process");
    const el_result_content = document.getElementById("result_content");
    
    const el_table_initial_value = document.getElementById("table_initial_value");    
    const el_table_input_and_target = document.getElementById("table_input_and_target");
    
    const HEB_RULE = "HEB_RULE";
    const PERCEPTON_RULE = "PERCEPTON_RULE";
    const RULES = [
        HEB_RULE,
        PERCEPTON_RULE,    
    ];
    el_rule_selection.innerHTML = RULES.map(function (rule) { 
        return `<option value="${rule}">${rule}</option>`;
    }).join();
    
        
    let num_of_inputs = 0;
    let global_precission = null;
    let rule = HEB_RULE;
    let num_of_row_inputs = 1;
    
    let inputs  = [[]];
    let targets = [];
    let weights = [];
    let bias    = 0;
    let activation_function_instance = null;

    let raw_activation_function_text = 
    `
if (net < 0) {
    return 0;
} else if (net >= 0) {
    return 1;
}`;
    
    
    for (let row_index = 0; row_index < num_of_row_inputs; ++row_index) {
        targets.push(0);
    }
    
    for (let input_index = 0; input_index < num_of_inputs; ++input_index) {
        weights.push(0);
    }
    
    el_input_count.onkeyup = function (event) {
        num_of_inputs = event.target.value

        if (num_of_inputs > inputs[0].length) {
            const num_of_push = num_of_inputs - inputs[0].length;
            for (let p = 0; p < num_of_push; ++p) {
                weights.push(0);

                for (let row_index = 0; row_index < num_of_row_inputs; ++row_index) {
                    inputs[row_index].push(0);
                }
            }
        } else {
            const num_of_pop = inputs[0].length - num_of_inputs;
            for (let p = 0; p < num_of_pop; ++p) {
                weights.pop();

                for (let row_index = 0; row_index < num_of_row_inputs; ++row_index) {
                    inputs[row_index].pop();
                }
            }
        }
        
        render_table_input_and_target();
    }
    
    el_rule_selection.onchange = function (event) {
        rule = event.target.value
        render_table_input_and_target();
    }
    
    el_input_precission.onkeyup = function (event) {
        global_precission = event.target.value;
        render_table_input_and_target();
    }
    
    window.on_input_change = function (row_index, input_index, value) {
        if (value == "-") { // guard for input negative
            return;
        }
        
        inputs[row_index][input_index] = parseFloat(value);
        render_table_input_and_target();
    }

    window.on_target_change = function (row_index, value) {
        if (value == "-") { // guard for input negative
            return;
        }

        targets[row_index] = parseFloat(value);
        render_table_input_and_target();
    }
    
    window.on_change_bias = function (value) {
        if (value == "-") { // guard for input negative
            return;
        }

        bias = parseFloat(value);
        render_table_input_and_target();
    }
    
    window.on_change_weight = function (input_index, value) {
        if (value == "-") { // guard for input negative
            return;
        }

        weights[input_index] = value;
        render_table_input_and_target();
    } 
    
    window.on_append_row = function (row_index) {
        ++num_of_row_inputs;
        
        if (inputs.length < num_of_row_inputs) {
            const num_of_row_push = num_of_row_inputs - inputs.length;
            
            const p_offset = (inputs.length);
            
            for (let p = 0 + p_offset; p < num_of_row_push + p_offset; ++p) {
                inputs.push([]);
                targets.push(0);
                               
                for (let col_index = 0; col_index < num_of_inputs; ++col_index) {
                    inputs[p].push(0);
                }
            }
        }
        
        weights.push(0);
        
        render_table_input_and_target();
    }
    
    window.on_change_activation_function = function (value) {
        raw_activation_function_text = value;
        
    } 
    
    window.on_remove_row = function (row_index) {
        if (num_of_row_inputs > 0) {
            --num_of_row_inputs;
            
            const num_of_row_pop = inputs.length - num_of_row_inputs;
            
            for (let p = 0; p < num_of_row_pop; ++p) {
                
                const p_index = (inputs.length) - 1;
                                
                for (let col_index = 0; col_index < num_of_inputs; ++col_index) {
                    inputs[p_index].pop();
                }
                
                inputs.pop();
                targets.pop();
            }
            
            weights.pop();
            
            render_table_input_and_target();
        }
        
        
    }
    
    // "rendering" function
    function render_table_input_and_target() {
        let html = "";
        
        // table header
        {
            let table_header = `<thead><tr>`;
            for (let input_index = 0; input_index < num_of_inputs; ++input_index) {
                table_header += `<th> $ X_${input_index+1} $ </th>`;
            }
            table_header += `
                <th> $ Target $ </th>
                <th>Aksi</th>
                <tr></thead>
            `;
               
            html += table_header;
        }
        
        // table body
        {
            let table_body = `<tbody>`;
            for (let row_index = 0; row_index < num_of_row_inputs; ++row_index) {
                table_body += `<tr>`
         
                for (let input_index = 0; input_index < num_of_inputs; ++input_index) {
                    table_body += `<td> 
                        <input 
                            type="text" 
                            value="${inputs[row_index][input_index]}" 
                            onkeyup="on_input_change(${row_index}, ${input_index}, this.value)" /> 
                    </td>`;
                }   
                
                // target input
                table_body += `<td> 
                    <input 
                    type="text" 
                    value="${targets[row_index]}" 
                    onkeyup="on_target_change(${row_index}, this.value)"/> 
                </td>`;
                
                table_body += `                    
                    <td>
                        <button 
                            style="width: 4rem;"
                            onclick="on_append_row(${row_index})"
                            >+</button>
                            
                        <button 
                            style="width: 4rem;"
                            onclick="on_remove_row(${row_index})"
                            >-</button>
                    </td>
                    </tr>
                `;
            }
            table_body += `</tbody>`;            
            html += table_body;
        }
                
        el_table_input_and_target.innerHTML = html;
        
        // @Cleanup
        {
            let html = "";
            
            for (let input_index = 0; input_index < num_of_inputs; ++input_index) {
                html += `
                <tr>
                    <td>
                        $ W_${input_index + 1} \ (bobot 1) $
                    </td>
                    <td>
                        <input type="textr" value="${weights[input_index]}" onkeyup="on_change_weight(${input_index}, this.value)"/>
                    </td>
                </tr>
                `;
            }
            
            
            html += `
            <tr>
                <td>
                    $ b \\ (bias)$
                </td>
                <td>
                    <input type="textr" value="${bias}" onkeyup="on_change_bias(this.value)"/>
                </td>
            </tr>
            
            <tr>
                <td>
                    $ Fungsi Aktifasi $
                </td>
                <td>
                    <textarea rows="10" cols="100"   onkeyup="on_change_activation_function(this.value)">${raw_activation_function_text}</textarea>
                </td>
            </tr>
            `;
                        
            el_table_initial_value.innerHTML = html;            
        }
        
        // @Cleanup
        {
            let html = "";
        
            // table reviews
            html += `
                  <table>
                    <thead>
            `;
            
            for (let input_index = 0; input_index < num_of_inputs; ++input_index) {
                html += `
                        <th> $ X_${input_index + 1} $ </th>
                `;
            }
            
            html += ` 
                <th> $ Target $ </th>
                </thead>
                <tbody> `;
                
            for (let row_index = 0; row_index < num_of_row_inputs; ++row_index) {
                html += `<tr>`;
                for (let input_index = 0; input_index < num_of_inputs; ++input_index) {
                    html += `
                        <td> ${inputs[row_index][input_index]} </td>
                    `;
                }
                
                // target
                html += `
                    <td> ${targets[row_index] } </td>
                `;
                
                html += `</tr>`;
            }
            
            html += `</tbody> </table>`;
            
            // formulas reviews
            html += `
            $
            \\begin{aligned} 
            Rumus
            \\\\ \n
            \\\\ \n
            `;
            
            for (let input_index = 0; input_index < num_of_inputs; ++input_index) {
                html += `
                    W_${input_index + 1} \\ (baru) &= W_${input_index + 1} \\ (lama) + X_${input_index + 1} * y 
                    \\\\ \n
                `;
            }
            
            html += `
                b \\ (baru) &= b \\ (lama) + y                 
            `;

            // @Incomplete            
            // activation function reviews
            html += `
                \\\\ \n
                \\\\ \n
                Nilai Awal 
                \\\\ \n
                \\\\ \n                
            `;
            
            for (let input_index = 0; input_index < num_of_inputs; ++input_index) {
                html += `
                    W_${input_index + 1} = ${weights[input_index]} 
                    \\\\ \n
                `;
            }
            
            html += `
                bias = ${bias} 
                \\\\ \n
            `;
                        
            
            html += `
                \\end{aligned}
            $
            `;
        
            input_reviews.innerHTML = html;
        }
        
        MathJax.typeset();
    }
    
    el_button_process.onclick = function () {
        
        try {                
            activation_function_instance = eval(`(net) => {
                    ${raw_activation_function_text}
            }`);
            
            // process input
            
            let html = "";
            
            for (let row_index = 0; row_index < num_of_row_inputs; ++row_index) {
                html += `<div class="container"> <p> $`;
                for (let input_index = 0; input_index < num_of_inputs; ++input_index) {
                    html += `W_${input_index + 1} = ${weights[row_index]}; `;   
                }
                html += `y = ${targets[row_index]} \\ (target) $ </p>`;
                
                html += `<p> $ Perubahan \\ bobot \\ dan \\ bias \\ untuk \\ data \\ ke-${row_index + 1} \\\\ \n \\\\ \n $ </p> `;
                
                for (let input_index = 0; input_index < num_of_inputs; ++input_index) {
                    const new_weight = weights[input_index] + inputs[row_index][input_index] * targets[row_index];
                    html += `<p> $ W_${input_index + 1} \\ (baru) = W_${input_index + 1} \\ (lama) + X_${input_index + 1} * y = ${weights[input_index]} + ${inputs[row_index][input_index]} * ${targets[row_index]} = ${new_weight} $ </p>`;
                    weights[input_index] = new_weight;
                }
                
                const new_bias = bias + targets[row_index];
                html += `<p> $ bias \\ (baru) = ${bias} + ${targets[row_index]} = ${new_bias} $ </p>`;
                bias = new_bias;
                
                html += `</div>`;
            }
            
            
            // evaluation on function activation
            html += `
            <div style="margin-top: 2rem;"> 
                <h2> Hasil Uji </h2> 
                <table>
                    <thead>
            `;
            
            
            html += `<tr> `;
            for (let input_index = 0; input_index < num_of_inputs; ++input_index) {
                html += `<th> $ X_${input_index + 1} $ </th>`;
            }
            // net
            html += `<th> $ net = \\Sigma_{i=1}^n X_{i} * W_{i} + b $ </th>`;
            // fnet
            html += `<th> $ y = f(net) $ </th>`;
            html += `</tr> </thead>`;
            
            html += `<tbody>`;
            
            let corresspon = true;
                        
            for (let row_index = 0; row_index < num_of_row_inputs; ++row_index) {
                html += `<tr>`;
                for (let input_index = 0; input_index < num_of_inputs; ++input_index) {
                    html += `<td> $ ${inputs[row_index][input_index]} $  </td>`;
                }
                html += `<td> $ `;
                let sum = 0;
                for (let input_index = 0; input_index < num_of_inputs; ++input_index) {
                    sum += inputs[row_index][input_index] * weights[input_index];
                    if (input_index > 0) {
                        html += `+`;
                    }
                    html += ` ${inputs[row_index][input_index]} * ${weights[input_index]} `;
                }
                html += ` + ${bias} = ${sum + bias} $ </td> `;
                
                sum += bias;
                
                const activation_result = activation_function_instance(sum);
                if (activation_result === targets[row_index]) {
                    html += `<td style="background-color: #bfffc1;"> $ ` + activation_result  + ` $ </td>`;
                } else {
                    html += `<td style="background-color: #ffc8c4;"> $ ` + activation_result  + ` $ </td>`;
                    corresspon = false;
                }
                
                html += ` </tr>`;
            }
            
            html += `
                    </tbody>
                </table>
            </div>`;
            
            if (corresspon) {
                html += `<div style="margin-top: 2rem;"> <h2>Hasil Uji sesuai</h2> </div>`;
            } else {
                html += `<div style="margin-top: 2rem;"> <h2>Hasil Uji Tidak sesuai</h2> </div>`;
            }
            
            
            el_result_content.innerHTML = html;            
            MathJax.typeset();

        } catch (e) {
            alert(e);
        }
        
        
        // @Incomplete: custom parser for simple math expression like language        
        // let html = "";
        
        // for (let row_index = 0; row_index < num_of_row_inputs; ++row_index) {
                        
        // }
        
        // el_result_content.innerHTML = html;        
        /*
        function is_whitespace(c) {
            return c === " " || c === "\n" || c === "\t" || c === "\r"
        }
            
        console.log(raw_activation_function_text);
        
        const tokens = [];
        
        const source = raw_activation_function_text;
        const source_len = source.length;
        
        let current = 0;
        while (current < source_len) {
            if (is_whitespace(source[current])) {
                ++current;
                continue;                
            }
            
            let string_buffer = "";
            while(current < source_len && !is_whitespace(source[current])) {
                string_buffer += source[current];
                
                ++current;
            }
            
            tokens.push(string_buffer);
        }
        
        function push_parser_error(errors) {
            // @Incomplete
        }
        
        const statements = [];
        
        for (let token_index = 0; token_index < tokens.length; ) {
            
            
            const result_value = new Number(tokens[token_index]);
            ++token_index;
            
            const is_if_identifier = tokens[token_index] === "jika";
            if (!is_if_identifier) {
                push_parser_error(`GAGAL: setelah nilai kembalian, diharapkan kata kunci 'jika', tetapi malah dapat '${tokens[token_index]}'`);
            }
            ++token_index;
            
            const is_net_operand = tokens[token_index] === "net";
            if (!is_net_operand) {
                push_parser_error(`GAGAL: setelah kata kunci 'jika' diharapkan operand 'net', tetapi malah dapat '${tokens[token_index]}'`);
            }
            ++token_index;
            
            const operator = tokens[token_index];
            ++token_index;
            
            const operand_value = tokens[token_index];
            ++token_index;
            
            let comparation_expression = {
                left_value: "net",
                right_value = parseFloat(operand_value);
                comparator: operator,
                return_value = result_value,
            };            
            
            statements.push(comparation_expression);
        }
        
        console.log({
            tokens: tokens
        });
        
        */
    }
    
    render_table_input_and_target();
}