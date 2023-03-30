/*
 * Factory+ / AMRC Connectivity Stack (ACS) Files component
 * Copyright 2023 AMRC
 */

import {FILE_ENTRY_APP_UUID, FILE_SCHEMA_MAP_APP_UUID} from '@/utils/constants.js';
import {FileEntry, FileType} from '@/interfaces/file_entry_service.interface.js';
import {newLogger} from '@utils/logger.js';
import {UUIDs} from '@amrc-factoryplus/utilities';
import {fplusClient} from '@/server.js';
import {Response} from 'node-fetch';
import {ConfigDBError} from '@exceptions/FileExceptions.js';
import {FILE_CLASS_DEFINITION_UUID} from '@utils/constants.js';

const logger = newLogger('config.service');

class ConfigService {
    private OBJECT_ENDPOINT = `/v1/object/`;

    /**
     * Gets File Schema Map Config from ConfigDB
     * @param schema_uuid
     */
    public async getSchemaMap(schema_uuid: string): Promise<FileType[] | null> {
        try {
            const response = await this.getObject(FILE_SCHEMA_MAP_APP_UUID, schema_uuid);

            if (!response) {
                logger.warn('No Schema Map config for this device:' + schema_uuid);
                return null;
            } else {
                return response;
            }
        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    private OBJECT_CONFIG_ENDPOINT = `/v1/app/${FILE_ENTRY_APP_UUID}/object/`;

    /**
     *
     * Create a config under File Entry Application
     * @param file_uuid
     * @param file_entry
     */
    public async createFileEntry(file_uuid: string, file_entry: FileEntry): Promise<void> {
        // Create a new object under "File" class definition in ConfigDB
        let response = await this.createObject(FILE_CLASS_DEFINITION_UUID, file_uuid);

        if (response.status == 201) {
            // Then create a new object config under "File"
            const url = this.OBJECT_CONFIG_ENDPOINT + file_uuid;
            response = await this.fetchObject(url, 'PUT', file_entry);

            if (response.status == 204) {
                logger.info('Created File Entry in ConfigDB application.');
                return;
            } else if (response.status == 403) {
                logger.error(`File entry does not validate against schema. Entry: ${JSON.stringify(file_entry)}`);
                throw new ConfigDBError(`File entry does not validate against schema. Entry: ${JSON.stringify(file_entry)}`);
            } else {
                logger.error(`Unknown ConfigDB response ${response.status}: ${response.statusText}`);
                throw new ConfigDBError(`Unknown ConfigDB response ${response.status}: ${response.statusText}`);
            }
        } else if (response.status == 409) {
            logger.error(
                `The object already exists with a different class. Could not create class for uuid: ${file_uuid} and class: ${FILE_CLASS_DEFINITION_UUID}`,
            );
            throw new ConfigDBError(
                `The object already exists with a different class. Could not create class for uuid: ${file_uuid} and class: ${FILE_CLASS_DEFINITION_UUID}`,
            );
        } else {
            logger.error(`Unknown ConfigDB response ${response.status}: ${response.statusText}`);
            throw new ConfigDBError(`Unknown ConfigDB response ${response.status}: ${response.statusText}`);
        }
    }

    /**
     * Get the File Entry config in the ConfigDB Application
     * @param file_uuid
     */
    public async getFileEntry(file_uuid: string): Promise<any> {
        return await this.getObject(FILE_ENTRY_APP_UUID, file_uuid);
    }

    /**
     * Get the list of File Entries for the Device Instance_UUID in the ConfigDB Application
     * @param instance_uuid
     */
    public async getAllFileEntries(instance_uuid: string): Promise<any> {
        const url = `/v1/app/${FILE_ENTRY_APP_UUID}/search?${'device.instance_uuid'}=\"${instance_uuid}\"`;

        const response = await this.fetchObject(url, 'GET');
        if (response.status == 404) {
            logger.error(`ConfigDB ${response.status}: could not find a Device/Instance_UUID: ${instance_uuid}`);
            throw new ConfigDBError(`ConfigDB ${response.status}: could not find a Device/Instance_UUID: ${instance_uuid}`);
        } else if (response.status != 200) {
            logger.error(`Unknown ConfigDB response ${response.status}: ${response.statusText}`);
            throw new ConfigDBError(`Unknown ConfigDB response ${response.status}: ${response.statusText}`);
        }

        // Iterates over each file_uuid and retrieves the data for each.
        const file_entry_uuids = await response.json();
        const file_entries = [];
        for (const file_uuid of file_entry_uuids) {
            const file_data = await this.getFileEntry(file_uuid);
            file_entries.push(file_data);
        }

        logger.info(`Device/Instance_UUID: ${instance_uuid}, got list of file entries: ${file_entries}`);
        return file_entries;
    }

    /**
     *
     * Helper method for creating an object in the ConfigDB
     * @param class_uuid
     * @param object_uuid
     * @private
     */
    private async createObject(class_uuid: string, object_uuid: string): Promise<Response> {
        try {
            const data = {
                class: class_uuid,
                uuid: object_uuid,
            };
            return await this.fetchObject(this.OBJECT_ENDPOINT, 'POST', data);
        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    /**
     *
     * Helper method for getting an object in the ConfigDB from an application
     * @param app_uuid
     * @param object_uuid
     * @private
     */
    private async getObject(app_uuid: string, object_uuid: string): Promise<any> {
        try {
            const url = `/v1/app/${app_uuid}/object/${object_uuid}`;
            logger.info(url);

            return await fplusClient.fetch_configdb(app_uuid, object_uuid);
        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    /**
     *
     * Helper method for fetching an object in the ConfigDB from an application
     * @param url Relative url, .e.g /v1/object
     * @param method The request method, e.g. GET, POST
     * @param data Data to add to body
     * @private
     */
    private async fetchObject(url: string, method = 'GET', data?: any): Promise<any> {
        const request = {
            headers: {'Content-Type': 'application/json'},
            service: UUIDs.Service.Registry,
            url: url,
            method: method,
            body: JSON.stringify(data),
        };
        logger.info(`Fetching object from ConfigDB with request: ${JSON.stringify(request)}`);
        return await fplusClient.fetch(request);
    }
}

export default ConfigService;
