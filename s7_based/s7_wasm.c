// taken from https://github.com/actondev/s7-playground/blob/master/src/s7_wasm.c
#include "s7/s7.h"

/* #include <stdio.h> */
#include <stdlib.h>

s7_scheme* g_sc = NULL;
s7_pointer g_out, g_err;
char* g_out_str = NULL;


// exported to wasm
const char* eval_string(char* str) {
     // freeing previous string returned from s7
     // either like this, or I should copy everytime in my own global and free
     free(g_out_str);

     // closing.. without having opened?
     // seems to be ok
     s7_close_output_port(g_sc, g_out);
     s7_close_output_port(g_sc, g_err);

     // stdout
     g_out = s7_open_output_string(g_sc);
     s7_set_current_output_port(g_sc, g_out);

     // stderr
     g_err = s7_open_output_string(g_sc);
     s7_set_current_error_port(g_sc, g_err);

     s7_pointer result = s7_eval_c_string(g_sc, str);
     g_out_str = s7_object_to_c_string(g_sc, result);
     return g_out_str;
}

const char* get_out() {
     return s7_get_output_string(g_sc, s7_current_output_port(g_sc));
}

const char* get_err() {
     return s7_get_output_string(g_sc, s7_current_error_port(g_sc));
}





/*
  note for s7.h@164
  young objects being gc-protected could be replaced with a construct
  similar to
  gc_begin_protect_young();
  stuff
  gc_end_protect_young();

  which would be better as brackets or braces macros.

 */



//todo: float32 vector
// for https://github.com/brianreavis/canvas.hdr.js float32 canvas element

/*
typedef struct {
  long w;
  long h;
  long d;
  float* data;
} float32_canvas;

static s7_pointer
*/
#include <emscripten.h>


static s7_pointer addr(s7_scheme * sc, s7_pointer args){
  return s7_make_integer(sc,(s7_int) ((void*) s7_car(args)));
}
static s7_pointer saddr(s7_scheme * sc, s7_pointer args){
  return s7_make_integer(sc,(s7_int) ((void*) sc));
}

static s7_pointer console_log(s7_scheme * sc, s7_pointer args){
  char* res = s7_object_to_c_string(sc,s7_car(args));
  EM_ASM({
      console.log(Module.UTF8ToString($0));
    }, res);
  free(res);
  
  return s7_car(args);
}


const char* s7_type_str(s7_scheme * sc, s7_pointer obj){ return s7_object_to_c_string(sc,s7_type_of(sc,obj));}
//const bool s7_bool(s7_scheme * sc, s7_pointer arg){ return s7_boolean(sc,arg);}

/*

static void s7_to_js_rec(s7_scheme * sc, s7_pointer obj){
  char* typ = s7_object_to_c_string(sc,s7_type_of(sc,obj));
  int cont = EM_ASM_INT({
      return Module.s7_interop.args.cont($0,Module.UTF8ToString($1));
    },(void*) obj,typ);
  free(typ);
  char* content;
  if (cont){
    if (s7_is_pair(obj)) {
      s7_to_js_rec(sc,s7_car(obj));
      s7_to_js_rec(sc,s7_cdr(obj));
    } else if (s7_is_boolean(obj)){
      cont = EM_ASM_INT({return Module.s7_interop.args.cont($0); },s7_boolean(sc,obj));  
    }//unspecified, undefined, and null are fully specified by their type signatures
    else if (s7_is_symbol(obj)){
      cont = EM_ASM_INT({return Module.s7_interop.args.cont(Module.UTF8ToString($0)); },s7_symbol_name(obj));
    }else if (s7_is_string(obj)){
      cont = EM_ASM_INT({return Module.s7_interop.args.cont(Module.UTF8ToString($0)); },s7_string(obj));
    } else if (s7_is_number(obj)){
      if (s7_is_integer(obj)){ //broken, EM_ASM can't take longs (since everything is double in js), so just pass it as a string
	//cont = EM_ASM_INT({return Module.s7_interop.args.cont($0); },s7_integer(obj));
	content = s7_object_to_c_string(sc,obj);
	cont = EM_ASM_INT({return Module.s7_interop.args.cont(Module.UTF8ToString($0)); },content);
	free(content);
      } else if (s7_is_rational(obj)){
	//broken for the same reason
	//cont = EM_ASM_INT({return Module.s7_interop.args.cont($0,$1); },s7_numerator(obj),s7_denominator(obj));
	content = s7_object_to_c_string(sc,obj);
	cont = EM_ASM_INT({return Module.s7_interop.args.cont(Module.UTF8ToString($0)); },content);
	free(content);
      } else if (s7_is_real(obj)){
	cont = EM_ASM_INT({return Module.s7_interop.args.cont($0); },s7_real(obj));	
      } else if (s7_is_complex(obj)){
	cont = EM_ASM_INT({return Module.s7_interop.args.cont($0,$1); },s7_real_part(obj),s7_imag_part(obj));
	/ *} else if (s7_is_bignum(obj)){//perftodo: more efficient bignum sharing
	content = s7_object_to_c_string(sc,obj);
	cont = EM_ASM_INT({return Module.s7_interop.args.cont(Module.UTF8ToString($0)); },content);
	free(content);
	}* /
      } else{
	content = s7_object_to_c_string(sc,obj);
	cont = EM_ASM_INT({return Module.s7_interop.args.cont(Module.UTF8ToString($0)); },content);
	free(content);
      }
      //todo } else if (s7_is_vector(obj)){
      //todo } else if (s7_is_c_pointer(obj)){
      //todo } else if (s7_is_character(obj)){
      //todo } else if (s7_is_hash_table(obj)){
      //todo } else if (s7_is_iterator(obj)){
      //todo } else if (s7_is_let(obj)){
      //todo } else if (s7_is_c_object(obj)){
    } else{
      content = s7_object_to_c_string(sc,obj);
      cont = EM_ASM_INT({return Module.s7_interop.args.cont(Module.UTF8ToString($0)); },content);
      free(content);
    }
  }  
}
*/




