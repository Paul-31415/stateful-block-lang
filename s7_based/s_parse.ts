


type prim = string | null;
type Thing = Cons | prim;
interface Cons{
  _is_Cons : true,
  car : Thing,
  cdr : Thing,
} 
export function isCons(v:any): v is Cons {return v && (v._is_Cons === true);}
type ParseThing = ParseCons | prim;
type ParseCons = {_is_ParseCons : true, car : ParseVal, cdr : ParseVal };
function isParseCons(v:any): v is ParseCons {return v && (v._is_ParseCons === true);}
type ParseRef = {_is_ref:true,ref:string};
function isRef(v:any): v is ParseRef {return v && (v._is_ref === true);}
type ParseVal = ParseThing|null|ParseRef;
type ParseRes = {i:number,v:ParseVal};
class ParseError extends Error {
  args : any[];
  constructor(a:any[]){super(a[0]);this.args = a;}
} 


//  #1='("foo \"\n\\\"\\ ( + 2 )))\t  \\" (#1# . 2) . #1#)     
//const s_string = /^"([^\\"]?(\\.)?)*"&/;
const s_def = /^#\d+=&/;
const s_ref = /^#\d+#&/;
const s_atom = /^[^\(\)]+$/;
const s_token = /("([^\\"]?(\\.)?)*")|(#\d+=)|(#\d+#)|(\()|(\))|(')|([^\(\)\s]+)/;
//const well_formed = /^(\s*(("([^\\"]?(\\.)?)*")|(#\d+=)|(#\d+#)|(\()|(\))|(')|([^\(\)\s]+))\s*)*$/;
function* tokenize(s:string) : Iterable<string>{
  const tok = RegExp(s_token,"g");
  for (let i = tok.exec(s); i !== null; i = tok.exec(s)){
    yield i[0];
  } 
}
export function parse(s:string): Thing { 
  //assert well_formed.test(s);
  const toks = [...tokenize(s)];
  if (toks === null){
    throw new ParseError(["S-expr ParseError: no tokens found.",s]);
  }
  const named = new Map<string,ParseVal>();
  const parsed = parse_thing(toks,0,named);
  if (parsed.i < toks.length){
    throw new ParseError(["S-expr ParseError: early end to parsing",parsed.i,toks,parsed]);
  }
  return link_refs(parsed.v,named);
}
/* s expression ebnf

   naked_cons := thing naked_cons | thing . thing | \epsilon;
   cons := "(" naked_cons ")"
   thing := ( [DEF]  ( ATOM | cons | quoted )) | REF
   quoted := "'" thing

*/
function parse_cons(toks: RegExpMatchArray,i:number,defs:Map<string,ParseVal>): ParseRes {
  if (toks[i] != "("){
    throw new ParseError(["S-expr ParseError: expected '(' for a cons at token:",i,toks]);
  }
  const r = parse_ncons(toks,i+1,defs);
  if (toks[r.i] != ")"){
    throw new ParseError(["S-expr ParseError: expected ')' for a cons at token:",r.i,toks]);
  }
  return {i:r.i+1,v:r.v};
}
function parse_ncons(toks: RegExpMatchArray,i:number,defs:Map<string,ParseVal>): ParseRes {
  if (toks[i] == ")"){// epsilon
    return {i,v:null};
  }
  const icar = parse_thing(toks,i,defs);
  const car = icar.v;
  i = icar.i;
  const icdr = (toks[i] == ".") ? // thing . thing
    parse_thing(toks,i+1,defs)  :
    //thing ncons
    parse_ncons(toks,i,defs);
  return {i:icdr.i,v:{_is_ParseCons:true as const,car,cdr:icdr.v}};
}
function quote(r:ParseRes):ParseRes{
  return {i:r.i,v:{_is_ParseCons:true as const,car:"quote",cdr:
		   {_is_ParseCons:true as const,car:r.v,cdr:null}
		  } 
	 };
}
function parse_thing(toks: RegExpMatchArray,i:number,defs:Map<string,ParseVal>): ParseRes {
  //thing := ( [DEF]  ( ATOM | cons | quoted )) | REF
  if (s_ref.test(toks[i])){
    return {i:i+1,v:{_is_ref:true as const,ref:toks[i].substring(1,toks[i].length-2)}};
  }  
  //[DEF]  ( ATOM | cons | quoted )
  let ds:string|null = null;
  if (s_def.test(toks[i])){
    ds = toks[i].substring(1,toks[i].length-2);
    if (defs.has(ds)){
      throw new ParseError(["S-expr ParseError: double definition of ref key",ds,"at",i,toks]);
    }
    i += 1;
  }

  // ATOM | cons | quoted
  const res = s_atom.test(toks[i]) ? {i:i+1,v:toks[i]}  :
    toks[i] === "'" ? quote(parse_thing(toks,i+1,defs)) :
    parse_cons(toks,i,defs);
  if (ds !== null){
    defs.set(ds,res.v)
  }
  return res;
}
function link_refs(r:ParseVal,defs:Map<string,ParseVal>,map:Map<ParseVal,Thing>|null=null) :Thing{
  if (map === null){map = new Map();}
  const map_get_r = map.get(r);
  if (map_get_r !== undefined){ return map_get_r;}
  if (isRef(r)){
    const defs_get_r_ref = defs.get(r.ref);
    if (defs_get_r_ref !== undefined){
      const res = link_refs(defs_get_r_ref,defs,map);
      map.set(r,res); 
      return res;
    }
    throw new ParseError(["S-expr ParseError: missing key in reference",r.ref,defs]);
  }
  if (isParseCons(r)){
    const res = {_is_Cons:true as const,car:link_refs(r.car,defs,map),cdr:link_refs(r.cdr,defs,map)};
    map.set(r,res);
    return res;
  }
  map.set(r,r);
  return r;
}
