/*
 * Factory+ / AMRC Connectivity Stack (ACS) Files component
 * Copyright 2023 AMRC
 */

import winston, {Logger} from 'winston';

// Define log format

/*
 * Log Level
 * error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6
 */

export const newLogger = (service: string): Logger => {
    const logFormat = winston.format.printf(({
                                                 timestamp,
                                                 level,
                                                 message
                                             }) => `${timestamp} [${service}/${level}]: ${message}`);

    return winston.createLogger({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss',
            }),
            logFormat,
        ),
        transports: [
            new winston.transports.Console({
                format: winston.format.combine(winston.format.splat(), winston.format.colorize()),
            }),
        ],
    });
};

const streamLogger = newLogger('default');
const defaultLogger = newLogger('default');

const stream = {
    write: (message: string) => {
        streamLogger.info(message.substring(0, message.lastIndexOf('\n')));
    },
};

export {defaultLogger, stream};
