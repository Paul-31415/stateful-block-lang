import * as Comlink from "comlink";
import { parse, prettyPrintThing, Cons, Thing, isCons } from "./s_parse";


type SchemeComlink = {
    get_err: () => Promise<string>,
    get_out: () => Promise<string>,
    eval_string: (code:string) => Promise<string>,
    ping: () => Promise<true>,
};

export type SchemeWorker = {
  scheme:SchemeComlink,
  webworker:Worker,
}
export class SchemeError extends Error{}
type ThingOrCont = Thing | {
  func:Thing,
  args:Thing,
  call:(a:Thing)=>Promise<ThingOrCont>
};
export class Scheme implements SchemeWorker{
  _lock:boolean;
  constructor(public scheme:SchemeComlink,public webworker:Worker){this._lock = false;}
  async runROE(code:string){
    while (this._lock){ await this.scheme.ping();}
    this._lock = true;
    const result = await this.scheme.eval_string(code);
    const r = {
      result,
      output:await this.scheme.get_out(),
      error: await this.scheme.get_err()
    };
    this._lock = false;
    return r;
  }  
  async run(code: string): Promise<ThingOrCont>{
    const res = await this.runROE(code);
    if (res.output !== ""){
      console.log(res.output);
    }
    if (res.error !== ""){
      throw new SchemeError(res.error);
    }
    const r = parse(res.result);
    if (isCons(r) && r.car === "call"){ //rpc callback
      const continuation = r.get(1);
      const func = r.get(2);
      const args = r.cr(0b1000);
      if (continuation === undefined || func === undefined || args === undefined){
        return r;
      }
      return {func,args,
              call: ((r:Thing) => {
                return this.run(new Cons("ret/cc",new Cons("'"+continuation,new Cons(r,null))).toString());
              }).bind(this)};
    }else{
      return r;
    }
  }
  runLines(code:string){
    return this.run("(begin\n"+code+"\n)");
  }
  
}

export function newScheme():Scheme{ 
  const webworker = new Worker("build/scheme_worker.js");
  const scheme = Comlink.wrap(webworker);
  return new Scheme(scheme as unknown as SchemeComlink,webworker);
}


