export function isCode(n) {
    return n._is_Code === true;
}
//base lang
//primitive types
export class Val {
    constructor() {
        this._is_Code = true;
        this.signature = {};
    }
    run(_s) { return this; }
}
export class Nil extends Val {
    truthyness() { return false; }
}
export class Bool extends Val {
    constructor(v) {
        super();
        this.v = v;
    }
    ;
    truthyness() { return this.v; }
}
export class Float extends Val {
    constructor(v) {
        super();
        this.v = v;
    }
    ;
    truthyness() { return this.v !== 0; }
}
export class Int extends Val {
    constructor(v) {
        super();
        this.v = v;
    }
    ;
    truthyness() { return this.v !== BigInt(0); }
}
export class String extends Val {
    constructor(v) {
        super();
        this.v = v;
    }
    ;
    truthyness() { return this.v.length !== 0; }
}
export class List extends Val {
    constructor(v) {
        super();
        this.v = v;
    }
    ;
    truthyness() { return this.v.length !== 0; }
}
export class Sett extends Val {
    constructor(v) {
        super();
        this.v = v;
    }
    ;
    truthyness() { return this.v.size !== 0; }
}
export class Scope extends Map {
    constructor(prev) {
        super();
        this.prev = prev;
        this._is_Code = true;
        this.signature = {};
    }
    run(_s) { return this; }
    get(k) {
        return super.get(k) ?? this.prev?.get(k);
    }
    set_rec(k, v) {
        if (super.has(k)) {
            super.set(k, v);
            return true;
        }
        return Boolean(this.prev?.set_rec(k, v));
    }
    set(k, v) {
        if (super.has(k)) {
            super.set(k, v);
            return this;
        }
        if (!this.prev?.set_rec(k, v)) {
            super.set(k, v);
        }
        return this;
    }
    setHere(k, v) {
        super.set(k, v);
        return this;
    }
    has(k) {
        return Boolean(super.has(k) || this.prev?.has(k));
    }
}
export function isTrue(n) {
    if (isCode(n)) {
        return n.truthyness ? n.truthyness() : true;
    }
    return true;
}
export class If {
    constructor(condition, ifTrue, ifFalse) {
        this.condition = condition;
        this.ifTrue = ifTrue;
        this.ifFalse = ifFalse;
        this._is_Code = true;
        this.signature = {};
    }
    run(s) {
        const cond = this.condition.run(s);
        if (isTrue(cond)) {
            return this.ifTrue.run(s);
        }
        else {
            return this.ifFalse.run(s);
        }
    }
}
export class Progn {
    constructor(body) {
        this.body = body;
        this._is_Code = true;
        this.signature = {};
    }
    run(s) {
        let res = new Val();
        for (let i = 0; i < this.body.length; i++) {
            res = this.body[i].run(s);
        }
        return res;
    }
}
export class While {
    constructor(condition, body) {
        this.condition = condition;
        this.body = body;
        this._is_Code = true;
        this.signature = {};
    }
    run(s) {
        let res = new Val();
        while (isTrue(this.condition.run(s))) {
            res = this.body.run(s);
        }
        return res;
    }
}
export class Assign {
    constructor(name, exp) {
        this.name = name;
        this.exp = exp;
        this._is_Code = true;
        this.signature = {};
    }
    run(s) {
        const v = this.exp.run(s);
        s.set(this.name, v);
        return v;
    }
}
export class Var {
    constructor(name) {
        this.name = name;
        this._is_Code = true;
        this.signature = {};
    }
    run(s) {
        return s.get(this.name);
    }
}
export class Add {
    constructor(args) {
        this.args = args;
        this._is_Code = true;
        this.signature = {};
    }
    run(s) {
        let res = new Float(0);
        for (let i = 0; i < this.args.length; i++) {
            res.v += this.args[i].run(s).v;
        }
        return res;
    }
}
export class Div {
    constructor(args) {
        this.args = args;
        this._is_Code = true;
        this.signature = {};
    }
    run(s) {
        let res = this.args.length > 0 ? new Float(this.args[0].run(s).v) : new Float(1);
        for (let i = 1; i < this.args.length; i++) {
            res.v /= this.args[i].run(s).v;
        }
        return res;
    }
}
export class LT {
    constructor(a, b) {
        this.a = a;
        this.b = b;
        this._is_Code = true;
        this.signature = {};
    }
    run(s) {
        const lhs = this.a.run(s);
        const rhs = this.b.run(s);
        return new Bool(lhs.v < rhs.v);
    }
}
