
import { Scope } from "./scope";
import { Signature } from "./sig";

export type PrimValue = number | string | boolean | bigint | symbol | null | undefined;
export type NonPrimValue = Code |
    IterableIterator<Value> |
    Array<Value>;
export type Value = PrimValue | NonPrimValue;

export function isCode(v: Value): v is CodeLike {
    return !isPrim(v) && (v as Code).is_Code === true;
}
export function isPrim(v: Value): v is PrimValue {
    return v === null || (typeof v !== "object")
}
export function type(v: Value): "number" | "string" | "boolean" | "symbol" | "null" | "undefined" | "bigint" | "iterator" | "array" | "code" {
    const t = typeof v;
    if (t !== "object") {
        if (t === "function") {
            throw Error("unreachable code reached: type(v: Value) given a function");
        }
        return t;
    }
    if (v === null) {
        return "null";
    }
    if (Array.isArray(v)) {
        return "array";
    }
    if (isCode(v)) {
        return "code";
    }
    return "iterator";
}
type foo = `a${string}`;
const a: foo = "ab";
export interface CodeLike {
    is_Code: true;
    run?: (s: Scope<string, Value>) => Value;
    [key: foo]: string;
}
export class Code implements CodeLike {
    is_Code: true = true;
}
export function run(c: Value, s: Scope<string, Value>): Value {
    if (isCode(c) && c.run) {
        return c.run(s);
    }
    return c;
}
//implement things like addition in a library

