type thingy = { value: any };

abstract class Code {

    abstract [Symbol.iterator](): IterableIterator<Code>;
    //        yield* this.children;
    //    }
    abstract run(s: Scope<string, thingy>): thingy;
    assign(_s: Scope<string, thingy>, _v: thingy) {
        throw SyntaxError("not l-value");
    }
}
class Const extends Code {
    constructor(public val: any) { super(); }
    run(_s: Scope<string, thingy>) { return { value: this.val }; }
    *[Symbol.iterator]() { }
}

class If extends Code {
    constructor(public test: Code, public yes: Code, public no?: Code) { super(); }
    run(s: Scope<string, thingy>) {
        if (this.test.run(s).value) {
            return this.yes.run(s);
        }
        return { value: this.no && this.no.run(s).value };
    }
    *[Symbol.iterator]() {
        yield this.test;
        yield this.yes;
        if (this.no) {
            yield this.no;
        }
    }
}
class Var extends Code {
    constructor(public name: string) { super(); }
    run(s: Scope<string, thingy>) {
        return s.get(this.name) ?? { value: undefined };
    }
    *[Symbol.iterator]() { }
    assign(s: Scope<string, thingy>, v: thingy) {
        s.set(this.name, v);
    }
}
/*
class ForRange extends Code {
    low?: Code;
    high: Code;
    step?: Code;
    loopVar: Var;
    constructor(public code: Code, l: Code, h?: Code, s?: Code) {
        super();
        if (h) {
            this.low = l;
            this.high = h;
            this.step = s;
        } else {
            this.high = l;
        }
        this.loopVar = new Var(undefined);
    }
    run(s: Scope<string, thingy>) {
        const low = this.low ? this.low.run(s).value as number : 0;
        const high = this.high.run(s).value;
        const step = this.step ? this.step.run(s).value as number : 1;
        let res = { value: undefined };
        for (this.loopVar.val = low; this.loopVar.val < high; this.loopVar.val += step) {
            res = this.code.run(s);
        }
        return res;
    }
    *[Symbol.iterator]() {
        if (this.low) yield this.low;
        yield this.high;
        if (this.step) yield this.step;
        yield this.loopVar;
        yield this.code;
    }
}*/

class Assign extends Code {
    constructor(public target: Code, public value: Code) { super(); }
    run(s: Scope<string, thingy>) {
        this.target.assign(s, this.value.run(s));
        return this.target.run(s);
    }
    *[Symbol.iterator]() {
        yield this.target;
        yield this.value;
    }
}

abstract class Bop extends Code {
    constructor(public lhs: Code, public rhs: Code) { super(); }
    run(s: Scope<string, thingy>) {
        return { value: this.op(this.lhs.run(s).value, this.rhs.run(s).value) };
    }
    *[Symbol.iterator]() {
        yield this.lhs;
        yield this.rhs;
    }
    abstract op(a: any, b: any): any
}

class Sum extends Bop {
    op(a: any, b: any): any {
        return (a as number) + (b as number);
    }
}
class Div extends Bop {
    op(a: any, b: any): any {
        return (a as number) / (b as number);
    }
}

class Print extends Code {
    constructor(public val: Code) { super(); }
    *[Symbol.iterator]() {
        yield this.val;
    }
    run(s: Scope<string, thingy>) {
        const r = this.val.run(s);
        console.log(r.value);
        return r;
    }
}
class Sequence extends Code {
    constructor(public code: Code[]) { super(); }
    *[Symbol.iterator]() {
        yield* this.code;
    }
    run(s: Scope<string, thingy>) {
        const res = [];
        for (let i = 0; i < this.code.length; i++) {
            res.push(this.code[i].run(s).value);
        }
        return { value: res };
    }
}







//need to be okay with this:
/*
//

def foo(a):
  b = 2
  def gar(c):
    b += c
    return b+a
  return gar

also with recursion

def a(b,c):
  if b == 0:
    return b
  def rec(d):
    return d+b
  return c(a(b-1,rec))

*/
//
class Lambda {
    constructor(public scope: Scope<string, thingy>,
        public args: string[],
        public def: Code) { }
    call(args: thingy[]) {
        for (let i = 0; i < this.args.length && i < args.length; i++) {
            this.scope.setHere(this.args[i], args[i]);
        }
        return this.def.run(this.scope);
    }
    *[Symbol.iterator]() {
        yield this.def;
    }
}
class LambdaDef extends Code {
    constructor(public args: string[], public def: Code) { super(); }
    run(s: Scope<string, thingy>) {
        return { value: new Lambda(new Scope(s), this.args, this.def) }
    }
    *[Symbol.iterator]() {
        yield this.def;
    }
}

class LambdaCall extends Code {
    constructor(public lambda: Lambda, public args: Code[]) { super(); }
    *[Symbol.iterator]() {
        yield* this.lambda;
        yield* this.args;
    }
    run(s: Scope<string, thingy>) {
        const al: thingy[] = [];
        for (let i = 0; i < this.args.length; i++) {
            al.push(this.args[i].run(s));
        }
        return this.lambda.call(al);
    }
}








class Scope<K, T> extends Map<K, T>{
    constructor(public prev?: Scope<K, T>) { super(); }
    get(k: K): T | undefined {
        return super.get(k) ?? this.prev?.get(k);
    }
    private set_rec(k: K, v: T): boolean {
        if (super.has(k)) {
            super.set(k, v);
            return true;
        }
        return Boolean(this.prev?.set_rec(k, v));
    }
    set(k: K, v: T) {
        if (super.has(k)) {
            super.set(k, v);
            return this;
        }
        if (!this.prev?.set_rec(k, v)) {
            super.set(k, v);
        }
        return this;
    }
    setHere(k: K, v: T) {
        super.set(k, v);
        return this;
    }
    has(k: K): boolean {
        return Boolean(super.has(k) || this.prev?.has(k));
    }
    /*clear() {
        super.clear();
        this.prev = undefined;
    }
    delete(k:K){
        return super.delete(k) || this.prev?.delete(k);
    }*/

}














/*
const ctrVar = new Var(0);
const totVar = new Var(0);
const harm = new ForRange(new Sequence([
    new Print(totVar),
    new ForRange(new Assign(totVar, new Sum(totVar, new Div(new Const(1), new Assign(ctrVar, new Sum(ctrVar, new Const(1))))))
        , new Const(1000000)),
]), new Const(1000000));
*/
function harmf() {
    let tot = 0;
    let ctr = 0;
    for (let i = 0; i < 1000000; i++) {
        console.log(tot);
        for (let j = 0; j < 1000000; j++) {
            tot += 1 / (++ctr);
        }
    }
}
console.log(harmf);
