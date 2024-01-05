// TODO(makrusali): 
//
//
//
//

// simple and stuppid wrapper
function bind(id) {
    return document.getElementById(id);
}

window.onload = () => {
    // dom
    // const el_button_hitung = document.getElementById("button_hitung");
    const el_input_kebutuhan = document.getElementById("input_kebutuhan");
    const el_input_harga_bahan_baku = document.getElementById("input_harga_bahan_baku");
    const el_input_biaya_pesan = document.getElementById("input_biaya_pesan");
    const el_input_biaya_simpan = document.getElementById("input_biaya_simpan");
    const el_form_input = document.getElementById("form_input");
    const el_input_lama_kebutuhan = document.getElementById("lama_kebutuhan");
    const el_sumary_kebutuhan = document.getElementById("input_kebutuhan_result");
    const el_unit_biaya_simpan = document.getElementById("unit_biaya_simpan");
    const el_summary_biaya_simpan = document.getElementById("biaya_simpan_result");
    const el_safety_stock = document.getElementById("input_safety_stock");
    const el_lead_time = document.getElementById("input_lead_time");
    const el_unit_lead_time = document.getElementById("lead_time_unit");
    const el_sumary_lead_time = document.getElementById("lead_time_result")
    // const el_unit_safety_stock = document.getElementById("safety_stock_unit");
    // const el_summary_safety_stock = document.getElementById("safety_stock_result");

    let hitunged = false;

    let input_kebutuhan = 0;
    let input_kebutuhan_selama = "Hari";
    let input_harga_bahan = 0;
    let input_biaya_pesan = 0;
    let input_biaya_simpan = 0;
    let unit_biaya_simpan = "Unit";
    let safety_stock = 0;
    let unit_safety_stock = "hari";
    let waktu_tunggu = 0;
    let unit_waktu_tunggu = "Hari";

    let input_valid = true;

    // binding event
    el_form_input.onsubmit = (e) => {
        e.preventDefault();
        hitunged = true;

        eval_calculation();
        update_calculation();
    }

    el_input_kebutuhan.onkeyup = (e) => {
        input_kebutuhan = Number(e.target.value);
        if (isNaN(input_kebutuhan)) {
            document.getElementById("input_kebutuhan_error_message").style.display = "block";
            return;
        }
        document.getElementById("input_kebutuhan_error_message").style.display = "none";

        update_summary_kebutuhan();
    }
    el_input_lama_kebutuhan.onchange = (e) => {
        input_kebutuhan_selama = e.target.value;
        update_summary_kebutuhan();
    }
    function update_summary_kebutuhan() {
        el_sumary_kebutuhan.value = `${input_kebutuhan.toLocaleString()} Selama 1 ${input_kebutuhan_selama}`;
    }

    el_input_harga_bahan_baku.onkeyup = (e) => {
        input_harga_bahan = Number(e.target.value);
        if (isNaN(input_harga_bahan)) {
            document.getElementById("input_harga_bahan_baku_error_message").style.display = "block";
            return;
        }
        document.getElementById("input_harga_bahan_baku_error_message").style.display = "none";
    }

    el_input_biaya_simpan.onkeyup = (e) => {
        input_biaya_simpan = Number(e.target.value);
        if (isNaN(input_biaya_simpan)) {
            document.getElementById("input_biaya_simpan_error_message").style.display = "block";
            return;
        }
        document.getElementById("input_biaya_simpan_error_message").style.display = "none";
        update_summary_biaya_simpan();
    }
    el_unit_biaya_simpan.onchange = (e) => {
        unit_biaya_simpan = e.target.value;
        update_summary_biaya_simpan();
    }
    function update_summary_biaya_simpan() {
        el_summary_biaya_simpan.value = `${input_biaya_simpan.toLocaleString()}${(unit_biaya_simpan.includes("Rata-rata persediaan") ? "%" : "")} per ${unit_biaya_simpan}`;
    }


    el_input_biaya_pesan.onkeyup = (e) => {
        input_biaya_pesan = Number(e.target.value);
        if (isNaN(input_biaya_pesan)) {
            document.getElementById("input_biaya_pesan_error_message").style.display = "block";
            return;
        }
        document.getElementById("input_biaya_pesan_error_message").style.display = "none";
    }


    el_safety_stock.onkeyup = (e) => {
        safety_stock = Number(e.target.value);
        if (isNaN(safety_stock)) {
            bind("input_safety_stock_error_message").style.display = "block";
            return;
        }
        bind("input_safety_stock_error_message").style.display = "none";
        // update_summary_safety_stock();
    }
    // el_unit_safety_stock.onchange = (e) => {
    //     unit_safety_stock = e.target.value;
    //     update_summary_safety_stock();
    // }
    // function update_summary_safety_stock() {
    //     el_summary_safety_stock.innerHTML = `${safety_stock.toLocaleString()} selama ${unit_safety_stock}`;
    // }

    el_lead_time.onkeyup = (e) => {
        waktu_tunggu = e.target.value;
        if (isNaN(waktu_tunggu)) {
            bind("input_lead_time_error_message").style.display = "block";
        }
        bind("input_lead_time_error_message").style.display = "none";
        update_summary_lead_time();
    }
    el_unit_lead_time.onchange = (e) => {
        unit_waktu_tunggu = e.target.value;
        update_summary_lead_time();
    }
    function update_summary_lead_time() {
        el_sumary_lead_time.value = `${waktu_tunggu.toLocaleString()} ${unit_waktu_tunggu}`;
    }

    const el_eval_result = document.getElementById("eval_result");

    // copy n pasta from local function eval_calculation
    function R_per_bulan(lama) {
        if (lama == "Hari") {
            return input_kebutuhan * 30;
        }
        if (lama == "Bulan") {
            return input_kebutuhan;
        }
        if (lama == "Tahun") {
            return input_kebutuhan / 12;
        }
    }

    function Lead_Time_per_bulan() {
        if (unit_waktu_tunggu == "Hari") {
            return waktu_tunggu / 30;
        }
        if (unit_waktu_tunggu == "Bulan") {
            return waktu_tunggu;
        }
    }

    function eval_sqrt_for_eoq() {
        if (unit_biaya_simpan === "Unit") {
            return (2 * R_per_tahun(input_kebutuhan_selama)() * input_biaya_pesan) / (input_biaya_simpan);
        } else {
            return (2 * R_per_tahun(input_kebutuhan_selama) * input_biaya_pesan) / (input_harga_bahan * (input_biaya_simpan / 100));
        }
    }

    function eval_result_for_eoq() {
        return Math.sqrt(eval_sqrt_for_eoq());
    }


    function kebutuhan_selama(lama) {
        if (lama == "Hari") {
            return `selama 1 Hari, ${input_kebutuhan * 30} selama 1 Bulan, ${input_kebutuhan * 30 * 12} selama 1 Tahun`;
        }
        if (lama == "Bulan") {
            return `selama 1 Bulan, ${(input_kebutuhan / 30).toFixed(2)} selama 1 Hari, ${input_kebutuhan * 12} selama 1 Tahun`;
        }
        if (lama == "Tahun") {
            return `selama 1 Tahun, ${(input_kebutuhan / 12).toFixed(2)} selama 1 Bulan, ${(input_kebutuhan / 12 / 30).toFixed(2)} selama 1 Hari,`;
        }
    }

    function R_per_tahun(lama) {
        if (lama == "Hari") {
            return input_kebutuhan * 30 * 12;
        }
        if (lama == "Bulan") {
            return input_kebutuhan * 12;
        }
        if (lama == "Tahun") {
            return input_kebutuhan;
        }
    }


    function eval_result_for_barang_unit_lead_time() {
        return R_per_bulan(input_kebutuhan_selama) * Lead_Time_per_bulan();
    }

    function eval_result_for_rop() {
        return safety_stock + eval_result_for_barang_unit_lead_time(waktu_tunggu);
    }


    function eval_calculation() {
        if (!input_valid) {
            alert("Masukkan data yang di berikan masih ada yang belum valid, mohon periksa");
            return;
        }

        function eval_buffer_append_for_eoq() {
            if (unit_biaya_simpan === "Unit") {
                eval_buffer += `
EOQ = akar((2 * R * O) / (C))
EOQ = akar((2 * ${R_per_tahun(input_kebutuhan_selama).toLocaleString()} * ${input_biaya_pesan.toLocaleString()}) / (${input_biaya_simpan.toLocaleString()})) = akar(${eval_sqrt_for_eoq().toLocaleString()}) = ${eval_result_for_eoq().toLocaleString()}            
    `;
            } else {
                eval_buffer += `
EOQ = akar((2 * R * O) / (P * I))
EOQ = akar((2 * ${R_per_tahun(input_kebutuhan_selama).toLocaleString()} * ${input_biaya_pesan.toLocaleString()}) / (${input_harga_bahan.toLocaleString()} * ${(input_biaya_simpan.toLocaleString())}%)) = akar(${eval_sqrt_for_eoq().toLocaleString()}) = ${eval_result_for_eoq().toLocaleString()}            
                   

Lead Time = Waktu Tunggu * Penggunaan Unit Barang Per Bulan
Lead Time = ${unit_waktu_tunggu == "Hari" ? `(${waktu_tunggu} Hari >> ${Lead_Time_per_bulan()} Bulan) * ${R_per_bulan(input_kebutuhan_selama)}` : `${Lead_Time_per_bulan()} Bulan * ${R_per_bulan(input_kebutuhan_selama)}`}

ROP = Safety Stock + Lead Time
ROP = ${safety_stock} + ${eval_result_for_barang_unit_lead_time(waktu_tunggu)}
ROP = ${eval_result_for_rop()}
`;
            }


        }

        let eval_buffer = "";

        eval_buffer = `
Diketahui

R = ${input_kebutuhan} ${kebutuhan_selama(input_kebutuhan_selama)}
O = ${input_biaya_pesan}
P = ${input_harga_bahan}
${unit_biaya_simpan === "Unit" ? `C = ${input_biaya_simpan} Per Unit` : `I = ${input_biaya_simpan}% Per Persediaan`}
`;
        eval_buffer_append_for_eoq();

        el_eval_result.innerHTML = eval_buffer;


        render_graph();
    }

    function update_calculation() {
        // hitung eoq
        const eoq = Math.sqrt((2 * input_kebutuhan * input_biaya_pesan) / (input_harga_bahan * (input_biaya_simpan / 100)));
        console.log(eoq);
    }

    // canvas_graph rendering

    function render_graph() {


        const graph_canvas = document.getElementById("graph_canvas");
        const width = graph_canvas.width;
        const height = graph_canvas.height;
        const ctx_graph_canvas = graph_canvas.getContext("2d");
        ctx_graph_canvas.clearRect(0, 0, width, height);

        const Persediaan = eval_result_for_eoq();
        const A = eval_result_for_eoq();
        const B = safety_stock;
        const SafetyStock = safety_stock;
        const E = 0.5 * Persediaan;
        const F = Persediaan;
        const EF = 120 - (Lead_Time_per_bulan() * (120 / 30)); // lead time
        const C = eval_result_for_rop();// reorder point

        // draw a axis line
        const padding_left = 16;
        const padding_right = 16;
        const padding_bottom = 16;
        const padding_top = 64;

        const space_for_left_text = 120;
        const space_for_right_text = 64;
        const space_for_bottom_text = 64;

        const begin_x = padding_left + space_for_left_text + 0;
        const x_width = begin_x + 200;
        const original_width = 200;

        const line_height_after_stuff = height - (padding_top + padding_bottom + space_for_bottom_text);
        const persediaan_per_height = line_height_after_stuff / Persediaan;

        const drawing_count = 3;

        ctx_graph_canvas.strokeStyle = "black";
        // horizontal axis
        ctx_graph_canvas.beginPath();
        ctx_graph_canvas.moveTo(padding_left + space_for_left_text, height - (padding_bottom + space_for_bottom_text));
        ctx_graph_canvas.lineTo(width - (padding_left + space_for_right_text), height - (padding_bottom + space_for_bottom_text));
        ctx_graph_canvas.stroke();
        // vertical axis
        ctx_graph_canvas.beginPath();
        ctx_graph_canvas.moveTo(padding_left + space_for_left_text, padding_top);
        ctx_graph_canvas.lineTo(padding_left + space_for_left_text, height - (padding_bottom + space_for_bottom_text));
        ctx_graph_canvas.stroke();

        const c_param = EF; // lead time

        // utility for font
        let font_size = 32; // in pixel
        const calc_font_center_offset_x = (text) => {
            return ((text.length) * font_size) / 3;
        }
        const calc_font_center_offset_y = () => {
            return (font_size / 3);
        }

        const dy = ((A * persediaan_per_height + padding_bottom + space_for_bottom_text) - (B * persediaan_per_height + padding_bottom + space_for_bottom_text));
        let dx = x_width - begin_x;
        let m = -dy / dx;

        for (let i = 0; i < drawing_count; ++i) {
            const x = begin_x + (original_width * i);
            const x_plus_width = x_width + (original_width * i);

            dx = x_plus_width - x;
            m = -dy / dx;

            ctx_graph_canvas.beginPath();
            ctx_graph_canvas.moveTo(x, height - (A * persediaan_per_height + padding_bottom + space_for_bottom_text));
            ctx_graph_canvas.lineTo(x_plus_width, height - (B * persediaan_per_height + padding_bottom + space_for_bottom_text));
            ctx_graph_canvas.stroke();

            ctx_graph_canvas.beginPath();
            ctx_graph_canvas.moveTo(x, height - (SafetyStock * persediaan_per_height + padding_bottom + space_for_bottom_text));
            ctx_graph_canvas.lineTo(x_plus_width, height - (SafetyStock * persediaan_per_height + padding_bottom + space_for_bottom_text));
            ctx_graph_canvas.stroke();

            // in order 2 draw a vertical line
            if (i > 0) {
                ctx_graph_canvas.beginPath();
                ctx_graph_canvas.moveTo(x, height - (A * persediaan_per_height + padding_bottom + space_for_bottom_text));
                ctx_graph_canvas.lineTo(x, height - (B * persediaan_per_height + padding_bottom + space_for_bottom_text));
                ctx_graph_canvas.stroke();
            }



            if (i == 0) {
                // vertical dash line
                // begin line dash
                ctx_graph_canvas.setLineDash([8, 5]);

                // drawing c
                // drawing a vertical line

                ctx_graph_canvas.beginPath();
                ctx_graph_canvas.moveTo(x + c_param, height - ((A * persediaan_per_height + padding_bottom + space_for_bottom_text) + c_param * m));
                ctx_graph_canvas.lineTo(x + c_param, height - ((B * persediaan_per_height + padding_bottom + space_for_bottom_text)) + (SafetyStock * persediaan_per_height));
                ctx_graph_canvas.stroke();

                // horizontal line
                ctx_graph_canvas.beginPath();
                ctx_graph_canvas.moveTo(x, height - ((A * persediaan_per_height + padding_bottom + space_for_bottom_text) + c_param * m));
                ctx_graph_canvas.lineTo(x + c_param, height - ((A * persediaan_per_height + padding_bottom + space_for_bottom_text) + c_param * m));
                ctx_graph_canvas.stroke();

                ctx_graph_canvas.beginPath();
                ctx_graph_canvas.moveTo(x + 200, height - ((A * persediaan_per_height + padding_bottom + space_for_bottom_text) + 200 * m));
                ctx_graph_canvas.lineTo(x + 200, height - ((B * persediaan_per_height + padding_bottom + space_for_bottom_text)) + (SafetyStock * persediaan_per_height));
                ctx_graph_canvas.stroke();

                // reset line dash
                ctx_graph_canvas.setLineDash([]);
            }


            ctx_graph_canvas.beginPath();
            ctx_graph_canvas.moveTo(x, height - (A * persediaan_per_height + padding_bottom + space_for_bottom_text));
            ctx_graph_canvas.lineTo(x_plus_width, height - (B * persediaan_per_height + padding_bottom + space_for_bottom_text));
            ctx_graph_canvas.stroke();

            ctx_graph_canvas.beginPath();
            ctx_graph_canvas.moveTo(x, height - (SafetyStock * persediaan_per_height + padding_bottom + space_for_bottom_text));
            ctx_graph_canvas.lineTo(x_plus_width, height - (SafetyStock * persediaan_per_height + padding_bottom + space_for_bottom_text));
            ctx_graph_canvas.stroke();
        }

        // fill text
        ctx_graph_canvas.font = `${font_size}px 'Computer Modern Serif'`;
        ctx_graph_canvas.fillText("A", padding_left + space_for_left_text - calc_font_center_offset_x("A") * 4, height - (A * persediaan_per_height + padding_bottom + space_for_bottom_text) + calc_font_center_offset_y());
        ctx_graph_canvas.fillText("B", padding_left + space_for_left_text - calc_font_center_offset_x("B") * 4, height - (B * persediaan_per_height + padding_bottom + space_for_bottom_text) + calc_font_center_offset_y());

        const text_c_padding_left = 6;
        ctx_graph_canvas.fillText("C", begin_x + c_param + text_c_padding_left, height - ((A * persediaan_per_height + padding_bottom + space_for_bottom_text) + c_param * m));

        const text_d_padding_left = 6;
        const text_d_padding_bottom = 6;
        ctx_graph_canvas.fillText("D", x_width + text_d_padding_left, height - (B * persediaan_per_height + padding_bottom + space_for_bottom_text + text_d_padding_bottom));

        ctx_graph_canvas.fillText("E", begin_x + c_param - calc_font_center_offset_x("E"), height - (padding_bottom + space_for_bottom_text) + calc_font_center_offset_y() * 4);

        ctx_graph_canvas.fillText("F", begin_x + 200 - calc_font_center_offset_x("E"), height - (padding_bottom + space_for_bottom_text) + calc_font_center_offset_y() * 4);

        const text_safety_stock_padding_left = 250;
        const text_safety_stock_padding_bottom = 19;

        font_size = 16;
        ctx_graph_canvas.font = `${font_size}px 'Computer Modern Serif'`;

        if (safety_stock < (Persediaan * 0.1)) {
            ctx_graph_canvas.fillText(`Safety Stock = ${SafetyStock.toLocaleString()}`, padding_left + space_for_left_text + text_safety_stock_padding_left, height - (padding_bottom + space_for_bottom_text) + calc_font_center_offset_y() * 4);
        } else {
            ctx_graph_canvas.fillText(`Safety Stock = ${SafetyStock.toLocaleString()}`, padding_left + space_for_left_text + text_safety_stock_padding_left, height - (padding_bottom + space_for_bottom_text) - text_safety_stock_padding_bottom);
        }
        // A
        ctx_graph_canvas.fillText(Persediaan.toLocaleString(), padding_left, height - (A * persediaan_per_height + padding_bottom + space_for_bottom_text) + calc_font_center_offset_y());
        // B
        ctx_graph_canvas.fillText(SafetyStock.toLocaleString(), padding_left, height - (B * persediaan_per_height + padding_bottom + space_for_bottom_text) + calc_font_center_offset_y());
        // C
        ctx_graph_canvas.fillText(C.toLocaleString(), padding_left, height - ((A * persediaan_per_height + padding_bottom + space_for_bottom_text) + c_param * m) + calc_font_center_offset_y());

        // Lead Time

        function lerp(t, A, B) {
            return t * A + (1 - t) * B;
        }

        const string_lead_time = `${waktu_tunggu} ${unit_waktu_tunggu}`;
        ctx_graph_canvas.fillText(string_lead_time, lerp(0.5, begin_x + c_param - calc_font_center_offset_x("E"), begin_x + 200 - calc_font_center_offset_x("E")) - (calc_font_center_offset_x(string_lead_time) * 0.5), height - (padding_bottom + space_for_bottom_text) + calc_font_center_offset_y() * 12);

    }

}
