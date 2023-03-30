/*
 * Factory+ / AMRC Connectivity Stack (ACS) Files component
 * Copyright 2023 AMRC
 */

import {pkgVersion} from '@amrc-factoryplus/utilities';

export const FILE_CLASS_DEFINITION_UUID = 'f42291d3-fbf3-4c91-b00b-00dbcbbfbada';

// Core service function uuid
export const FILE_SERVICE_UUID = '7213f5a3-0bb1-4151-ad83-d27dcb368980';
export const FILE_SCHEMA_MAP_SCHEMA_UUID = 'f1b2cdbd-a770-4559-b3f8-50d7da06b31c';
export const FILE_SCHEMA_MAP_APP_UUID = '253e14b5-9bd1-4c82-8d17-41e4568c4cd3';
export const FILE_ENTRY_APP_UUID = '751f5524-3e67-4d0e-ac72-65172bae1cee';

export const FILE_SERVICE_DEVICE_INFO_INSTANCE_UUID = 'bb47ed01-5751-4192-8708-5959ce45e684';

export const Version = pkgVersion(import.meta);

export const Device_Info = {
    Manufacturer: 'AMRC',
    Model: "AMRC Connectivity Stack (ACS) Files Service",
    Serial: Version,
};
