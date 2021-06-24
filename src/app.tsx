import { Button, Slider } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import * as React from 'react';
import { useState } from 'react';
import MenuBar from './menu_bar';
import { BlocklyWorkspace } from "react-blockly";
import Blockly from "blockly";

const useStyles = makeStyles({
    root: {
        flexGrow: 1,
    },
});

function App() {
    const classes = useStyles();
    const [x, setX] = useState(0);

    const [xml, setXml] = useState("");
    const [javascriptCode, setJavascriptCode] = useState("");

    const initialXml =
        '<xml xmlns="http://www.w3.org/1999/xhtml"><block type="text" x="70" y="30"><field name="TEXT"></field></block></xml>';
    const toolboxCategories = {
        kind: "categoryToolbox",
        contents: [
            {
                kind: "category",
                name: "Logic",
                colour: "#5C81A6",
                contents: [
                    {
                        kind: "block",
                        type: "controls_if",
                    },
                    {
                        kind: "block",
                        type: "logic_compare",
                    },
                ],
            },
            {
                kind: "category",
                name: "Math",
                colour: "#5CA65C",
                contents: [
                    {
                        kind: "block",
                        type: "math_round",
                    },
                    {
                        kind: "block",
                        type: "math_number",
                    },
                ],
            },
            {
                kind: "category",
                name: "Custom",
                colour: "#5CA699",
                contents: [
                    {
                        kind: "block",
                        type: "new_boundary_function",
                    },
                    {
                        kind: "block",
                        type: "return",
                    },
                ],
            },
        ],
    };
    function workspaceDidChange(workspace) {
        const code = (Blockly as any).JavaScript.workspaceToCode(workspace);
        setJavascriptCode(code);
    }



    return (
        <div className="App">
            <MenuBar />
            <div className="App-header">
                <h2>Welcome to React hi hello</h2>
            </div>
            <p className="App-intro">
                To get started, edit <code>src/App.tsx</code> and sav ee to reload. Okay.
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
                value={2} onChange={(_ebebnt, b) => setX(b as number)}>
                ß¬ˆπ
            </Slider>
            <div>
                barubo goondstromg
            </div>
            <BlocklyWorkspace
                toolboxConfiguration={toolboxCategories}
                initialXml={initialXml}
                className="fill-height"
                workspaceConfiguration={{
                    grid: {
                        spacing: 20,
                        length: 3,
                        colour: "#ccc",
                        snap: true,
                    },
                }}
                onWorkspaceChange={workspaceDidChange}
                onXmlChange={setXml}
            />
            <pre id="generated-xml">{xml}</pre>
            <textarea
                id="code"
                style={{ height: "200px", width: "400px" }}
                value={javascriptCode}
                readOnly
            >helo</textarea>


        </div>
    );
}

export default App;
