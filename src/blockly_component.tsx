import { makeStyles } from '@material-ui/styles';
import * as Blockly from 'blockly';
import * as React from 'react';
import { useRef, useState, useEffect } from 'react';

type BlocklyComponentProps = {
    initialXml?: string,
    children?: React.ReactNode,
} & Blockly.BlocklyOptions;

const useStyles = makeStyles({
    blocklyDiv: {
        height: '50%',
        width: '100%',
        position: 'absolute',
        buttom: 0,
    }
});

declare global {
    namespace JSX {
        interface IntrinsicElements {
            xml: React.DetailedHTMLProps<React.HTMLAttributes<XMLDocument>
                & { xmlns: string }, XMLDocument>;
        }
    }
}

export function BlocklyComponent({ initialXml, children, ...blocklyOptions }: BlocklyComponentProps) {
    const classes = useStyles();
    const blocklyDiv = useRef<HTMLDivElement>(null);
    const toolbox = useRef();
    const [primaryWorkspace, setPrimaryWorkspace]
        = useState<Blockly.Workspace | undefined>();

    useEffect(() => {
        if (blocklyDiv.current) {
            setPrimaryWorkspace(
                Blockly.inject(blocklyDiv.current, {
                    toolbox: toolbox.current,
                    ...blocklyOptions,
                })
            );
        }
    }, [blocklyDiv]);

    useEffect(() => {
        if (initialXml && primaryWorkspace) {
            Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(initialXml),
                primaryWorkspace);
        }
    }, [initialXml, primaryWorkspace]);

    return (
        <>
            <div className={classes.blocklyDiv} ref={blocklyDiv} id="blocklyDiv" />
            <xml xmlns="https://developers.google.com/blockly/xml"
                is="blockly" style={{ display: 'none' }}
                ref={toolbox as unknown as React.RefObject<XMLDocument>}>
                {children}
            </xml>
        </>
    )
}

interface BlockComponentProps {
    children?: React.ReactNode,
    is?: string,
    [index: string]: unknown,
}

export function Block({ children, ...props }: BlockComponentProps) {
    props.is = "blockly";
    return React.createElement("block", props, children);
}

export function Category({ children, ...props }: BlockComponentProps) {
    props.is = "blockly";
    return React.createElement("category", props, children);
}

export function Value({ children, ...props }: BlockComponentProps) {
    props.is = "blockly";
    return React.createElement("value", props, children);
}

export function Field({ children, ...props }: BlockComponentProps) {
    props.is = "blockly";
    return React.createElement("field", props, children);
}

export function Shadow({ children, ...props }: BlockComponentProps) {
    props.is = "blockly";
    return React.createElement("shadow", props, children);
}
