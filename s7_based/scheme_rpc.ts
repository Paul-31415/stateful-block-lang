import * as Comlink from "comlink";
import { PromiseQueue } from "./sequentialize";
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
  promises:PromiseQueue;
  constructor(public scheme:SchemeComlink,public webworker:Worker){this.promises = new PromiseQueue();}
  async runROE(code:string){
    async function run(scheme:SchemeComlink){
      const result = await scheme.eval_string(code);
      const r = {
        result,
        output:await scheme.get_out(),
        error: await scheme.get_err()
      };
      return r;
    };
    return this.promises.enqueue(()=>run(this.scheme));
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
  runFile(url:URL){
    function res(fn:(value: unknown) => void,s:Scheme){
      const req = new XMLHttpRequest();
      req.onreadystatechange = ()=>{
        if (req.readyState == 4 && req.status == 200) {
          fn(s.runLines(req.responseText));
        }
      }
      req.open("GET",url);
      req.send(null);
    }
    return new Promise(((resolve:(value: unknown) => void) => {
      res(resolve,this);
    }).bind(this));
  }
  
}

export function newScheme():Scheme{ 
  const webworker = new Worker("build/scheme_worker.js");
  const scheme = Comlink.wrap(webworker);
  return new Scheme(scheme as unknown as SchemeComlink,webworker);
}


