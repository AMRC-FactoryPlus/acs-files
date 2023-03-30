/*
 * Factory+ / AMRC Connectivity Stack (ACS) Files component
 * Copyright 2023 AMRC
 */

import App from '@/app.js';
import validateEnv from '@utils/validateEnv.js';
import {IndexController} from '@controllers/index.controller.js';
import {StorageController} from '@/controllers/storage.controller.js';
import {ConfigController} from '@/controllers/config.controller.js';
import {FileController} from '@controllers/file.controller.js';
import {
    DEVICE_UUID,
    DIRECTORY_ENDPOINT,
    HTTP_API_URL,
    MINIO_ACCESS_KEY,
    MINIO_ENDPOINT,
    MINIO_PORT,
    MINIO_SECRET_KEY,
    MINIO_SSL,
    SPARKPLUG_GROUP,
    SPARKPLUG_NODE,
} from '@config/index.js';
import FileServiceMQTT from '@utils/factoryplus_mqtt.js';
import {newLogger} from '@utils/logger.js';
import {ServiceClient} from '@amrc-factoryplus/utilities';
import * as minio from 'minio';
import {Device_Info} from '@utils/constants.js';

const logger = newLogger('server');

validateEnv();

logger.info(`${Device_Info.Model}, version: ${Device_Info.Serial}`);

const fplusClient = await new ServiceClient({directory_url: DIRECTORY_ENDPOINT}).init();

logger.info('Waiting for MQTT to connect....\n');

const fsMqttClient = new FileServiceMQTT({
    fplus: fplusClient,
    device_uuid: DEVICE_UUID,
    url: HTTP_API_URL,
    sparkplug_address: `${SPARKPLUG_GROUP}/${SPARKPLUG_NODE}`,
}).init();

const minioClient = new minio.Client({
    endPoint: MINIO_ENDPOINT,
    port: parseInt(MINIO_PORT),
    useSSL: MINIO_SSL != undefined && MINIO_SSL == '1',
    accessKey: MINIO_ACCESS_KEY,
    secretKey: MINIO_SECRET_KEY,
});

const app = new App([IndexController, StorageController, FileController, ConfigController]);
app.listen();

export {fsMqttClient, fplusClient, minioClient};
