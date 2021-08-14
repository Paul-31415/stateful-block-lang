
export type Signature = Array<Argument>;//have the args section of this be a listy thing, have code.signature be a getter to do fancy stuff
//allow for the creation of new arg types using blocks
export type Argument = string | karg<any>;
type karg<T> = {
    name: string,
    key: keyof T,
    type: string,
}


export type Value = Code | IterableIterator<Value> |
    Array<Value> |
    number | string | boolean | bigint | symbol |
    null | undefined;
export function run(code: Value, scope: Scope<string, Value>): Value {
    return isCode(code) ? code.run(scope) : code;
}
export interface Code {
    _is_Code: true;
    signature: Signature;
    run: (s: Scope<string, Value>) => Value;
    assign?: (s: Scope<string, Value>, v: Value) => Value;
    __boolean__?: () => boolean;
    __float__?: () => number;
    __int__?: () => bigint;
    __string__?: () => string;


    __add__?: (o: Value) => Value;
    __mul__?: (o: Value) => Value;
    __div__?: (o: Value) => Value;
    __sub__?: (o: Value) => Value;
    __radd__?: (o: Value) => Value;
    __rmul__?: (o: Value) => Value;
    __rdiv__?: (o: Value) => Value;
    __rsub__?: (o: Value) => Value;
    __lt__?: (o: Value) => boolean;

    __call__?: (a: Value[]) => Value;


}
export function isCode(n: any): n is Code {
    return (n as Code)._is_Code === true;
}
export function isTrue(n: Value): boolean {
    if (isCode(n)) {
        return n.__boolean__ ? n.__boolean__() : true;
    }
    return Boolean(n);
}



//base lang


export class Scope<K, T> extends Map<K, T> implements Code {
    _is_Code: true = true;
    signature = [];
    constructor(public prev?: Scope<K, T>) { super(); }
    run(_s: Scope<string, Value>) { return this; }
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



export class If implements Code {
    _is_Code: true = true;
    constructor(public condition: Value, public ifTrue: Value, public ifFalse: Value) { }
    signature: Signature =
        ['if', { name: 'condition', key: 'condition', type: 'boolean' },
            { name: 'then', key: 'ifTrue', type: 'code' },
            { name: 'else', key: 'ifFalse', type: 'code' }];
    run(s: Scope<string, Value>): Value {
        const cond = run(this.condition, s);
        if (isTrue(cond)) {
            return run(this.ifTrue, s);
        } else {
            return run(this.ifFalse, s);
        }
    }
}

export class Progn implements Code {
    _is_Code: true = true;
    constructor(public body: Value[]) { }
    signature =
        ['progn', { name: 'code', key: 'body', type: 'code' }];
    run(s: Scope<string, Value>): Value {
        let res: Value = undefined;
        for (let i = 0; i < this.body.length; i++) {
            res = run(this.body[i], s);
        }
        return res;
    }
}

export class While implements Code {
    _is_Code: true = true;
    constructor(public condition: Value, public body: Value) { }
    signature = ["while", { name: "cond", key: 'condition', type: 'boolean' },
        { name: "loop", key: 'body', type: 'code' }];
    run(s: Scope<string, Value>): Value {
        let res: Value = undefined;
        while (isTrue(run(this.condition, s))) {
            res = run(this.body, s);
        }
        return res;
    }
}

export class Assign implements Code {
    _is_Code: true = true;
    constructor(public name: string, public exp: Value) { }
    signature =
        [{ name: "lval", key: 'name', type: 'string' },
            "=",
        { name: "rval", key: 'exp', type: 'value' }];
    run(s: Scope<string, Value>): Value {
        const v = run(this.exp, s);
        s.set(this.name, v);
        return v;
    }
}

export class Var implements Code {
    _is_Code: true = true;
    constructor(public name: string) { }
    get signature() {
        return [this.name];
    }
    run(s: Scope<string, Value>): Value {
        return s.get(this.name) as Value;
    }
}

export class Add implements Code {
    _is_Code: true = true;
    constructor(public args: Value[]) { }
    signature = ['+', { name: "lval", key: 'args', type: 'value' }];
    run(s: Scope<string, Value>): Value {
        let res: Value = 0;
        for (let i = 0; i < this.args.length; i++) {
            const r = run(this.args[i], s);
            if (isCode(r)) {
                res = r.__radd__ ? r.__radd__(res) : undefined;
            } else {
                //@ts-ignore
                res += r;
            }
        }
        return res;
    }
}

export class Div implements Code {
    _is_Code: true = true;
    constructor(public args: Value[]) { }
    signature = ['/', { name: "lval", key: 'args', type: 'value' }];;
    run(s: Scope<string, Value>): Value {
        let res = this.args.length > 0 ? run(this.args[0], s) : 1;
        for (let i = 1; i < this.args.length; i++) {
            const r = run(this.args[i], s);
            if (isCode(r)) {
                res = r.__rdiv__ ? r.__rdiv__(res) : undefined;
            } else {
                //@ts-ignore
                res /= r;
            }
        }
        return res;
    }
}

export class LT implements Code {
    _is_Code: true = true;
    constructor(public a: Value, public b: Value) { }
    signature = [{ name: "lval", key: 'a', type: 'value' }, '<', { name: "rval", key: 'b', type: 'value' }];;
    run(s: Scope<string, Value>): Value {
        const lhs = run(this.a, s);
        const rhs = run(this.b, s);
        //@ts-ignore
        return lhs.__lt__ ? lhs.__lt__(rhs) : lhs < rhs;
    }
}

export class Print implements Code {
    _is_Code: true = true;
    constructor(public v: Value) { }
    signature = ['print', { name: "v", key: 'v', type: 'value' }];
    run(s: Scope<string, Value>): Value {
        const r = run(this.v, s);
        console.log(r);
        return r;
    }
}
export type Arg = string;
export class Closure implements Code {
    _is_Code: true = true;
    constructor(public args: Arg[], public def: Code, public scope: Scope<string, Value>) { }
    get signature() {
        return this.args;
    }
    run(_s: Scope<string, Value>): Value {
        return this;
    }
    __call__(a: Value[]) {
        //todo
        return a[0];

    }
}
export class Lambda implements Code {
    _is_Code: true = true;
    constructor(public args: Arg[], public def: Code) { }
    signature = ['lambda',];
    run(s: Scope<string, Value>): Value {
        return new Closure(this.args, this.def, new Scope(s));
    }
}
export class Call implements Code {
    _is_Code: true = true;
    constructor(public func: Code, public args: Code[]) { }
    signature = [];
    run(s: Scope<string, Value>): Value {
        const f = this.func.run(s);
        const a = this.args.map((v) => v.run(s));
        return isCode(f) ? (f.__call__ ? f.__call__(a) : f) : f;
    }
}

