import { AppBar, IconButton, Toolbar, Typography } from '@material-ui/core';
import Drawer from '@material-ui/core/Drawer';
import MenuIcon from '@material-ui/icons/Menu';
import { makeStyles } from '@material-ui/styles';
import * as React from 'react';
import { useState } from 'react';


const useStyles = makeStyles({
    menuButton: {
        marginRight: 2,
    },
    title: {
        flexGrow: 1,
    },
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
            <Drawer open={open} onClose={() => setOpen(false)}>
                <button> nine </button>
                <text> morkus splorkus </text>
                <div>I can now be moven'd around!</div>
            </Drawer>
        </>
    );
}
