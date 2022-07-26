import * as Comlink from "comlink";
importScripts("main.js");


Module.onRuntimeInitialized = () => {
    const scheme = {
        ping:() => true,
        eval_string:Module.cwrap('eval_string', 'string', ['string']),
        get_out:Module.cwrap('get_out', 'string'),
        get_err:Module.cwrap('get_err', 'string'),
    };
    Comlink.expose(scheme);
}
 
