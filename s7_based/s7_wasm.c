// taken from https://github.com/actondev/s7-playground/blob/master/src/s7_wasm.c
#include "s7/s7.h"

/* #include <stdio.h> */
#include <stdlib.h>

s7_scheme* g_sc = NULL;
s7_pointer g_out, g_err;
char* g_out_str = NULL;

int main() {
     g_sc = s7_init();
     g_out = g_err = s7_nil(g_sc);

     return 0;
}

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
