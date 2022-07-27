type Prim = string | null;
export type Thing = Cons | Prim;
export class Cons {
  _is_Cons = true;
  constructor(public car: Thing, public cdr: Thing) {}
  public toString(): string {
    return safePrintThing(this);
  }
  get(i: number): Thing | undefined {
    if (i < 0) {
      return undefined;
    } //array behaviour
    if (i == 0) {
      return this.car;
    }
    if (isCons(this.cdr)) {
      return this.cdr.get(i - 1);
    }
    return undefined; //array behaviour
  }
  cr(pattern: number): Thing | undefined {
    if (pattern <= 1) {
      return this;
    }
    const r = pattern & 1 ? this.car : this.cdr;
    pattern = Math.floor(pattern / 2);
    if (isCons(r)) {
      return r.cr(pattern);
    }
    if (pattern <= 1) {
      return r;
    }
    return undefined;
  }
}
export function isCons(v: any): v is Cons {
  return v && v._is_Cons === true;
}
function isConsOrNil(v: any): v is Cons | null {
  return v === null || v._is_Cons === true;
}
function prettyPrintNCons(
  c: Cons | null,
  seen: Set<Cons> | null = null,
  num: Map<Cons, number> | null = null,
  show: boolean = false
): string {
  if (seen === null) {
    seen = new Set<Cons>();
  }
  if (num === null) {
    num = new Map<Cons, number>();
  }
  if (c === null) {
    return "";
  }
  const cars = prettyPrintThing(c.car, seen, num);
  if (isConsOrNil(c.cdr)) {
    if (c.cdr && num.has(c.cdr)) {
      return cars + " . " + prettyPrintThing(c.cdr, seen, num);
    }
    return cars + " " + prettyPrintNCons(c.cdr, seen, num);
  }
  return cars + " . " + prettyPrintThing(c.cdr, seen, num);
}
export function prettyPrintThing(
  c: Thing,
  seen: Set<Cons> | null = null,
  num: Map<Cons, number> | null = null,
  show: boolean = false
): string {
  if (seen === null) {
    seen = new Set<Cons>();
  }
  if (num === null) {
    num = new Map<Cons, number>();
  }
  if (c === null) {
    return "()";
  }
  if (isCons(c)) {
    const n = num.get(c);
    if (seen.has(c) && !show) {
      return "#" + n + "#";
    }
    seen.add(c);
    if (n !== undefined && !show) {
      return "#" + n + "=" + prettyPrintThing(c, seen, num, true);
    }
    return "(" + prettyPrintNCons(c, seen, num, show) + ")";
  }
  return "" + c;
}
export function safePrintThing(c: Thing): string {
  const seen = new Set<Cons>();
  const num = new Map<Cons, number>();
  function see(
    c: Thing,
    seen: Set<Cons>,
    num: Map<Cons, number>,
    n = { v: 0 }
  ) {
    if (isCons(c)) {
      if (seen.has(c)) {
        if (!num.has(c)) {
          num.set(c, ++n.v);
        }
      } else {
        seen.add(c);
        see(c.car, seen, num, n);
        see(c.cdr, seen, num, n);
      }
    }
  }
  see(c, seen, num);
  return prettyPrintThing(c, null, num);
}

type ParseThing = ParseCons | Prim;
type ParseCons = { _is_ParseCons: true; car: ParseVal; cdr: ParseVal };
function isParseCons(v: any): v is ParseCons {
  return v && v._is_ParseCons === true;
}
type ParseRef = { _is_ref: true; ref: string };
function isRef(v: any): v is ParseRef {
  return v && v._is_ref === true;
}
type ParseVal = ParseThing | null | ParseRef;
type ParseRes = { i: number; v: ParseVal };
export class ParseError extends Error {
  args: any[];
  constructor(a: any[]) {
    super(a[0]);
    this.args = a;
  }
}

