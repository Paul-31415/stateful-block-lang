
import { Value, type } from "./core";



/*
  array bigint boolean code iterator null number string symbol undefined
  a     B      b       c    i        n    N      s      S      u
 ? - i don't know
 d - determined by the code
 ! - error
in most cases, code will have full determination
Strict (pure) ops:
+ B b N
B B B N
b B b N
N N N N



Duck ops:
+ a B b c i n N s S u
a a     d
B   B B d     N
b   B B d     N
c d d d d d d d d d d
i       d i
n       d   n
N   N N d     N
s       d       s
S       d         ?
u       d           u

*/

export function add(a: Value, b: Value): Value {
    switch (type(a)) {
        case "array":
        case "bigint":
        case "boolean":
        case "code":
        case "iterator":
        case "null":
        case "number":

        case "string":
        case "symbol":
        case "undefined":
    }
}


