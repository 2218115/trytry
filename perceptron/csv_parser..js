const parser = {

};

function create_init_parser(csv) {
    return {
        csv: csv,

        parse() {
            let state = 0;

            let x_data_buffer = [];
            let y_data_buffer = [];

            for (let i = 0; i < csv.length; ++i) {
                let c = csv[i];

                switch (state) {
                    case 1: {
                        // grapping header


                        if (c === '\n') {
                            state = 2;
                        }
                    } break;

                }
            }
        }
    };
}