//  #1='("foo \"\n\\\"\\ ( + 2 )))\t  \\" (#1# . 2) . #1#)
//const s_string = /^"([^\\"]?(\\.)?)*"&/;
const s_def = /^#\d+=$/;
const s_ref = /^#\d+#$/;
const s_atom = /^(#<[^<>]*>)|("([^\\"]?(\\.)?)*")|([^\(\)]+)$/;
const s_token =
  /(#<[^<>]*>)|("([^\\"]?(\\.)?)*")|(#\d+=)|(#\d+#)|(\()|(\))|(')|([^\(\)\s]+)/;
//const well_formed = /^(\s*(("([^\\"]?(\\.)?)*")|(#\d+=)|(#\d+#)|(\()|(\))|(')|([^\(\)\s]+))\s*)*$/;
function* tokenize(s: string): Iterable<string> {
  const tok = RegExp(s_token, "g");
  for (let i = tok.exec(s); i !== null; i = tok.exec(s)) {
    yield i[0];
  }
}
export function parse(s: string): Thing {
  //assert well_formed.test(s);
  const toks = [...tokenize(s)];
  if (toks === null) {
    throw new ParseError(["S-expr ParseError: no tokens found.", s]);
  }
  const named = new Map<string, ParseVal>();
  const parsed = parse_thing(toks, 0, named);
  if (parsed.i < toks.length) {
    throw new ParseError([
      "S-expr ParseError: early end to parsing",
      parsed.i,
      toks,
      parsed,
    ]);
  }
  return link_refs(parsed.v, named);
}
/* s expression ebnf

   naked_cons := thing naked_cons | thing . thing | \epsilon;
   cons := "(" naked_cons ")"
   thing := ( [DEF]  ( ATOM | cons | quoted )) | REF
   quoted := "'" thing

*/
function parse_cons(
  toks: RegExpMatchArray,
  i: number,
  defs: Map<string, ParseVal>
): ParseRes {
  if (toks[i] != "(") {
    throw new ParseError([
      "S-expr ParseError: expected '(' for a cons at token:",
      i,
      toks,
    ]);
  }
  const r = parse_ncons(toks, i + 1, defs);
  if (toks[r.i] != ")") {
    throw new ParseError([
      "S-expr ParseError: expected ')' for a cons at token:",
      r.i,
      toks,
    ]);
  }
  return { i: r.i + 1, v: r.v };
}
function parse_ncons(
  toks: RegExpMatchArray,
  i: number,
  defs: Map<string, ParseVal>
): ParseRes {
  if (toks[i] === undefined) {
    throw new ParseError(["unmatched '('"]);
  }
  if (toks[i] == ")") {
    // epsilon
    return { i, v: null };
  }
  const icar = parse_thing(toks, i, defs);
  const car = icar.v;
  i = icar.i;
  const icdr =
    toks[i] == "." // thing . thing
      ? parse_thing(toks, i + 1, defs)
      : //thing ncons
        parse_ncons(toks, i, defs);
  return { i: icdr.i, v: { _is_ParseCons: true as const, car, cdr: icdr.v } };
}
function quote(r: ParseRes): ParseRes {
  return {
    i: r.i,
    v: {
      _is_ParseCons: true as const,
      car: "quote",
      cdr: { _is_ParseCons: true as const, car: r.v, cdr: null },
    },
  };
}
function parse_thing(
  toks: RegExpMatchArray,
  i: number,
  defs: Map<string, ParseVal>
): ParseRes {
  //thing := ( [DEF]  ( ATOM | cons | quoted )) | REF
  if (s_ref.test(toks[i])) {
    return {
      i: i + 1,
      v: {
        _is_ref: true as const,
        ref: toks[i].substring(1, toks[i].length - 1),
      },
    };
  }
  //[DEF]  ( ATOM | cons | quoted )
  let ds: string | null = null;
  if (s_def.test(toks[i])) {
    ds = toks[i].substring(1, toks[i].length - 1);
    if (defs.has(ds)) {
      throw new ParseError([
        "S-expr ParseError: double definition of ref key",
        ds,
        "at",
        i,
        toks,
      ]);
    }
    i += 1;
  }

  // quoted | ATOM | cons
  const res =
    toks[i] === "'"
      ? quote(parse_thing(toks, i + 1, defs))
      : s_atom.test(toks[i])
      ? { i: i + 1, v: toks[i] }
      : parse_cons(toks, i, defs);
  if (ds !== null) {
    defs.set(ds, res.v);
  }
  return res;
}
function link_refs(
  r: ParseVal,
  defs: Map<string, ParseVal>,
  map: Map<ParseVal, Thing> | null = null
): Thing {
  if (map === null) {
    map = new Map();
  }
  const map_get_r = map.get(r);
  if (map_get_r !== undefined) {
    return map_get_r;
  }
  if (isRef(r)) {
    const defs_get_r_ref = defs.get(r.ref);
    if (defs_get_r_ref !== undefined) {
      const res = link_refs(defs_get_r_ref, defs, map);
      map.set(r, res);
      return res;
    }
    throw new ParseError([
      "S-expr ParseError: missing key in reference",
      r.ref,
      defs,
    ]);
  }
  if (isParseCons(r)) {
    const res: Thing = new Cons(null, null);
    map.set(r, res);
    res.car = link_refs(r.car, defs, map);
    res.cdr = link_refs(r.cdr, defs, map);
    return res;
  }
  map.set(r, r);
  return r;
}
