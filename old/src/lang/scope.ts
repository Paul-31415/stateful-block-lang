
import { CodeLike } from "./core";

export class Scope<K, T> extends Map<K, T> implements CodeLike {
    is_Code: true = true;
    signature = [];
    constructor(public prev?: Scope<K, T>) { super(); }
    get(k: K): T | undefined {
        return super.get(k) ?? this.prev?.get(k);
    }
    set(k: K, v: T) {
        if (this.setIfHas(k, v)) {
            return this;
        }
        return this.setLocal(k, v);
    }
    setLocal(k: K, v: T) {
        super.set(k, v);
        return this;
    }
    setIfHas(k: K, v: T): boolean {
        if (this.hasLocal(k)) {
            super.set(k, v);
            return true;
        }
        return this.prev?.setIfHas(k, v);
    }
    has(k: K): boolean {
        return Boolean(super.has(k) || this.prev?.has(k));
    }
    hasLocal(k: K): boolean {
        return super.has(k);
    }
}

