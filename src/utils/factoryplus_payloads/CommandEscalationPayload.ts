/*
 * Factory+ / AMRC Connectivity Stack (ACS) Files component
 * Copyright 2023 AMRC
 */

import {UPayload} from 'sparkplug-payload';

const Command_Escalation_Birth_Payload: UPayload = {
    metrics: [
        {
            name: 'Command_Request_Template',
            type: 'Template',
            value: {
                isDefinition: true,
                version: '',
                metrics: [
                    {name: 'Receivers_Group_ID', value: null, type: 'String'},
                    {name: 'Receivers_Edge_Node_ID', value: null, type: 'String'},
                    {name: 'Receivers_Device_ID', value: null, type: 'String'},
                    {name: 'Tag_Path', value: null, type: 'String'},
                    {name: 'Tag_Value', value: null, type: 'String'},
                    {name: 'Command_Timestamp', value: null, type: 'DateTime'},
                ],
            },
        },
        {
            name: 'Command_Response_Template',
            type: 'Template',
            value: {
                isDefinition: true,
                version: '',
                metrics: [
                    {name: 'Receivers_Group_ID', value: null, type: 'String'},
                    {name: 'Receivers_Edge_Node_ID', value: null, type: 'String'},
                    {name: 'Receivers_Device_ID', value: null, type: 'String'},
                    {name: 'Tag_Path', value: null, type: 'String'},
                    {name: 'Response', value: null, type: 'String'},
                    {name: 'Command_Timestamp', value: null, type: 'DateTime'},
                ],
            },
        },
        {
            name: 'Execute_Remote_Command',
            type: 'Template',
            value: {
                isDefinition: false,
                templateRef: 'Command_Request_Template',
                version: '',
                metrics: [
                    {name: 'Receivers_Group_ID', value: null, type: 'String'},
                    {name: 'Receivers_Edge_Node_ID', value: null, type: 'String'},
                    {name: 'Receivers_Device_ID', value: null, type: 'String'},
                    {name: 'Tag_Path', value: null, type: 'String'},
                    {name: 'Tag_Value', value: null, type: 'String'},
                    {name: 'Command_Timestamp', value: null, type: 'DateTime'},
                ],
            },
        },
        {
            name: 'Remote_Command_Response',
            type: 'Template',
            value: {
                isDefinition: false,
                templateRef: 'Command_Response_Template',
                version: '',
                metrics: [
                    {name: 'Receivers_Group_ID', value: null, type: 'String'},
                    {name: 'Receivers_Edge_Node_ID', value: null, type: 'String'},
                    {name: 'Receivers_Device_ID', value: null, type: 'String'},
                    {name: 'Tag_Path', value: null, type: 'String'},
                    {name: 'Response', value: null, type: 'String'},
                    {name: 'Command_Timestamp', value: null, type: 'DateTime'},
                ],
            },
        },
        {
            name: 'Remote_Command_Response_JSON',
            value: null,
            type: 'String',
        },
    ],
};

// Command Escalation Template for F+
export const getBirthPayload = (): UPayload => {
    return Command_Escalation_Birth_Payload;
};
