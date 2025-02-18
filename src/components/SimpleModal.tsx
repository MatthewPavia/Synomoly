import { Modal, ScrollArea, Stack, Text, Title } from "@mantine/core";
import { capitalizeFirstLetter } from "../utils/StringUtils";
import React from "react";

interface SimpleModalProps{
    isOpen:boolean;
    onClose: () => void;
    children: React.ReactElement;
}

function SimpleModal(props:SimpleModalProps) {
    return (
        <Modal 
            color="red" 
            opened={props.isOpen} 
            onClose={() => props.onClose()}
            centered 
            styles={{
                content: { backgroundColor: '#242424', color: 'white' },
                header: { backgroundColor: '#242424', color: 'white' }
            }}
        >
            {props.children}
        </Modal>
    )
}

export default SimpleModal
