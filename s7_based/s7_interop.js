
if (Module.s7_interop === undefined){
    //Module.s7_interop.fn($0,$1).apply(Module.s7_interop.list($0,$2));
    //char* typ = s7_object_to_c_string(sc,s7_type_of(sc,obj));
    let s7_type_str = Module.cwrap("s7_type_str", "ptr", ["ptr","ptr"])
    let s7_object_to_c_string = Module.cwrap("s7_object_to_c_string", "ptr", ["ptr","ptr"])
    let s7_car = Module.cwrap("s7_car", "ptr", ["ptr"])
    let s7_cdr = Module.cwrap("s7_cdr", "ptr", ["ptr"])
    let s7_boolean = Module.cwrap("s7_boolean", "boolean", ["ptr","ptr"])
    let s7_symbol_name = Module.cwrap("s7_symbol_name", "ptr", ["ptr"])
    let s7_string = Module.cwrap("s7_string", "ptr", ["ptr"])
    let s7_real = Module.cwrap("s7_real", "double", ["ptr"])
    let s7_real_part = Module.cwrap("s7_real_part", "double", ["ptr"])
    let s7_imag_part = Module.cwrap("s7_imag_part", "double", ["ptr"])
    let eval_string = Module.cwrap("eval_string", "string", ["string"]);
    function string(obj){
	return Module.UTF8ToString(s7_string(obj));
    }
    function symbol_name(obj){
	return Module.UTF8ToString(s7_symbol_name(obj));
    }
    
    function repr(sc,obj){
	let s = s7_object_to_c_string(sc,obj);
	let r = Module.UTF8ToString(s);
	Module._free(s);
	return r;
    }
    function type_of(sc,obj){
	let s = s7_type_str(sc,obj);
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
	throw new Error("unknown function "+repr(sc,obj));
    }
    function list(sc,obj){
	let r = [];
	let t = type_of(sc,obj);
	let seen = {}
	while (t === "pair?"){
	    r.push(to_js(sc,s7_car(obj)));
	    seen[obj] = true;
	    obj = s7_cdr(obj);
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
	let n,d = s.split("/");
	return new Rational(BigInt(n),BigInt(d));
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
    class Pair{
	constructor(sc,obj){
	    this.sc = sc
	    this.addr = obj
	}
	get car(){
	    return to_js(this.sc,s7_car(this.addr));
	}
	get cdr(){
	    return to_js(this.sc,s7_cdr(this.addr));
	}
    }
    function pair(sc,obj){
	return new Pair(sc,obj);
    }
    let symbolTable = {};
    let unspecified = Symbol("unspecified");
    function to_js(sc, obj){
	let t = type_of(sc,obj);
	//console.log(t,repr(sc,obj));
	switch (t) {
	case "integer?":
	    return BigInt(repr(sc,obj));
	case "rational?":
	    return rational(repr(sc,obj));
	case "float?":
	    return s7_real(obj);
	case "complex?":
	    return complex(s7_real_part(obj),s7_imag_part(obj));
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
	case "pair?":
	    return pair(sc,obj);
	default:
	    return {sc:sc,addr:obj,type:t};
	}
	return [scheme_ptr, obj_ptr];
    }

    let sc_cache = undefined;
    function sc(){
	if (sc_cache === undefined){
	    sc_cache = parseInt(eval_string("(saddr)"));
	}
	return sc_cache;
    }
	
    
    Module.s7_interop = {
	s7_type_str,
	s7_object_to_c_string,
	s7_car,s7_cdr,s7_boolean, s7_symbol_name, s7_string, s7_real, s7_real_part, s7_imag_part,
	string, symbol_name,
	repr,
	type_of,
	fn,
	list,
	to_js,
	eval_string,

	sc,
	symbolTable,
	unspecified,
    };
}

