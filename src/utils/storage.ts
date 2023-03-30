/*
 * Factory+ / AMRC Connectivity Stack (ACS) Files component
 * Copyright 2023 AMRC
 */

import * as minio from 'minio';
import {BucketItemStat, UploadedObjectInfo} from 'minio';
import {MINIO_BUCKET, MINIO_REGION} from '@/config/index.js';
import {MinioError} from '@/exceptions/MinioExceptions.js';
import {randomUUID} from 'crypto';
import {newLogger} from './logger.js';
import {minioClient} from '@/server.js';

const logger = newLogger('util.minio_storage');

type File = Express.Multer.File;

const PRESIGNED_URL_EXPIRY_TIME = 5 * 60; //Set to 5 minutes (in seconds)

enum S3Error {
    NoSuchBucket = 'NoSuchBucket',
    NotFound = 'NotFound',
}

export const putObject = async (file: File, folder: string, user_metadata?: any, filename?: string): Promise<[string, UploadedObjectInfo]> => {
    return new Promise((res, rej) => {
        if (!filename) filename = randomUUID();

        const filePath = folder + '/' + filename; // Adds the folder path to the filename as a prefix

        const metadata = Object.assign({}, user_metadata); // makes parameter object immutable

        metadata.originalname = file.originalname; // add the filename to the metadata

        minioClient.putObject(MINIO_BUCKET, filePath, file.buffer, null, metadata, function (err, objInfo) {
            if (err) {
                logger.error('Something bad happened with Minio:', err);
                rej(new MinioError('Something bad happened with Minio', err));
            }

            res([filename, objInfo]);
        });
    });
};

export const presignedDownloadUrl = async (folder: string, file_uuid: string, originalFilename: string): Promise<string> => {
    return new Promise((res, rej) => {
        const respHeaders = {
            'response-content-disposition': `attachment; filename=${originalFilename}`,
        };

        const filePath = folder + '/' + file_uuid; // Adds the folder path to the filename as a prefix
        minioClient.presignedGetObject(MINIO_BUCKET, filePath, PRESIGNED_URL_EXPIRY_TIME, respHeaders, function (err, presignedUrl) {
            if (err) return rej(err);
            res(presignedUrl);
        });
    });
};

export const checkBucketExist = async (bucket: string): Promise<boolean> => {
    return new Promise(async (res, rej) => {
        logger.info('checking if bucket: ' + bucket + ' exists!!!!!!!');
        minioClient.bucketExists(bucket, function (err, exists) {
            if (err) {
                logger.error(err);
                rej(new MinioError('Something bad happened with Minio', err));
            } else {
                res(exists);
            }
        });
    });
};

export const checkObjectExist = async (folder: string, filename: string): Promise<[BucketItemStat, S3Error?]> => {
    return new Promise(async (res, rej) => {
        logger.info('checking if object: ' + filename + ' exists');
        try {
            const filePath = folder + '/' + filename; // Adds the folder path to the filename as a prefix
            const bucketItemStat = await minioClient.statObject(MINIO_BUCKET, filePath);
            res([bucketItemStat]);
        } catch (err) {
            if (err.code == S3Error.NoSuchBucket || err.code == S3Error.NotFound) {
                logger.warn(err);
                res([null, err.code]);
            } else {
                logger.error(err);
                rej(err);
            }
        }
    });
};

export const createBucket = async (bucket: string, region?: string, makeOpts?: any): Promise<void> => {
    return new Promise((res, rej) => {
        // overload missing the makeopts parameter?
        region = region ? region : MINIO_REGION;
        logger.info('Creating bucket:' + bucket + ' at region: ' + region);

        minioClient.makeBucket(bucket, region, async function (err) {
            if (err) {
                rej(new MinioError('Something bad happened with Minio', err));
            } else {
                logger.info('Created bucket');

                try {
                    // Tries to setup webhook notification for this new bucket
                    await setupBucketWebhook(bucket);
                    res();
                } catch (err) {
                    rej(err);
                }
            }
        });
    });
};

/**
 * Sets up webhook notification for object PUTS and POSTS for specified bucket
 * @param bucket
 * @returns
 */
const setupBucketWebhook = async (bucket: string): Promise<void> => {
    return new Promise((res, rej) => {
        const config = new minio.NotificationConfig();
        const arn = minio.buildARN('minio', 'sqs', MINIO_REGION, '_', 'webhook');
        const queue = new minio.QueueConfig(arn);
        queue.addEvent(minio.ObjectCreatedAll);
        config.add(queue);

        minioClient.setBucketNotification(bucket, config, function (err) {
            if (err) {
                logger.error(err);
                rej(new MinioError('Something bad happened with Minio', err));
            } else {
                logger.info('Successfully set webhook notification for bucket');
                res();
            }
        });
    });
};

function extname(name: string): string {
    return name.substring(name.lastIndexOf('.'), name.length);
}
