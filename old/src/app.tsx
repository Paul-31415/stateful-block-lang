import { Button, Slider } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import * as React from 'react';
//import * as Blockly from 'blockly';
import * as B from "./lang/base";
import * as B2 from "./lang/base2";
import { Stage, Sprite, AppConsumer, Graphics } from '@inlet/react-pixi';
import { Split } from '@geoffcox/react-splitter';
import { useState } from 'react';
import MenuBar from './menu_bar';
import { Block } from './editor';
//import 'blockly/blocks';
//import * as BlocklyJS from 'blockly/javascript';
//import { Block, BlocklyComponent, Field, Shadow, Value } from './blockly_component';
//import './custom_blocks';
//import "./example";
//import { codeGen } from "./codeGen";


const useStyles = makeStyles({
    root: {
        flexGrow: 1,
    },
});



function App() {
    const testBlock = new B2.Add([BigInt(1), new B2.Assign("abc", 3)]);
    return (
        <Split>
            <div>
                <Block block={testBlock} />
            </div>
            <div>This is the right pane.</div>
        </Split>
    );
}

export default App;
