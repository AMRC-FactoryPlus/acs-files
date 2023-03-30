/*
 * Factory+ / AMRC Connectivity Stack (ACS) Files component
 * Copyright 2023 AMRC
 */

import {IsUUID} from 'class-validator';

export class UploadDto {
    @IsUUID()
    public instance_uuid: string;

    public file_type_key: string;

    public friendly_title: string;

    public friendly_description: string;

    public uploader: string;

    public tags: any;
}
