/*
 * Factory+ / AMRC Connectivity Stack (ACS) Files component
 * Copyright 2023 AMRC
 */

import {UploadDto} from '@/dtos/upload.dto.js';
import {Response} from 'express';
import {Body, Controller, Post, Res, UploadedFile} from 'routing-controllers';
import StorageService from '@/services/storage.service.js';
import {MinioError} from '@/exceptions/MinioExceptions.js';
import {newLogger} from '@/utils/logger.js';
import {DownloadDto} from '@/dtos/download.dto.js';
import {isEmpty} from '@/utils/util.js';
import {FileEntry} from '@/interfaces/file_entry_service.interface.js';
import {FileHandlingError, FileTypeError} from '@/exceptions/FileExceptions.js';
import {ConfigDBError} from '@exceptions/FileExceptions.js';

const logger = newLogger('routes.storage');

@Controller('/api')
export class StorageController {
    private storageService = new StorageService();

    @Post('/upload')
    async upload(@UploadedFile('file') multerFile: Express.Multer.File, @Body() uploadBody: UploadDto, @Res() res: Response) {
        //TODO: implement auth check if bearer token can access specified device files
        try {
            if (multerFile === undefined) throw new FileHandlingError('Missing multer file.');

            // Parses JSON metadata into an object
            let tags: any = null;
            if (uploadBody.tags != null) {
                tags = JSON.parse(uploadBody.tags);
            }

            const fileEntryConfig: FileEntry = {
                device: {
                    instance_uuid: uploadBody.instance_uuid,
                },
                filename: multerFile.originalname,
                friendly_title: uploadBody.friendly_title,
                friendly_description: uploadBody.friendly_description,
                file_uuid: null,
                uploader: uploadBody.uploader,
                timestamp: new Date(),
                tags: tags,
                file_type: {
                    title: null,
                    key: uploadBody.file_type_key,
                    mime_type: null,
                },
            };

            const [updatedFileEntryConfig, objectInfo] = await this.storageService.uploadFile(multerFile, fileEntryConfig);

            logger.info('Uploaded file:' + updatedFileEntryConfig.file_uuid);
            res.statusCode = 200;
            return res.send('OK');
        } catch (err) {
            logger.error(err.message);
            let statusCode: number;
            const errorObj = {
                message: err.message,
            };

            if (err instanceof MinioError || err instanceof ConfigDBError) {
                statusCode = 500;
            } else if (err instanceof FileTypeError) {
                statusCode = 415;
            } else {
                statusCode = 400;
            }
            res.status(statusCode);
            return res.json(errorObj);
        }
    }

    @Post('/download')
    async download(@Body() body: DownloadDto, @Res() res: Response) {
        //TODO: implement auth check if bearer token can access specified device files

        try {
            const [bucketItemStat, presignedDownloadUrl] = await this.storageService.downloadFile(body.file_uuid, body.instance_uuid);

            if (isEmpty(presignedDownloadUrl)) {
                logger.info("Bucket or file doesn't exist.");
                res.statusCode = 422;
                return res.send("Bucket or file doesn't exist.");
            } else {
                logger.info('DownloadURL generated');

                let responseObject: any = {};
                responseObject = bucketItemStat;
                responseObject.url = presignedDownloadUrl;

                res.statusCode = 200;
                return res.send(responseObject);
            }
        } catch (err) {
            logger.error(err);
            if (err instanceof MinioError) {
                res.status(500);
                return res.send(err.message);
            } else {
                res.status(400);
                return res.send('Bad Request');
            }
        }
    }

    @Post('/minio/webhook')
    async webhook(@Body() body: any, @Res() res: Response) {
        console.log(body);
    }
}
