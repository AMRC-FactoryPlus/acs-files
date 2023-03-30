/*
 * Factory+ / AMRC Connectivity Stack (ACS) Files component
 * Copyright 2023 AMRC
 */

import {UPayload} from 'sparkplug-payload';
import {FileEntry} from '@interfaces/file_entry_service.interface.js';

const File_Entry_Birth_Payload: UPayload = {
    metrics: [
        {
            name: 'Device/Instance_UUID',
            type: 'UUID',
            value: null,
        },
        {
            name: 'File_UUID',
            type: 'UUID',
            value: null,
        },
        {
            name: 'Filename',
            type: 'String',
            value: null,
        },
        {
            name: 'Friendly_Title',
            type: 'String',
            value: null,
        },
        {
            name: 'Friendly_Description',
            type: 'String',
            value: null,
        },
        {
            name: 'Uploader',
            type: 'String',
            value: null,
        },
        {
            name: 'File_Type/Key',
            type: 'String',
            value: null,
        },
        {
            name: 'File_Type/Title',
            type: 'String',
            value: null,
        },
        {
            name: 'File_Type/Mime_Type/Mime',
            type: 'String',
            value: null,
        },
        {
            name: 'File_Type/Mime_Type/Custom',
            type: 'Boolean',
            value: null,
        },
    ],
};

/**
 * getBirthPayload
 */
export function getBirthPayload(): UPayload {
    return File_Entry_Birth_Payload;
}

export function newDataPayload(newFileEntry: FileEntry): UPayload {
    return {
        metrics: [
            {
                name: 'Device/Instance_UUID',
                type: 'UUID',
                value: newFileEntry.device.instance_uuid,
            },
            {
                name: 'File_UUID',
                type: 'UUID',
                value: newFileEntry.file_uuid,
            },
            {
                name: 'Filename',
                type: 'String',
                value: newFileEntry.filename,
            },
            {
                name: 'Friendly_Title',
                type: 'String',
                value: newFileEntry.friendly_title,
            },
            {
                name: 'Friendly_Description',
                type: 'String',
                value: newFileEntry.friendly_description,
            },
            {
                name: 'Uploader',
                type: 'String',
                value: newFileEntry.uploader,
            },
            {
                name: 'File_Type/Key',
                type: 'String',
                value: newFileEntry.file_type.key,
            },
            {
                name: 'File_Type/Title',
                type: 'String',
                value: newFileEntry.file_type.title,
            },
            {
                name: 'File_Type/Mime_Type/Mime',
                type: 'String',
                value: newFileEntry.file_type.mime_type.mime,
            },
            {
                name: 'File_Type/Mime_Type/Custom',
                type: 'Boolean',
                value: newFileEntry.file_type.mime_type.custom != null,
            },
        ],
    };
}
