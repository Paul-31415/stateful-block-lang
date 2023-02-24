import { newScheme } from "./scheme_rpc";
import { parse, prettyPrintThing, safePrintThing, thingify } from "./s_parse";

(window as any).thingify = thingify;
(window as any).pprint = prettyPrintThing;
(window as any).sprint = safePrintThing;
(window as any).parse = parse;
(window as any).newScheme = newScheme;
(window as any).editor = newScheme();
(window as any).scheme = newScheme();
(window as any).scheme2 = newScheme();
/*const importObject = {
    imports: { console_log: (arg) => console.log(arg) },
    env: {},
};
(window as any).scheme_wasm = WebAssembly.instantiateStreaming(fetch("s7/main.wasm"), importObject);
//above doesn't work because it needs s7/main.js (which was made by emscripten)
*/

import * as Module from "./s7/main.js";
import "./s7_interop.js";
