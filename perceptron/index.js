window.onload = () => {
    const el_perhitungan_results = document.getElementById("perhitungan_results");

    let   global_precission = 2;    
    let   html_buffer = "";    
    let   value_of_b = 0;
    let   value_of_w = [0, 0];
    const learning_rate = 0.8;
    const treshold = 0.5;
    const datas = [
        {
            inputs: [0, 0],
            target: -1,
        },
        {
            inputs: [0, 1],
            target: -1,
        },
        {
            inputs: [1, 0],
            target: -1,
        },
        {
            inputs: [1, 1],
            target: 1,
        },        
    ];
        
    function round_with(a) {
        const pow = Math.pow(10, global_precission);
        return Math.round((a + Number.EPSILON) * pow) / pow;
    }
        
    function assert(v) {
        if (v === false || v === undefined || v === null) {
            throw Error("fail..");
        }
    }

    function min(a, b) {
        if (a < b) return a;
        return b;
    }
        
    function sum_of_inputs_times_weigths(inputs, weights) {
        assert(inputs.length === weights.length);
        html_buffer += `&=`;
        let result = 0;
        for (let i = 0; i < min(inputs.length, weights.length); ++i) {
            result += round_with(inputs[i] * weights[i]);
            html_buffer += `${inputs[i]} * ${weights[i]} + `;
        }
        
        return result;
    }
    
    let find_count = 1000;
    
    let current_epoch = 1;
    while(true) {
                
        let all_correct_for_target = true;
        
        const count_of_datas = datas.length;
        for (let data_index = 0; data_index < count_of_datas; ++data_index) {
            const data = datas[data_index];            
            html_buffer += `
            <div class="border-container" style="margin-bottom: 2rem;">
                  <h3>Epoch ${current_epoch} - data ke ${data_index + 1}</h3>
                  <p>
                  ${"$"}
                  \\begin{aligned}                   
                    net &= \\Sigma_{1}^n X_i W_i + b \\\\ 
            `;
            

            // sum
            const net = round_with(sum_of_inputs_times_weigths(data.inputs, value_of_w) + value_of_b);
            html_buffer += `
                ${value_of_b}\\\\
                
                net &= ${net}
                    
                \\\\
                \\\\
            `;
            
            html_buffer += `
             y &=
                \\begin{cases}
                  1, & \\ net> ${treshold} \\\\
                  0, & \\ -${treshold} \\leqslant net \\leqslant ${treshold} \\\\
                  -1, & \\ net < -${treshold}
                \\end{cases}
                
                \\\\
            `;
            
            
            // activation
            let y = null; 
            if (net < -treshold) {
                y = -1;
            } else if (-treshold <= net && net <= treshold) {
                y = 0;            
            } else  {
                y = 1;
            }
               
            assert(y !== null);
            
            if (y != data.target) {
                
                html_buffer += `
                y &= ${y} \\; {(tidak \\ sama \\ dengan \\ target)} \\; dimana \\ target \\ ${data.target}\\\\
                `;
                
                all_correct_for_target = false;
                
                // calculate the new weights and new bias
                for (let input_index = 0; input_index < min(data.inputs.length, value_of_w.length); ++input_index) {
                    
                    const new_w = round_with(value_of_w[input_index] + learning_rate * data.target * data.inputs[input_index]);
                                        
                    html_buffer += `                      
                        \\\\
                        \\\\
                        
                        W_${input_index + 1} baru &= W_${input_index + 1}lama + \\alpha * t * X_${input_index + 1} \\\\
                                &= ${value_of_w[input_index]} + ${learning_rate} * ${data.target} * ${data.inputs[input_index]} \\\\
                                &= ${value_of_w[input_index]} + ${round_with(learning_rate * data.target)} * ${data.inputs[input_index]}\\\\
                                &= ${value_of_w[input_index]} + ${round_with(learning_rate * data.target * data.inputs[input_index])} \\\\
                                &= ${new_w} \\\\
                    `;
                    
                    value_of_w[input_index] = new_w;                
                }
                
                // b
                const new_b = round_with(value_of_b +  learning_rate * data.target); 

                html_buffer += `
                 b_{baru}&= b_{lama} + \\alpha * t \\\\
                        &= ${value_of_b} + ${learning_rate} * ${data.target} \\\\
                        &= ${value_of_b} + ${round_with(learning_rate * data.target)}\\\\
                        &= ${new_b} \\\\
                \\\\
                `;

                value_of_b = new_b;
                
                   
            } else {
                html_buffer += `
                y &= ${y} \\; {(sama \\ dengan \\ target)} \\; dimana \\ target \\ ${data.target}\\\\
                `;            
            }
            
            html_buffer += `
              \\end{aligned}
                $
             </p>
          </div>
            `;
            
        }
        
        if (all_correct_for_target) {
            break;
        }
        
        current_epoch += 1;
        if (--find_count == 0) {
            break;
        }
    }
    
    console.log(value_of_w);
    console.log(value_of_b);
    
    html_buffer += `<div class="container pop-up"> <h2>Final Epoch: ${current_epoch} </h2></div>`
    
    el_perhitungan_results.innerHTML = html_buffer; 
    MathJax.typeset(); 
};