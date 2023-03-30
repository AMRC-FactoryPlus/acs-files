/*
 * Factory+ / AMRC Connectivity Stack (ACS) Files component
 * Copyright 2023 AMRC
 */

import {cleanEnv, port, str} from 'envalid';

const validateEnv = () => {
    cleanEnv(process.env, {
        NODE_ENV: str(),
        PORT: port(),
    });
};

export default validateEnv;
