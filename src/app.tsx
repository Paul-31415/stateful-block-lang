import { Button, Slider } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import * as React from 'react';
import * as Blockly from 'blockly';
import * as B from "./lang/base";
import * as B2 from "./lang/base2";
import { useState } from 'react';
import MenuBar from './menu_bar';
import 'blockly/blocks';
//import * as BlocklyJS from 'blockly/javascript';
import { Block, BlocklyComponent, Field, Shadow, Value } from './blockly_component';
import './custom_blocks';
import "./example";
import { codeGen } from "./codeGen";

import * as PIXI from "pixi.js";

const useStyles = makeStyles({
    root: {
        flexGrow: 1,
    },
});

const pixelRatio = window.devicePixelRatio || 1;
const app = new PIXI.Application({
    width: window.innerWidth * pixelRatio,
    height: window.innerHeight * pixelRatio,
    autoDensity: true
});

(window as any).app = app;
document.body.appendChild(app.view);


function App() {
    const classes = useStyles();
    const [x, setX] = useState(0);
    const [bws, setBws] = useState<Blockly.Workspace | undefined>(undefined);
    {
        const b = B;
        console.log(b);
        /*const prog = new B.Progn([
            new B.Assign("a", 0),
            new B.Assign("i", 0),
            new B.While(true,
                new B.Progn([
                    new B.Assign("upper", new B.Add([new B.Var("i"), 1000000])),
                    new B.Print(new B.While(new B.LT(new B.Var("i"), new B.Var("upper")),
                        new B.Assign("a", new B.Add([new B.Var("a"), new B.Div([1, new B.Assign("i", new B.Add([new B.Var('i'), 1]))])]))

                    ))
                ])
            )

           ]);*/
        const prog = new B.Progn([
            new B.Assign("a", new B.Float(0)),
            new B.Assign("i", new B.Float(0)),
            new B.While(new B.Bool(true),
                new B.Progn([
                    new B.Assign("upper", new B.Add([new B.Var("i"), new B.Float(1000000)])),
                    new B.Print(new B.While(new B.LT(new B.Var("i"), new B.Var("upper")),
                        new B.Assign("a", new B.Add([new B.Var("a"), new B.Div([new B.Float(1), new B.Assign("i", new B.Add([new B.Var('i'), new B.Float(1)]))])]))

                    ))
                ])
            )

        ]);
        const sc = () => new B.Scope<string, B.Value>();
        const time = (n: number) => {
            const prog = new B.Progn([
                new B.Assign("a", new B.Float(0)),
                new B.Assign("i", new B.Float(0)),
                new B.While(new B.LT(new B.Var("i"), new B.Float(n)),
                    new B.Assign("a", new B.Add([new B.Var("a"), new B.Div([new B.Float(1), new B.Assign("i", new B.Add([new B.Var('i'), new B.Float(1)]))])]))
                )
            ]);
            const scope = sc();
            const s = window.performance.now();
            const r = prog.run(scope);
            const e = window.performance.now();
            return { res: r, time: e - s, prog, scope };
        }
        const time2 = (n: number) => {
            const prog = new B2.Progn([
                new B2.Assign("a", 0),
                new B2.Assign("i", 0),
                new B2.While(new B2.LT(new B2.Var("i"), n),
                    new B2.Assign("a", new B2.Add([new B2.Var("a"), new B2.Div([1, new B2.Assign("i", new B2.Add([new B2.Var('i'), 1]))])]))
                )
            ]);
            const scope = new B2.Scope<string, B2.Value>();
            const s = window.performance.now();
            const r = prog.run(scope);
            const e = window.performance.now();
            return { res: r, time: e - s, prog, scope };
        }
        const timej = (n: number) => {
            let a = 0;
            const s = window.performance.now();
            for (let i = 0; i < n; i++) {
                a += 1 / (i + 1)
            }
            const e = window.performance.now();
            return { res: a, time: e - s };
        }
        debugger;
    }

    const generateCode = () => {
        if (bws) {
            //@ts-ignore
            /*const code = BlocklyJS.workspaceToCode(
                
            );*/
            //console.log(bws);
            const code = codeGen.workspaceToCode(bws);
            console.log(code);
        }
    }

    return (
        <div className="App">
            <MenuBar />
            <div className="App-header">
                <h2>Welcome to React hi hello</h2>
            </div>
            <p className="App-intro">
                To get started, edit <code>src/App.tsx</code> and save to reload.
            </p>
            <p className="App-intro">
                Here's a number x = {x}
            </p>
            <Button variant="contained" onClick={() => setX(x + 1)}>
                Increment x
            </Button>
            <Button variant="contained" onClick={() => setX(x - 1)}>
                Decrement x
            </Button>
            <Button variant="contained" onClick={() => setX(x / 2)}>
                Crement x
            </Button>
            <Slider
                value={2} onChange={(_element, b) => setX(b as number)}>
            </Slider>
            <button onClick={generateCode}>Convert</button>
            <BlocklyComponent bref={setBws}
                readOnly={false} trashcan={true} media={'media/'}
                move={{
                    scrollbars: true,
                    drag: true,
                    wheel: true
                }}
                initialXml={`
<xml xmlns="http://www.w3.org/1999/xhtml">
<block type="controls_ifelse" x="0" y="0"></block>
</xml>
            `}>
                <Block type="controls_ifelse" />
                <Block type="logic_compare" />
                <Block type="logic_operation" />
                <Block type="controls_repeat_ext">
                    <Value name="TIMES">
                        <Shadow type="math_number">
                            <Field name="NUM">10</Field>
                        </Shadow>
                    </Value>
                </Block>
                <Block type="logic_operation" />
                <Block type="logic_negate" />
                <Block type="logic_boolean" />
                <Block type="logic_null" disabled="true" />
                <Block type="logic_ternary" />
                <Block type="text_charAt">
                    <Value name="VALUE">
                        <Block type="variables_get">
                            <Field name="VAR">text</Field>
                        </Block>
                    </Value>
                </Block>
                <Block type="custom_block_1" />
            </BlocklyComponent>
        </div >
    );
}

export default App;
