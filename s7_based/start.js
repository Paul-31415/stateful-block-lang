Module.onRuntimeInitialized = () => {   
    //Module.cwrap('main')();
    eval_string = Module.cwrap('eval_string', 'string', ['string']);
    get_out = Module.cwrap('get_out', 'string');
    get_err = Module.cwrap('get_err', 'string');
}
