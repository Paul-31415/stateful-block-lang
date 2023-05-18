
if (Module.s7_interop === undefined){
    //Module.s7_interop.fn($0,$1).apply(Module.s7_interop.list($0,$2));
    //char* typ = s7_object_to_c_string(sc,s7_type_of(sc,obj));
    let s7 = {
	type_str : Module.cwrap("s7_type_str", "ptr", ["ptr","ptr"]),
	object_to_c_string : Module.cwrap("s7_object_to_c_string", "ptr", ["ptr","ptr"]),
	car : Module.cwrap("s7_car", "ptr", ["ptr"]),
	cdr : Module.cwrap("s7_cdr", "ptr", ["ptr"]),
	set_car : Module.cwrap("s7_set_car", "ptr", ["ptr","ptr"]),
	set_cdr : Module.cwrap("s7_set_cdr", "ptr", ["ptr","ptr"]),
	boolean : Module.cwrap("s7_boolean", "boolean", ["ptr","ptr"]),
	symbol_name : Module.cwrap("s7_symbol_name", "ptr", ["ptr"]),
	string : Module.cwrap("s7_string", "ptr", ["ptr"]),
	real : Module.cwrap("s7_real", "double", ["ptr"]),
	real_part : Module.cwrap("s7_real_part", "double", ["ptr"]),
	imag_part : Module.cwrap("s7_imag_part", "double", ["ptr"]),
    
    
	gc_protect : Module.cwrap("s7_gc_protect", "ptr", ["ptr","ptr"]),
	gc_unprotect_at : Module.cwrap("s7_gc_unprotect_at", "none", ["ptr","ptr"]),
	gc_protected_at : Module.cwrap("s7_gc_protected_at", "ptr", ["ptr","ptr"]),
	gc_protect_via_stack : Module.cwrap("s7_gc_protect_via_stack", "ptr", ["ptr","ptr"]),
	gc_unprotect_via_stack : Module.cwrap("s7_gc_unprotect_via_stack", "ptr", ["ptr","ptr"]),
	gc_protect_via_location : Module.cwrap("s7_gc_protect_via_location", "ptr", ["ptr","ptr","ptr"]),
	gc_unprotect_via_location : Module.cwrap("s7_gc_unprotect_via_location", "ptr", ["ptr","ptr"]),
	gc_on : Module.cwrap("s7_gc_on", "ptr", ["ptr","boolean"]),


	
	f : Module.cwrap("s7_f","ptr",["ptr"]),
	t : Module.cwrap("s7_t","ptr",["ptr"]),
	nil : Module.cwrap("s7_nil","ptr",["ptr"]),
	undefined_ : Module.cwrap("s7_undefined","ptr",["ptr"]),
	unspecified : Module.cwrap("s7_unspecified","ptr",["ptr"]),
	eof_object : Module.cwrap("s7_eof_object","ptr",["ptr"]),

	make_string : Module.cwrap("s7_make_string","ptr",["ptr","string"]),
	make_real : Module.cwrap("s7_make_real","ptr",["ptr","double"]),
	make_complex : Module.cwrap("s7_make_complex","ptr",["ptr","double","double"]),
	cons : Module.cwrap("s7_cons","ptr",["ptr","ptr","ptr"]),
	make_c_pointer : Module.cwrap("s7_make_c_pointer","ptr",["ptr","ptr"]),
	make_c_pointer_with_type : Module.cwrap("s7_make_c_pointer_with_type","ptr",["ptr","ptr","ptr","ptr"]),
	make_symbol : Module.cwrap("s7_make_symbol","ptr",["ptr","string"]),
	symbol_value : Module.cwrap("s7_symbol_value","ptr",["ptr","ptr"]),
	symbol_set_value : Module.cwrap("s7_symbol_set_value","ptr",["ptr","ptr","ptr"]),
	symbol_local_value : Module.cwrap("s7_symbol_local_value","ptr",["ptr","ptr","ptr"]),
	
	
	make_js_ref : Module.cwrap("make_js_ref","ptr",["ptr","ptr"]),

	call_with_location : Module.cwrap("s7_call_with_location","ptr",["ptr","ptr","ptr","string","string","ptr"]),
	eval_with_location : Module.cwrap("s7_eval_with_location","ptr",["ptr","ptr","ptr","string","string","ptr"]),

	define_variable_with_documentation : Module.cwrap("s7_define_variable_with_documentation","ptr",["ptr","string","ptr","string"]),
	define : Module.cwrap("s7_define","ptr",["ptr","ptr","ptr","ptr"]),
	closure_let : Module.cwrap("s7_closure_let","ptr",["ptr","ptr"]),

	error : Module.cwrap("s7_error","ptr",["ptr","ptr","ptr"]),

	method : Module.cwrap("s7_method","ptr",["ptr","ptr","ptr"]),



    }
    let clear_stdout_stderr = Module.cwrap("clear_stdout_stderr","none",[]);
    let eval_string = Module.cwrap("eval_string", "string", ["string"]);
    let get_out = Module.cwrap("get_out", "string", []);
    let get_err = Module.cwrap("get_err", "string", []);
    let eval_string_to_obj = Module.cwrap("eval_string_to_obj","ptr",["string"]);
    let gc_is_on = {};
    function gc_off(sc){
	if (!(sc in gc_is_on)){
	    gc_is_on[sc] = true;
	}
	let r = gc_is_on[sc];
	gc_is_on[sc] = false;
	s7.gc_on(sc,false)
	return r;
    }
    function gc_on(sc,on=true){
	if (on){
	    gc_is_on[sc] = true;
	    s7.gc_on(sc,true)
	}
    }
    
    function log_outputs(){
	let out = get_out();
	let err = get_err();
	clear_stdout_stderr();
	if (out) console.log(out);
	if (err) console.warn(err);
    }
    function log_outputs_throw(e,sc,o){
	let out = get_out();
	let err = get_err();
	clear_stdout_stderr();
	if (out) console.log(out);
	if (err) {
	    if (e === undefined){
		throw new Error(err);
	    }else{
		e.message = err;
		e.name = (sc!==undefined && o!==undefined)?repr(sc,o):"Error"; 
		throw e;
	    }
	}
    }
    function eval_s(code){
	let result = eval_string(code);
	log_outputs();
	return result;
    }

    function evs_p(code){
	let r = eval_string_to_obj(code)
	log_outputs();
	return r;
    }
    function evs(code){
	let s = sc();
	let r = evs_p(code);
	return to_js(s,r);
    }
    
    
    function string(obj){
	return Module.UTF8ToString(s7.string(obj));
    }
    function symbol_name(obj){
	return Module.UTF8ToString(s7.symbol_name(obj));
    }
    
    function repr(sc,obj){
	let s = s7.object_to_c_string(sc,obj);
	let r = Module.UTF8ToString(s);
	Module._free(s);
	return r;
    }
    function type_of(sc,obj){
	let s = s7.type_str(sc,obj);
	let r = Module.UTF8ToString(s);
	Module._free(s);
	return r;
    }
    function fn(sc,obj){
	let t = type_of(sc,obj);
	if (t === "string?"){
	    return eval(string(obj));
	}
	else if (t === "symbol?"){
	    return eval(symbol_name(obj));
	}
	else if (t === "js-ref?"){
	    let f = lookupJsObject(sc,obj);
	    function wrapped(...a){
		let r;
		try{
		    r = f.apply(this,a);
		}catch (error){
		    s7.error(sc,s7.make_symbol(sc,"js-err-"+error.name),
			     to_sc(sc,{car:error,cdr:null}));
		    return 0;//to_sc(sc,error);
		}
		return to_sc(sc,r);
	    }
	    //wrapped.name = "to_sc("+f.name+")";
	    return wrapped;
	}
	
	throw new Error("unknown function "+repr(sc,obj)+" type "+t);
    }
    function list(sc,obj){
	let r = [];
	let t = type_of(sc,obj);
	let seen = {}
	while (t === "pair?"){
	    r.push(to_js(sc,s7.car(obj)));
	    seen[obj] = true;
	    obj = s7.cdr(obj);
	    if (seen[obj] === true){
		throw new Error("s7_interop.list was passed an infinite list: "+repr(sc,obj));
	    }
	    t = type_of(sc,obj);
	}
	if (t !== "null?"){
	    console.warn("s7_interop.list was passed an impure list:",to_js(sc,obj));
	}
	return r;
    }
    class Rational{
	constructor(n,d){
	    this.n = n;
	    this.d = d;
	}
	toString(){
	    return this.n+"/"+this.d;
	}
    }
    function rational(s){
	s = s.split("/");
	return new Rational(BigInt(s[0]),BigInt(s[1]));
    }
    class Complex{
	constructor(r,i){
	    this.r = r;
	    this.i = i;
	}
	toString(){
	    return this.r+"+"+this.i+"i";
	}
    }
    function complex(r,i){
	return new Complex(r,i);
    }
    const jsObjects = {};
    function lookupJsObject(sc,id){
	return jsObjects[sc] && jsObjects[sc][id];
    }
    function registerJsObject(sc,id,obj){
	if (jsObjects[sc] === undefined){
	    jsObjects[sc] = {}
	}
	jsObjects[sc][id] = obj;
    }
    function freeJsObject(sc,id){
	if (jsObjects[sc] !== undefined){
	    delete jsObjects[sc][id];
	}
    }
    
    const s7objects = {};
    const s7objectRegistry = new FinalizationRegistry((v) => {
	s7.gc_unprotect_at(v.sc,v.loc);
	if (s7objects[v.sc]){
	    delete s7objects[v.sc][v.addr];
	}
	//console.log("gc",v);
    });
    function conslike(obj){
	return ("car" in obj) && ("cdr" in obj);
    }
    function is_integer(v){
	return (typeof v) === "bigint" || ((typeof v) === "number" && Number.isInteger(v));
    }
    function ratiolike(obj){
	return ("n" in obj) && ("d" in obj) && is_integer(obj.n) && is_integer(obj.d);
    }
    function complexlike(obj){
	return ("r" in obj) && ("i" in obj) && (typeof obj.r) === "number" && (typeof obj.i) === "number";
    }
    function scobjlike(obj){
	return ("sc" in obj) && ("addr" in obj);
    }
    function protectS7Object(obj,sc,addr){
	let loc = s7.gc_protect(sc,addr);
	s7objectRegistry.register(obj,{sc,addr,loc},obj);
	if (s7objects[sc] === undefined){
            s7objects[sc] = {};
        }
	s7objects[sc][addr] = new WeakRef(obj);
	return loc;
    }
    class Pair{
	constructor(sc,obj){
	    this.sc = sc;
	    this.addr = obj;
	    this.protect();
	}
	protect(){
	    this.loc = protectS7Object(this,this.sc,this.addr);
	}
	free(){
	    if (this.loc !== undefined){
		s7objectRegistry.unregister(this);
		s7.gc_unprotect_at(this.sc,this.loc);
		this.loc = undefined;
	    }
	}
	get car(){
	    return to_js(this.sc,s7.car(this.addr));
	}
	get cdr(){
	    return to_js(this.sc,s7.cdr(this.addr));
	}
	toString(seen){
	    return repr(this.sc,this.addr);
	}
    }
    function pair(sc,obj){
	return (s7objects[sc] && s7objects[sc][obj] && s7objects[sc][obj].deref()) || new Pair(sc,obj);
    }
    let symbolTable = {};
    let unspecified = Symbol("unspecified");
    let eof_object = Symbol("eof");
    class UnknownType{
	constructor(sc,addr,t){
	    this.sc = sc;
	    this.addr = addr;
	    this.type = t;
	}
	toString(){
	    return repr(this.sc,this.addr);
	}
    }
    function func_attrs(sc,obj){
        //The offsets here were determined experimentally, so they are possibly unstable
        return {args:Module.HEAPU32[obj/4+2],body:Module.HEAPU32[obj/4+3],env:Module.HEAPU32[obj/4+4],setter:Module.HEAPU32[obj/4+5],arity:Module.HEAPU32[obj/4+6]};
    }
    function funcrepr(sc,obj){
        //The offsets here were determined experimentally, so they are possibly unstable
        const args = repr(sc,Module.HEAPU32[obj/4+2]);
        const body = repr(sc,Module.HEAPU32[obj/4+3]);
        const env = repr(sc,Module.HEAPU32[obj/4+4]);
        const setter = repr(sc,Module.HEAPU32[obj/4+5]);
        const arity = Module.HEAPU32[obj/4+5];
        return `(lambda ${args} ${body.slice(1)}`;
        
    }
    function schemeFunc(sc,obj){
	let f = (s7objects[sc] && s7objects[sc][obj] && s7objects[sc][obj].deref());
	if (f){
	    return f;
	}
	//let e = new Error();
	f = function (...args){
	    let alist = null;
	    for (let i = args.length-1 ;i >= 0; i--){
		alist = {car:args[i],cdr:alist};
	    }
	    //console.log(alist);
	    
	    //this encloser
	    s7.define(sc,s7.closure_let(sc,obj),s7.make_symbol(sc,"this"),to_sc(sc,this));
	    
	    //s7.symbol_set_value(s7, s7.make_symbol(s7, "this"), to_sc(sc,this));
	    //s7.eval_with_location(sc, s7.cons(s7.make_symbol(s7, "define") ,s7.cons(s7.make_symbol(s7, "this"),s7.cons(to_sc(sc,this),s7.nil(sc)))),
	    //s7.nil(sc),		  
	    //s7.symbol_set_value(s7, s7.make_symbol(s7, "this"), to_sc(sc,this))
	    let e = new Error();
	    let file = "unknown";
	    let line = 0;
	    if (e.stack){
		let s = e.stack;
		let caller = s.split("\n")[1];
		file = ""+caller;
	    }
	    
	    let r = s7.call_with_location(sc,obj,to_sc(sc,alist),"called from javascript", file, line);
	    log_outputs_throw(e,sc,r);
	    return to_js(sc,r);
	}
	f.sc = sc;
	f.addr = obj;
	f.loc = protectS7Object(f,sc,obj);
        Object.defineProperty(f, 'args', {
            get: function() { return to_js(this.sc,Module.HEAPU32[this.addr/4+2]);}
        });
        Object.defineProperty(f, 'body', {
            get: function() { return to_js(this.sc,Module.HEAPU32[this.addr/4+3]);}
        });
        Object.defineProperty(f, 'env', {
            get: function() { return to_js(this.sc,Module.HEAPU32[this.addr/4+4]);}
        });
        Object.defineProperty(f, 'setter', {
            get: function() { return to_js(this.sc,Module.HEAPU32[this.addr/4+5]);}
        });
        Object.defineProperty(f, 'arity', {
            get: function() { return Module.HEAPU32[this.addr/4+6];}
        });        
        f.toString = ()=>{
            return `scheme function ${f.args} ${f.body} ${f.env} ${f.setter}`;
            return `scheme function [@${f.sc}:${f.addr}] ${funcrepr(f.sc,f.addr)}`;
        }
	//f.error = e;
	return f;
    }
    function to_js(sc, obj){
	let t = type_of(sc,obj);
	//console.log(t,repr(sc,obj));
	switch (t) {
	case "integer?":
	    return BigInt(repr(sc,obj));
	case "rational?":
	    return rational(repr(sc,obj));
	case "float?":
	    return s7.real(obj);
	case "complex?":
	    return complex(s7.real_part(obj),s7.imag_part(obj));
	case "string?":
	    return string(obj);
	case "symbol?":
	    if (symbolTable[obj] === undefined){
		symbolTable[obj] = Symbol(symbol_name(obj));
	    }
	    return symbolTable[obj];
	case "null?":
	    return null;
	case "undefined?":
	    return undefined;
	case "unspecified?":
	    return unspecified;
	case "eof-object?":
	    return eof_object;
	case "pair?":
	    return pair(sc,obj);
	case "procedure?":
	    return schemeFunc(sc,obj);
	case "js-ref?":
	    return lookupJsObject(sc,obj);
	case "let?": //probably the most object-like scheme thing
	case "vector?":
	case "hash-table?":
	case "character?":
	case "c-pointer?":
	default:
	    return new UnknownType(sc,obj,t);
	}
    }
    function with_gc_off(sc,func,args){
	let g = gc_off(sc);
	let r = func.apply(null,args);
	s7.gc_protect_via_stack(sc,r);
	gc_on(sc,g);
	return r;
    }
    function to_sc(sc,obj,seen){
	return with_gc_off(sc,_to_sc,[sc,obj,seen]);
    }
    function to_s7(obj){
	return to_sc(sc(),obj);
    }
    let js_functions = [];
    function _to_sc(sc,obj,seen){
	if (seen === undefined){
	    seen = new Map();
	}
	if (seen.has(obj)){
	    return seen.get(obj);
	}
	let r;
	switch(typeof obj){
	case "object":
	    if (obj === null){
		return s7.nil(sc);
	    }else if (scobjlike(obj)){
		return obj.addr;
	    }else if (conslike(obj)){
		let nil = s7.nil(sc);
		r = s7.cons(sc,nil,nil);
		seen.set(obj,r);
		s7.set_car(r,_to_sc(sc,obj.car,seen));
		s7.set_cdr(r,_to_sc(sc,obj.cdr,seen));
		return r;
	    }else if (ratiolike(obj)){
		let n = obj.n; let d = obj.d;
		if (d.toString().charAt(0) === "-"){
		    n = -n; d = -d;
		}
		r = evs_p(n+"/"+d);
		seen.set(obj,r);
		return r;
	    }else if (complexlike(obj)){
		r = s7.make_complex(sc,obj.r,obj.i);
		seen.set(obj,r);
		return r;
	    }else{
		//throw new Error("unsupported object");
		//r = s7.make_c_pointer(sc,)
		r = s7.make_js_ref(sc,s7.nil(sc));
		registerJsObject(sc,r,obj);
		seen.set(obj,r);
		return r;
	    }
	case "undefined":
	    return s7.undefined_(sc);
	case "boolean":
	    return obj?s7.t(sc):s7.f(sc);
	case "number":
	    r = s7.make_real(sc,obj);
	    seen.set(obj,r);return r; 
	case "bigint":
	    r = evs_p(sc,obj.toString());
	    seen.set(obj,r);return r; 
	case "string":
	    r = s7.make_string(sc,obj);
	    seen.set(obj,r);return r; 
	case "symbol":
	    if (obj === unspecified){
		return s7.unspecified(sc);
	    }else if (obj === eof_object){
		return s7.eof_object(sc);
	    }else{
		let name = Symbol.keyFor(obj);
		r = s7.make_symbol(sc,name)
		symbolTable[r] = obj;
		seen.set(obj,r);return r; 
	    }
	case "function":
	    //let i = js_functions.length;
	    //js_functions.push(obj);

	    //let f = "(lambda x (apply call-js-p (cons func x)))";
	    
	    r = s7.make_js_ref(sc,s7.nil(sc));
	    registerJsObject(sc,r,obj);
	    r = s7.eval_with_location(sc,
				      s7.cons(sc,
					      s7.make_symbol(sc,"lambda"),
					      s7.cons(sc,
						      s7.make_symbol(sc,"x"),
						      s7.cons(sc,
							      s7.cons(sc,
								      s7.make_symbol(sc,"apply"),
								      s7.cons(sc,
									      s7.make_symbol(sc,"call-js-p"),
									      s7.cons(sc,
										      s7.cons(sc,
											      s7.make_symbol(sc,"cons"),
											      s7.cons(sc,
												      r,
												      s7.cons(sc,
													      s7.make_symbol(sc,"x"),
													      s7.nil(sc))
												     )
											     ),
										      s7.nil(sc)
										     )
									     )
								     ),
							      s7.nil(sc)
							     )
						     )
					     ),
				      s7.nil(sc),
				      "to_sc","s7_interop.js",0);
	    
	    seen.set(obj,r);
	    return r;
	    
	    //r = evs_p(f);
	    //seen.set(obj,r);return r; 
	}

	return seen.get(obj);
    }
    
    
    let sc_cache = undefined;
    function sc(){
	if (sc_cache === undefined){
	    sc_cache = parseInt(eval_string("(saddr)"));
	}
	return sc_cache;
    }
	
    
    Module.s7_interop = {
	s7,
	
	string, symbol_name,
	repr,funcrepr,
	type_of,
	fn,
	list,
	to_js,
	to_sc,to_s7,
	eval_string,get_out,get_err,eval_string_to_obj, clear_stdout_stderr,log_outputs,log_outputs_throw,
	eval_s,evs_p,evs,

	pair,Pair,conslike,
	s7objectRegistry,
	s7objects,

	schemeFunc,
	
	rational,Rational,ratiolike,
	complex,Complex,complexlike,
	UnknownType,scobjlike,
	
	sc,
	symbolTable,
	unspecified,
	eof_object,

	gc_off,gc_on,


	js_functions,

	jsObjects, lookupJsObject,registerJsObject,freeJsObject,
    };

    Module.loadRemote = async function loadRemote(url,wrap=true){
	let response = await fetch(url);
	if (response.ok && response.status === 200){
	    let prog = await response.text();
	    if (wrap){
		prog = "(begin \n" + prog + "\n)";
	    }
	    return Module.s7_interop.eval_s(prog);
	}else{
	    console.warn("loadRemote bad response",url,response);
	}
    }
}

