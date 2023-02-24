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
	emcc -g3 -gsource-map s7_wasm.c s7/s7.c -o build/main.html -sEXPORTED_FUNCTIONS=_eval_string,_eval_string_to_obj,_main,_get_out,_get_err,_s7_object_to_c_string,_s7_type_of,_s7_type_str,_s7_car,_s7_cdr,_s7_boolean,_s7_symbol_name,_s7_string,_s7_real,_s7_real_part,_s7_imag_part,_s7_gc_protect,_s7_gc_unprotect_at,_s7_gc_protected_at,_s7_gc_protect_via_stack,_s7_gc_unprotect_via_stack,_s7_gc_protect_via_location,_s7_gc_unprotect_via_location,_s7_gc_on,_s7_f,_s7_t,_s7_nil,_s7_undefined,_s7_unspecified,_s7_eof_object,_s7_make_string,_s7_make_real,_s7_make_complex,_s7_cons,_s7_make_c_pointer,_s7_make_c_pointer_with_type,_s7_make_symbol,_s7_set_car,_s7_set_cdr,_s7_call_with_location,_clear_stdout_stderr,_make_js_ref,_s7_symbol_set_value,_s7_symbol_local_value,_s7_symbol_value,_s7_eval_with_location,_s7_define_variable_with_documentation,_s7_closure_let,_s7_define -sEXPORTED_RUNTIME_METHODS=cwrap,UTF8ToString --source-map-base s7_wasm.c
clean:
	rm -r build/*

test: 
	yarn jest
