import * as Blockly from 'blockly';


//@ts-ignore
//codeGen['controls_ifelse'] = (_block: any) => "foo!";
export const codeGen = new Proxy(new Blockly.Generator("Code"), {
    get(_target, _prop, _receiver) {
        return (_block: any) => "foo!";
    },
    has(_target, _prop) {
        return true;
    }
});
