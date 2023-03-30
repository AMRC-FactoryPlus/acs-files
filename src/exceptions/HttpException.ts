/*
 * Factory+ / AMRC Connectivity Stack (ACS) Files component
 * Copyright 2023 AMRC
 */

import {HttpError} from 'routing-controllers';

export class HttpException extends HttpError {
    public status: number;
    public message: string;

    constructor(status: number, message: string) {
        super(status, message);
        this.status = status;
        this.message = message;
    }
}

export const BadRequest = new HttpException(500, 'Bad Request');

export const NoContentFound = new HttpException(404, 'Content Not Found');

export const SchemaValidationError = new HttpException(403, 'Schema validation failed');
