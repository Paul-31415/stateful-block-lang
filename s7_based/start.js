import * as Comlink from "comlink";

function newScheme(){ 
    const webworker = new Worker("build/scheme_worker.js");
    const scheme = Comlink.wrap(webworker);
    return {scheme,webworker};
}
globalThis.scheme = newScheme();
globalThis.scheme2 = newScheme();







