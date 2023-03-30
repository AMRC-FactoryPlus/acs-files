/*
 * Factory+ / AMRC Connectivity Stack (ACS) Files component
 * Copyright 2023 AMRC
 */

import {FileTypeError} from '@/exceptions/FileExceptions.js';
import {checkObjectExist, presignedDownloadUrl, putObject} from '@/utils/storage.js';
import {BucketItemStat, UploadedObjectInfo} from 'minio';
import ConfigService from './config.service.js';
import {FileEntry, FileType} from '@/interfaces/file_entry_service.interface.js';
import DirectoryService from '@services/directory.service.js';
import {isEmpty} from '@utils/util.js';
import {fsMqttClient} from '@/server.js';
import {newLogger} from '@utils/logger.js';
import {ConnectionError} from '@exceptions/MqttException.js';

const logger = newLogger('storage.service');

class StorageService {
    private configService = new ConfigService();

    /**
     *  Verifies requirements and file type, uploads a file to Minio and creates a
     * @param multerFile Multer file stream
     * @param file_entry_config File Entry Config with metadata
     * @returns Generated Minio File_UUID and Minio metadata
     */
    public async uploadFile(multerFile: Express.Multer.File, file_entry_config: FileEntry): Promise<[FileEntry, UploadedObjectInfo]> {
        const deviceConfig = await DirectoryService.getSparkplugDeviceProperties(file_entry_config.device.instance_uuid);

        if (isEmpty(deviceConfig.top_schema)) {
            logger.error('No top_schema for device: ' + deviceConfig.device_id);
            throw new FileTypeError('No top_schema for device: ' + deviceConfig.device_id);
        }

        const schemaConfig = await this.configService.getSchemaMap(deviceConfig.top_schema);

        if (schemaConfig == null) {
            logger.error('No SchemaFileType config entry for schema: ' + deviceConfig.top_schema);
            throw new FileTypeError('No SchemaFileType config entry for schema: ' + deviceConfig.top_schema);
        }

        const file_type: FileType = this.verifyFileType(multerFile, file_entry_config.file_type.key, schemaConfig);

        if (file_type == null) throw new FileTypeError('File type not accepted.');

        file_entry_config.file_type = file_type;

        // then upload file
        const [file_uuid, uploadedObject] = await putObject(multerFile, file_entry_config.device.instance_uuid, file_entry_config.tags);

        file_entry_config.file_uuid = file_uuid;

        await this.configService.createFileEntry(file_uuid, file_entry_config);

        // Publish MQTT message to F+ broker
        try {
            fsMqttClient.publishFileEntryMessage(file_entry_config);
        } catch (err) {
            if (err instanceof ConnectionError) {
                logger.warn('MQTT client problem. Not publishing FileEntry message');
            }
        }

        return [file_entry_config, uploadedObject];
    }

    public async downloadFile(file_uuid: string, instance_uuid: string, metadata?: any): Promise<[BucketItemStat, string]> {
        // check if item exist
        const [bucketItemStat, err] = await checkObjectExist(instance_uuid, file_uuid);
        if (err) {
            return [null, null]; // if bucket or file doesn't exist, resolve nothing
        } else {
            // then get download url for file
            const downloadUrl = await presignedDownloadUrl(instance_uuid, file_uuid, bucketItemStat.metaData.originalname);
            return [bucketItemStat, downloadUrl];
        }
    }

    /**
     *
     * @param multerFile multerFile uploaded by user
     * @param key FileType key used to identify matching config
     * @param schemaConfig FileSchemaConfig from ConfigDB for specified deviceSchema
     * @returns Matching FileType to supplied file and key, returns null if no match
     * @private
     */
    private verifyFileType(multerFile: Express.Multer.File, key: string, schemaConfig: FileType[]): FileType | null {
        let ft: FileType = null;

        // loop through schema config to find a filetype that matches the key
        schemaConfig.forEach(scFileType => {
            if (scFileType.key === key) ft = scFileType;
        });

        // If no filetypes from schema matches the user req filetype key, return null
        if (ft == null) return null;

        // If the filetype supports custom extensions, bypass mimetype check and check file extension
        if (ft.mime_type.custom != null) {
            const fileExtension = multerFile.originalname.split('.')[1].toLowerCase();
            // Loop through the custom file extensions to find a match
            for (const extension of ft.mime_type.custom.extensions) {
                if (fileExtension == extension) return ft;
            }
        } // Check if mimetype of file matches config ft
        else if (ft.mime_type.mime == multerFile.mimetype) {
            return ft;
        }

        logger.warn(`multerFile.mimetype: ${multerFile.mimetype} does not match ft: ${ft} for ft_key: ${key}`);
        // return null when no FileType found to match
        return null;
    }
}

export default StorageService;
