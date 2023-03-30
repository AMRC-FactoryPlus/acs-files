/*
 * Factory+ / AMRC Connectivity Stack (ACS) Files component
 * Copyright 2023 AMRC
 */

import {Controller, Get} from 'routing-controllers';
import {Device_Info, FILE_SERVICE_UUID} from '@utils/constants.js';
import {DEVICE_UUID} from '@/config/index.js';

@Controller()
export class IndexController {
    @Get('/')
    index() {
        return 'OK';
    }

    @Get('/ping')
    ping() {
        return {
            service: FILE_SERVICE_UUID,
            device: DEVICE_UUID,
            version: Device_Info.Serial,
        };
    }
}
