/*
 * Factory+ / AMRC Connectivity Stack (ACS) Files component
 * Copyright 2023 AMRC
 */

import {IsUUID} from 'class-validator';

export class DownloadDto {
    @IsUUID()
    public instance_uuid: string;

    public apiKey: string;

    @IsUUID()
    public file_uuid: string;
}
