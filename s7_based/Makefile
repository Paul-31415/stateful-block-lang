.PHONY: b clean type test
b: start.ts s_parse.ts build/main.html build/scheme_worker.js build
	yarn esbuild start.ts --bundle --outfile=build/bundle.js --sourcemap
type: *.ts
	yarn tsc
build:
	mkdir build
build/scheme_worker.js:  scheme.js
	yarn esbuild scheme.js --bundle --outfile=build/scheme_worker.js --sourcemap
build/main.html: s7_wasm.c s7/s7.c 
	emcc -g3 -gsource-map s7_wasm.c s7/s7.c -o build/main.html -sEXPORTED_FUNCTIONS=_eval_string,_main,_get_out,_get_err,_s7_object_to_c_string,_s7_type_of,_s7_type_str,_s7_car,_s7_cdr,_s7_boolean,_s7_symbol_name,_s7_string,_s7_real,_s7_real_part,_s7_imag_part -sEXPORTED_RUNTIME_METHODS=cwrap,UTF8ToString --source-map-base s7_wasm.c
clean:
	rm -r build/*

test: 
	yarn jest
