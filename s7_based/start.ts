import * as Comlink from "comlink";
import {parse} from "./s_parse";

export function newScheme(){ 
    const webworker = new Worker("build/scheme_worker.js");
    const scheme = Comlink.wrap(webworker);
    return {scheme,webworker};
}
(window as any).parse = parse;
(window as any).newScheme = newScheme;
(window as any).scheme = newScheme();
(window as any).scheme2 = newScheme();






