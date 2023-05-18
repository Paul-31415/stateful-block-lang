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


const s7_pointer eval_string_to_obj(char* str) {
     s7_close_output_port(g_sc, g_out);
     s7_close_output_port(g_sc, g_err);

     // stdout
     g_out = s7_open_output_string(g_sc);
     s7_set_current_output_port(g_sc, g_out);

     // stderr
     g_err = s7_open_output_string(g_sc);
     s7_set_current_error_port(g_sc, g_err);

     s7_pointer result = s7_eval_c_string(g_sc, str);
     return result;
}
  

const void clear_stdout_stderr() {
     s7_close_output_port(g_sc, g_out);
     s7_close_output_port(g_sc, g_err);

     // stdout
     g_out = s7_open_output_string(g_sc);
     s7_set_current_output_port(g_sc, g_out);

     // stderr
     g_err = s7_open_output_string(g_sc);
     s7_set_current_error_port(g_sc, g_err);
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


static s7_pointer eval_js(s7_scheme * sc, s7_pointer args){
  // arglist: (fn_or_string . fnargs)
  s7_pointer rv = EM_ASM_PTR({
      return Module.s7_interop.to_sc($0,Module.s7_interop.fn($0,$1));
    },(void*) sc ,(void*) s7_car(args));
  return rv;
}







/*typedef struct {
  s7_pointer index;
  } js_ref;*/

static int js_ref_type_tag = 0;

static s7_pointer js_ref_to_string(s7_scheme *sc, s7_pointer args)
{
  //js_ref *o = (js_ref *)s7_c_object_value(s7_car(args));  
  s7_pointer result = EM_ASM_PTR({
      return Module.s7_interop.to_sc($0,'<js '+Module.s7_interop.lookupJsObject($0,$1)+'>');
    },sc,s7_car(args));// o->index);
  return(result);
}

static s7_pointer free_js_ref(s7_scheme *sc, s7_pointer obj)
{
  EM_ASM({
      Module.s7_interop.freeJsObject($0,$1);
    },sc,obj);//((js_ref*)obj)->index);
  //free(s7_c_object_value(obj));
  return(NULL);
}
static s7_pointer mark_js_ref(s7_scheme *sc, s7_pointer obj)
{
  return (NULL);
  //js_ref *o = (js_ref *)s7_c_object_value(obj);
  //s7_mark(o->data);
}
const s7_pointer make_js_ref(s7_scheme *sc, s7_pointer args)
{
  s7_pointer r = s7_make_c_object(sc, js_ref_type_tag, 0);
  if (!s7_is_null(sc,args)){
    EM_ASM({
	Module.s7_interop.registerJsObject($0,$2,Module.s7_interop.to_js($0,$1));
      },(void*) sc ,(void*) s7_car(args),r);
  }else{
    EM_ASM({
	Module.s7_interop.registerJsObject($0,$1,undefined);
      },(void*) sc ,r);
  }
  return r;
}
static s7_pointer is_js_ref(s7_scheme *sc, s7_pointer args)
{
  return(s7_make_boolean(sc, 
			 s7_is_c_object(s7_car(args)) &&
			 s7_c_object_type(s7_car(args)) == js_ref_type_tag));
}
static s7_pointer js_ref_typeof(s7_scheme *sc, s7_pointer args)
{
  return EM_ASM_PTR({
      return Module.s7_interop.to_sc($0,typeof Module.s7_interop.lookupJsObject($0,$1));
    },sc,s7_car(args));
}


static s7_pointer js_ref_data(s7_scheme *sc, s7_pointer args)
{
  return EM_ASM_PTR({
      return Module.s7_interop.to_sc($0,Module.s7_interop.lookupJsObject($0,$1));
    },sc,s7_car(args));
}
static s7_pointer set_js_ref_data(s7_scheme *sc, s7_pointer args)
{
  EM_ASM({
      Module.s7_interop.registerJsObject($0,$1,Module.s7_interop.to_js($0,$2));
    },sc,s7_car(args),s7_cadr(args));
  return s7_car(args);
}


static s7_pointer js_ref_member(s7_scheme *sc, s7_pointer args)
{
  return EM_ASM_PTR({
      return Module.s7_interop.to_sc($0,Module.s7_interop.lookupJsObject($0,$1)[Module.s7_interop.to_js($0,$2)]);
    },sc,s7_car(args),s7_cadr(args));
}
static s7_pointer set_js_ref_member(s7_scheme *sc, s7_pointer args)
{
  EM_ASM({
      Module.s7_interop.lookupJsObject($0,$1)[Module.s7_interop.to_js($0,$2)] = Module.s7_interop.to_js($0,$3);
    },sc,s7_car(args),s7_cadr(args),s7_caddr(args));
  return s7_car(args);
}
static s7_pointer js_ref_method(s7_scheme *sc, s7_pointer args)
{
  return EM_ASM_PTR({
      let o = Module.s7_interop.lookupJsObject($0,$1);
      let f = o[Module.s7_interop.to_js($0,$2)];
      if (typeof f === 'function'){
	f = f.bind(o);
      }
      return Module.s7_interop.to_sc($0,f);
    },sc,s7_car(args),s7_cadr(args));
}



static s7_pointer js_ref_is_equal(s7_scheme *sc, s7_pointer args) 
{
  s7_pointer p1 = s7_car(args);
  s7_pointer p2 = s7_cadr(args);
  if (p1 == p2) 
    return(s7_t(sc));
  if ((!s7_is_c_object(p2)) ||
      (s7_c_object_type(p2) != js_ref_type_tag))
    return(s7_f(sc));
  int r = EM_ASM_INT({
      return Module.s7_interop.lookupJsObject($0,$1)==Module.s7_interop.lookupJsObject($0,$2) ? 1:0;
    },sc,p1,p2);
  return(s7_make_boolean(sc,r != 0));
}

//custom types?
//struct 
//static s7_pointer make_type(s7_scheme *sc, s7_pointer arg)
//
//




static s7_pointer type_of(s7_scheme *sc, s7_pointer arg)
{
  if (s7_is_c_object(arg)){
    if (s7_c_object_type(arg) == js_ref_type_tag){
      return s7_name_to_value(sc,"js-ref?");
    }
  }
  return s7_type_of(sc,arg);
}
static s7_pointer s_type_of(s7_scheme *sc, s7_pointer args){
  return type_of(sc,s7_car(args));
}
const char* s7_type_str(s7_scheme * sc, s7_pointer obj){ return s7_object_to_c_string(sc,type_of(sc,obj));}


int main() {
     s7_scheme *s7 = g_sc = s7_init();
     g_out = g_err = s7_nil(g_sc);
     s7_define_function(s7, "addr", addr, 1, 0, false, "(addr thing) returns the memory address of thing");
     s7_define_function(s7, "saddr", saddr, 0, 0, false, "(saddr) returns the memory address of the scheme");
     s7_define_function(s7, "console.log", console_log, 1, 0, true, "(console.log thing) prints and returns thing");
     s7_define_function(s7, "call-js", call_js, 1, 0, true, "(call-js thing . args) calls thing(..args), returns (thing . args)");
     s7_define_function(s7, "call-js-i", call_js_i, 1, 0, true, "(call-js-i thing . args) calls thing(..args), returns an int32");
     s7_define_function(s7, "call-js-d", call_js_d, 1, 0, true, "(call-js-d thing . args) calls thing(..args), returns a double");
     s7_define_function(s7, "call-js-p", call_js_p, 1, 0, true, "(call-js-p thing . args) calls thing(..args), returns a scheme object");
     s7_define_function(s7, "eval-js", eval_js, 1, 0, false, "(eval-js thing) does eval(thing), returns a scheme object");

     
     
     js_ref_type_tag = s7_make_c_type(s7, "js-ref");
     s7_c_type_set_gc_free(s7, js_ref_type_tag, free_js_ref);
     s7_c_type_set_gc_mark(s7, js_ref_type_tag, mark_js_ref);
     s7_c_type_set_is_equal(s7, js_ref_type_tag, js_ref_is_equal);
     s7_c_type_set_to_string(s7, js_ref_type_tag, js_ref_to_string);
     
     s7_define_function(s7, "make-js-ref", make_js_ref, 0, 1, false, "(make-js-ref x) makes a new javascript object equal to to_js(x), with no arguments, makes an undefined");
     s7_define_function(s7, "js-ref?", is_js_ref, 1, 0, false, "(js-ref? anything) returns #t if its argument is a javascript object");
     s7_define_function(s7, "js-ref-typeof", js_ref_typeof, 1, 0, false, "(js-ref-typeof x) returns typeof x");
     s7_define_variable(s7, "js-ref-data", 
                     s7_dilambda(s7, "js-ref-data", js_ref_data, 1, 0, set_js_ref_data, 2, 0, "js-ref data field."));
     s7_define_variable(s7, "js-ref-member", 
			s7_dilambda(s7, "js-ref-member", js_ref_member, 2, 0, set_js_ref_member, 3, 0, "(js-ref-member x y) is x[y]"));
     s7_define_variable(s7, "js-ref-method", 
			s7_dilambda(s7, "js-ref-method", js_ref_method, 2, 0, set_js_ref_member, 3, 0, "(js-ref-method x y) is x[y].bind(x)"));
     


     //extend to support custom types;
     s7_define_function(s7, "type-of",s_type_of,1,0,false,"(type-of obj) returns a symbol describing obj's type");
     return 0;
}

