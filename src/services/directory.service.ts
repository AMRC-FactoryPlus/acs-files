/*
 * Factory+ / AMRC Connectivity Stack (ACS) Files component
 * Copyright 2023 AMRC
 */

import {DevicePropertiesInterface} from '@interfaces/directory.interface.js';
import {fplusClient} from '@/server.js';
import {UUIDs} from '@amrc-factoryplus/utilities';
import {newLogger} from '@utils/logger.js';

const logger = newLogger('directory.service');

class DirectoryService {
    private static DEVICE_UUID_ENDPOINT = `/v1/device/`;

    /**
     * Finds the properties of the Sparkplug device from the Directory Service
     * @param device_uuid UUID of device
     * @returns Sparkplug Device Properties
     */
    public static async getSparkplugDeviceProperties(device_uuid: string): Promise<DevicePropertiesInterface> {
        try {
            const url = this.DEVICE_UUID_ENDPOINT + device_uuid;

            const response = await fplusClient.fetch({
                service: UUIDs.Service.Directory,
                url: url,
                method: 'GET',
            });

            if (response.status == 404) {
                logger.error('No config for this device:' + device_uuid);
                return null;
            }

            return await response.json();
        } catch (error) {
            // Triggers if it's not a 404 error
            logger.error(error);
            throw error;
        }
    }
}

export default DirectoryService;