static s7_pointer call_js(s7_scheme * sc, s7_pointer args){
  // arglist: (fn_or_string . fnargs)
  EM_ASM({
      Module.s7_interop.fn($0,$1).apply(null,Module.s7_interop.list($0,$2));
    },(void*) sc ,(void*) s7_car(args),(void*) s7_cdr(args));
  return args;
}
static s7_pointer call_js_i(s7_scheme * sc, s7_pointer args){
  // arglist: (fn_or_string . fnargs)
  int rv = EM_ASM_INT({
      return Module.s7_interop.fn($0,$1).apply(null,Module.s7_interop.list($0,$2));
    },(void*) sc ,(void*) s7_car(args),(void*) s7_cdr(args));
  return s7_make_integer(sc,(s7_int) rv);
}
static s7_pointer call_js_d(s7_scheme * sc, s7_pointer args){
  // arglist: (fn_or_string . fnargs)
  double rv = EM_ASM_DOUBLE({
      return Module.s7_interop.fn($0,$1).apply(null,Module.s7_interop.list($0,$2));
    },(void*) sc ,(void*) s7_car(args),(void*) s7_cdr(args));
  return s7_make_real(sc,(s7_double) rv);
}
static s7_pointer call_js_p(s7_scheme * sc, s7_pointer args){
  // arglist: (fn_or_string . fnargs)
  s7_pointer rv = EM_ASM_PTR({
      return Module.s7_interop.fn($0,$1).apply(null,Module.s7_interop.list($0,$2));
    },(void*) sc ,(void*) s7_car(args),(void*) s7_cdr(args));
  return rv;
}

int main() {
     s7_scheme *s7 = g_sc = s7_init();
     g_out = g_err = s7_nil(g_sc);
     s7_define_function(s7, "addr", addr, 1, 0, false, "(addr thing) returns the memory address of thing");
     s7_define_function(s7, "saddr", saddr, 0, 0, false, "(saddr) returns the memory address of the scheme");
     s7_define_function(s7, "console.log", console_log, 1, 0, true, "(console.log thing) prints and returns thing");
     s7_define_function(s7, "call-js", call_js, 1, 0, true, "(call-js thing . args) calls thing(..args), returns (thing . args)");
     s7_define_function(s7, "call-js-i", call_js_i, 1, 0, true, "(call-js thing . args) calls thing(..args), returns an int32");
     s7_define_function(s7, "call-js-d", call_js_d, 1, 0, true, "(call-js thing . args) calls thing(..args), returns a double");
     s7_define_function(s7, "call-js-p", call_js_p, 1, 0, true, "(call-js thing . args) calls thing(..args), returns a scheme object");
     return 0;
}

