import * as React from 'react';
import * as Sig from "./lang/sig";
import * as Core from "./lang/core";




export function Value(props: { val: Core.Value }) {


}


/*
export function BlockInput(props: { block: B.Code, inp: any /*keyof block* / }) {
    const v = (props.block as any)[props.inp] as any as B.Value;
    if (v && B.isCode(v)) {
        return <Block block={v} />;
    }
    if (Array.isArray(v)) {
        return (
            <div> [
                {...v.map((e, i) => {
                    return (<Block key={i.toString()} block={e} />);
                })}
                ]
            </div>
        );
    }
    switch (typeof v) {
        case "bigint":
            return (
                <div>
                    {(typeof v)}
                    <input
                        type="number"
                        value={v.toString()}
                        onChange={(e) => { (props.block as any)[props.inp] = BigInt(e.target.value) }}
                    />
                </div>);
        case "number":
            return (
                <div>
                    {(typeof v)}
                    <input
                        type="number"
                        value={v}
                        onChange={(e) => { (props.block as any)[props.inp] = (e.target.value) }}
                    />
                </div>);
        case "boolean":
        case "function":
        case "string":
        case "symbol":
            return (
                <div>
                    {(typeof v)}
                    <textarea value={v.toString()}
                        onChange={(e) => { (props.block as any)[props.inp] = e.target.value }} />
                </div>);
        case "undefined":
            return <div>___</div>;
        default:
            return <div>???</div>;
    }
}


export function Block(props: { block: B.Value }) {
    if (B.isCode(props.block)) {
        const sig = props.block.signature;
        return (
            <div>(
                {...sig.map((e, i) => {
                    if (typeof e === "string") {
                        return (<div key={i.toString()}> {e} </div>);
                    }
                    return (<BlockInput key={i.toString()} block={props.block as any} inp={e.key as any} />);
                })})
            </div>
        );
    } else if (Array.isArray(props.block)) {
        return (
            <div> [
                {...props.block.map((e, i) => {
                    return (<Block key={i.toString()} block={e} />);
                })}
                ]
            </div>
        );
    } else {
        let s: string;
        switch (typeof props.block) {
            case "bigint":
                return (
                    <div>
                        {(typeof props.block)}
                        <input
                            type="number"
                            value={props.block.toString()}
                        />
                    </div>);
            case "number":
                return (
                    <div>
                        {(typeof props.block)}
                        <input
                            type="number"
                            value={props.block}
                        />
                    </div>);
            case "boolean":
            case "function":
            case "string":
            case "symbol":
                return (
                    <div>
                        {(typeof props.block)}
                        <textarea value={props.block.toString()} />
                    </div>);
            case "undefined":
                return <div>___</div>;
            default:
                return <div>???</div>;
        }

    }
}
*/
