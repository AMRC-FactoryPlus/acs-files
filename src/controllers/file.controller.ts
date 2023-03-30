/*
 * Factory+ / AMRC Connectivity Stack (ACS) Files component
 * Copyright 2023 AMRC
 */

import {FileEntry} from '@/interfaces/file_entry_service.interface.js';
import ConfigService from '@/services/config.service.js';
import {Response} from 'express';
import {Controller, Get, Param, Res} from 'routing-controllers';

@Controller('/api')
export class FileController {
    private configService = new ConfigService();

    @Get('/device/:instance_uuid')
    async findAssetFiles(@Param('instance_uuid') instance_uuid: string, @Res() res: Response) {
        try {
            const deviceFiles: FileEntry[] = await this.configService.getAllFileEntries(instance_uuid);

            return res.status(200).json(deviceFiles);
        } catch (err) {
            res.status(500);
            return res.send(err.message);
        }
    }

    @Get('/file/:file_uuid')
    async getFileInfo(@Param('file_uuid') file_uuid: string, @Res() res: Response) {
        try {
            const file_entry = await this.configService.getFileEntry(file_uuid);

            return res.status(200).json(file_entry);
        } catch (err) {
            res.status(500);
            return res.send(err.message);
        }
    }
}
