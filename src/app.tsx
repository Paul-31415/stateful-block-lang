import { Button, Slider } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import * as React from 'react';
import { useState } from 'react';
import MenuBar from './menu_bar';
import 'blockly/blocks';
import { Block, BlocklyComponent, Field, Shadow, Value } from './blockly_component';
import './custom_blocks';

const useStyles = makeStyles({
    root: {
        flexGrow: 1,
    },
});

function App() {
    const classes = useStyles();
    const [x, setX] = useState(0);

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
            <BlocklyComponent
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
