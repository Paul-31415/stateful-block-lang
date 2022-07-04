import * as Blockly from 'blockly/core';

// Made with https://blockly-demo.appspot.com/static/demos/blockfactory/index.html
const custom_block_1 = {
    "type": "hello_world",
    "message0": "Taco %1 Moose %2 %3",
    "args0": [
        {
            "type": "input_value",
            "name": "left",
            "check": "Number"
        },
        {
            "type": "input_value",
            "name": "right",
            "check": "String"
        },
        {
            "type": "input_statement",
            "name": "NAME"
        }
    ],
    "colour": 230,
    "tooltip": "I'm a block",
    "helpUrl": ""
};

type Initable = {
    jsonInit: (json: Object) => unknown;
}

Blockly.Blocks['custom_block_1'] = {
    init: function(this: Initable) {
        // TODO: What is the type of 'this'
        this.jsonInit(custom_block_1);
    }
}
Blockly.Blocks['lambda'] = {
    init: function(this: Initable) {
        this.jsonInit(
            {
                "type": "function",
                "message0": "lambda %1 %2",
                "args0": [
                    {
                        "type": "input_value",
                        "name": "args",
                        "check": "String"
                    },
                    {
                        "type": "input_statement",
                        "name": "defn"
                    }
                ],
                "colour": 245,
                "tooltip": "function",
                "helpUrl": ""
            }

        );
    }
}
