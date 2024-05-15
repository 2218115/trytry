window.onload = function () {
    const el_input_count = document.getElementById("input_count");
    const el_rule_selection = document.getElementById("rule_selection");
    const el_input_precission = document.getElementById("input_precission");
    const el_input_reviews = document.getElementById("input_reviews");
    
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
    }
    
    el_input_precission.onkeyup = function (event) {
        global_precission = event.target.value;
    }
    
    window.on_input_change = function (row_index, input_index, value) {        
        inputs[row_index][input_index] = parseFloat(value);
    }

    window.on_target_change = function (row_index, value) {
        targets[row_index] = parseFloat(value);
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
                            type="number" 
                            value="${inputs[row_index][input_index]}" 
                            onkeyup="on_input_change(${row_index}, ${input_index}, this.value)" /> 
                    </td>`;
                }   
                
                // target input
                table_body += `<td> 
                    <input 
                    type="number" 
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
        
            // table reviews
            
            // formulas reviews
            
            // user_inputs reviews
            
            html = `
            $
                
            $
            `;
        
            input_reviews.innerHTML = html;
        }
        
        MathJax.typeset();
    }
    
    render_table_input_and_target();
}