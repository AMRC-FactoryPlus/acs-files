/*
 * Factory+ / AMRC Connectivity Stack (ACS) Files component
 * Copyright 2023 AMRC
 */

export interface DevicePropertiesInterface {
    uuid: string;
    group_id: string;
    node_id: string;
    device_id: string;
    online: boolean;
    last_change: Date;
    top_schema: string;
    schemas: string[];
}
