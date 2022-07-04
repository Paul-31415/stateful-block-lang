import { AppBar, Button, IconButton, Toolbar, Typography } from '@material-ui/core';
import Drawer from '@material-ui/core/Drawer';
import MenuIcon from '@material-ui/icons/Menu';
import { makeStyles } from '@material-ui/styles';
import * as React from 'react';
import { useState } from 'react';
import { Block, BlocklyComponent, Field, Shadow, Value } from './blockly_component';

const useStyles = makeStyles({
    menuButton: {
        marginRight: 2,
    },
    title: {
        flexGrow: 1,
    },
    sidebar: {
        width: 600,
    }
});


export default function MenuBar() {
    const classes = useStyles();
    const [open, setOpen] = useState(false);

    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    <IconButton
                        onClick={() => setOpen(true)}
                        edge="start"
                        className={classes.menuButton}
                        color="inherit" aria-label="menu">
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" className={classes.title}>
                        News
                    </Typography>
                </Toolbar>
            </AppBar>
            <Drawer
                open={open}
                onClose={() => setOpen(false)}
                variant="persistent">
                <Button onClick={() => setOpen(false)}> button </Button>
                <div className={classes.sidebar}>
/*                    <BlocklyComponent
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
                        <Block type="lambda" />
                    </BlocklyComponent>*/
                </div>
            </Drawer>
        </>
    );
}
