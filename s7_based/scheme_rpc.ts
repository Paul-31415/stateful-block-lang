import * as Comlink from "comlink";
import { PromiseQueue, sequentialize } from "./sequentialize";
import { parse, prettyPrintThing, Cons, Thing, isCons, isConsOrNil, thingify } from "./s_parse";
import { some, none, Option, isSome } from "fp-ts/Option";
import { ObjLib } from "./jsObj_rpc";

type SchemeComlink = {
  get_err: () => Promise<string>;
  get_out: () => Promise<string>;
  eval_string: (code: string) => Promise<string>;
  ping: () => Promise<true>;
};

export type SchemeWorker = {
  scheme:SchemeComlink,
  webworker:Worker,
}
export class SchemeError extends Error{}
export type RPCCall = {
  origin:Scheme,
  func:Thing,
  args:Thing,
  call:(a:Thing)=>Promise<ThingOrRPCCall>,
  error:(a:Thing)=>Promise<ThingOrRPCCall>,
}
export function isRPCCall(c:ThingOrRPCCall): c is RPCCall{return !isConsOrNil(c) && typeof(c) !== "string";}
type ThingOrRPCCall = Thing | RPCCall;

export class Scheme implements SchemeWorker{
  constructor(public scheme:SchemeComlink,public webworker:Worker){}
  runROE = sequentialize(async (code:string)=>{
    const result = await this.scheme.eval_string(code);
    const r = {
      result,
      output: await this.scheme.get_out(),
      error: await this.scheme.get_err(),
    };
    return r;
  });
  async run(code: string): Promise<ThingOrRPCCall> {
    const res = await this.runROE(code);
    if (res.output !== "") {
      console.log(res.output);
    }
    if (res.error !== "") {
      throw new SchemeError(res.error);
    }
    const r = parse(res.result);
    if (isCons(r) && r.car === "call") {
      //rpc callback
      const continuation = r.get(1);
      const func = r.get(2);
      const args = r.cr(0b1000);
      if (
        continuation === undefined ||
        func === undefined ||
        args === undefined
      ) {
        return r;
      }
      return {
        origin:this,
        func,
        args,
        call: ((r: Thing) => {
          return this.run(
            new Cons(
              "ret/cc",
              new Cons("'" + continuation, new Cons(r, null))
            ).toString()
          );
        }).bind(this),
        error: ((r: Thing) => {
          //console.log(r);
          return this.run(
            new Cons(
              "error/cc",
              new Cons("'" + continuation, r)
            ).toString()
          );
        }).bind(this),
      };
    } else {
      return r;
    }
  }
  runLines(code: string) {
    return this.run("(begin\n" + code + "\n)");
  }
  runFile(url: URL) {
    function res(fn: (value: unknown) => void, s: Scheme) {
      const req = new XMLHttpRequest();
      req.onreadystatechange = () => {
        if (req.readyState == 4 && req.status == 200) {
          fn(s.runLines(req.responseText));
        }
      };
      req.open("GET", url);
      req.send(null);
    }
    return new Promise(
      ((resolve: (value: unknown) => void) => {
        res(resolve, this);
      }).bind(this)
    );
  }
}

export type Resolution = Option<ThingOrRPCCall>;

export type RPCResolver = {
  resolve: (c:RPCCall) => Promise<Resolution>|Resolution;  
}

export type RPCLib = Map<string,(args:Thing) => Promise<any>>;
export class RPCLibResolver implements RPCResolver{
  constructor(public libs: RPCLib[]){}
  async resolve(c:RPCCall): Promise<Resolution>{
    for (let lib of this.libs){
      if (typeof c.func === "string"){
        const v = lib.get(c.func);
        if (v !== undefined){
          return some(await c.call(thingify(await v(c.args))));
        }
      }
    }
    return none;
  }
}
export class RPCResolvers implements RPCResolver{
 constructor(public resolvers: RPCResolver[]){}
  async resolve(c:RPCCall): Promise<Resolution>{
    for (let lib of this.resolvers){
      const r = await lib.resolve(c);
      if (isSome(r)) {
        return r;
      }
    }
    return none;
  }
} 


export const HTTPReqLib:RPCLib = new Map([
  ["get",async (args:Thing) => {
    if (isCons(args) && typeof args.car === "string"){
      const url = JSON.parse(args.car);
      function res(fn:(value: any) => void){
        const req = new XMLHttpRequest();
        req.onreadystatechange = ()=>{
          if (req.readyState == 4){// && req.status == 200) {
            fn(req);
          }
        }
        req.open("GET",url);
        req.send(null);
      }
      return new Promise(res);
    }
    return null;
  }],
]);

// 
// rpc function 
// 
// 
// 

export const TimeLib:RPCLib = new Map([
  ["millis",async (_a:Thing)=>new Date().getMilliseconds()],
  ['ver',async (_a:Thing)=>8]
]);
export const GetRequestResolver:RPCResolver = {
  async resolve(c:RPCCall):Promise<Resolution>{
    if (c.func === "get"){
      if (isCons(c.args) && c.args.car && typeof c.args.car === "string"){
        const url = JSON.parse(c.args.car);
        function res(fn:(value: Thing) => void){
          const req = new XMLHttpRequest();
          req.onreadystatechange = ()=>{
            if (req.readyState == 4){// && req.status == 200) {
              fn(thingify(req));
            }
          }
          req.open("GET",url);
          req.send(null);
        }
        return new Promise(res).then(async (r)=>{
          return some(await c.call(r));
        });
      } else {
        return none;
      }
    }else{
      return none;
    }
  }
}




export class SchemeRPCRes{
  constructor(public scheme:Scheme,public resolver:RPCResolver){}
  async run(code:string){
    let res = await this.scheme.run(code);
    while (isRPCCall(res)){
      const r = await this.resolver.resolve(res);
      if (isSome(r)){
        res = r.value;
      }else{
        return res;
      }
    }
    return res;
  }
}


export function newScheme(){ 
  const webworker = new Worker("build/scheme_worker.js");
  const scheme = Comlink.wrap(webworker);
  const sw = new Scheme(scheme as unknown as SchemeComlink,webworker);
  //sw.runFile("../rpc.scm");//temporary solution for standard library
  //sw.run("(define-macro (object . a) `',a)");
  const olib = new ObjLib();
  olib.wrap({foo:"asdf",bar:{ghjkl:123}},sw,"test");
  return new SchemeRPCRes(sw,new RPCResolvers([new RPCLibResolver([HTTPReqLib,TimeLib]),
                                               olib]));
}
