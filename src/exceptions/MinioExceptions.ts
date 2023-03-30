/*
 * Factory+ / AMRC Connectivity Stack (ACS) Files component
 * Copyright 2023 AMRC
 */

export class MinioError extends Error {
    public message: string;
    public error: Error;

    constructor(message: string, error?: Error) {
        super(message);
        this.message = message;
        this.error = error;
    }
}
