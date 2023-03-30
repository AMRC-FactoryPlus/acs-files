/*
 * Factory+ / AMRC Connectivity Stack (ACS) Files component
 * Copyright 2023 AMRC
 */

import ConfigService from '@/services/config.service.js';
import {isUUID} from 'class-validator';
import {Response} from 'express';
import {Controller, Get, Param, Res} from 'routing-controllers';
import {BadRequest} from '@/exceptions/HttpException.js';

@Controller('/api')
export class ConfigController {
    private configService = new ConfigService();

    @Get('/config/:schema_uuid')
    async assetConfig(@Param('schema_uuid') schema_uuid: string, @Res() res: Response) {
        if (!isUUID(schema_uuid)) {
            throw BadRequest;
        }
        try {
            const schemaConfig = await this.configService.getSchemaMap(schema_uuid);
            if (!schemaConfig) {
                return res.send([]);
            } else {
                return res.send(schemaConfig);
            }
        } catch (error) {
            throw error;
        }
    }
}
