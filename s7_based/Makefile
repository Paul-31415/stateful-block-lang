
main.html: s7_wasm.c s7/s7.c
	emcc -g3 -gsource-map s7_wasm.c s7/s7.c -o main.html -sEXPORTED_FUNCTIONS=_eval_string,_main,_get_out,_get_err -sEXPORTED_RUNTIME_METHODS=cwrap
clean:
	rm main.html
