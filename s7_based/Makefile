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
	emcc -g3 -gsource-map s7_wasm.c s7/s7.c -o build/main.html -sEXPORTED_FUNCTIONS=_eval_string,_main,_get_out,_get_err -sEXPORTED_RUNTIME_METHODS=cwrap
clean:
	rm -r build/*

test: 
	yarn jest
