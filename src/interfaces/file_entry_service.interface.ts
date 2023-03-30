/*
 * Factory+ / AMRC Connectivity Stack (ACS) Files component
 * Copyright 2023 AMRC
 */

/**
 * JSON Schema describing a file that has been uploaded to the File Service Minio and its properties
 */
export interface FileEntry {
    device: Device;
    /**
     * Original friendly name of the file uploaded
     */
    filename: string;
    /**
     * UUID of the file stored in MinIO
     */
    file_uuid: string;
    /**
     * The user defined friendly title to describe the file, i.e. KR360 Robot Datasheet
     */
    friendly_title: string;
    /**
     * User defined description when uploading file, i.e. Datasheet for XYZ. Can be empty
     */
    friendly_description: string;
    /**
     * Name of user/service who uploaded file, e.g. me1xx or file_ingester_1
     */
    uploader: string;
    /**
     * Timestamp of when the file was uploaded to the File Service, ISO8601 format, i.e. 2018-11-13T20:20:39+00:00
     */
    timestamp: Date;
    /**
     * Custom tags for the user to define and use. Can be null if no tags
     */
    tags: {
        [k: string]: unknown;
    } | null;
    file_type: FileType;

    [k: string]: unknown;
}

export interface Device {
    instance_uuid: string;

    [k: string]: unknown;
}

export interface FileType {
    /**
     * The friendly name to distinguish the file type, i.e. Technical Datasheet
     */
    title: string;
    /**
     * The unique name identifier to distinguish the file type, format snake_case, i.e. technical_Datasheet
     */
    key: string;
    mime_type: MimeType;

    [k: string]: unknown;
}

/**
 * The allowed MIME type for the file.
 */
export interface MimeType {
    /**
     * The MIME group and MIME subtype, i.e. image/png
     */
    mime: string;
    /**
     * To describe custom MIME types and custom properties.
     */
    custom?: {
        extensions: string[];
        [k: string]: unknown;
    };

    [k: string]: unknown;
}
