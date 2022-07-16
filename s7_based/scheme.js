console.log("loaded! ww");
import * as Comlink from "comlink";
importScripts("main.js");


Module.onRuntimeInitialized = () => {
    scheme = {
	eval_string:Module.cwrap('eval_string', 'string', ['string']),
	get_out:Module.cwrap('get_out', 'string'),
	get_err:Module.cwrap('get_err', 'string'),
	ping:() => true,
    };
    Comlink.expose(scheme);
}
