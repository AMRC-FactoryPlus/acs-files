/*
 * Factory+ / AMRC Connectivity Stack (ACS) Files component
 * Copyright 2023 AMRC
 */

export class CustomException extends Error {
    public message: string;
    public error: Error;

    constructor(message: string) {
        super(message);
        this.message = message;
    }
}
