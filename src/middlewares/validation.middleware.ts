/*
 * Factory+ / AMRC Connectivity Stack (ACS) Files component
 * Copyright 2023 AMRC
 */

import {plainToClass} from 'class-transformer';
import {validate, ValidationError} from 'class-validator';
import {RequestHandler} from 'express';
import {HttpException} from '@exceptions/HttpException.js';

const getAllNestedErrors = (error: ValidationError) => {
    if (error.constraints) {
        return Object.values(error.constraints);
    }
    return error.children.map(getAllNestedErrors).join(',');
};

export const validationMiddleware = (
    type: any,
    value: string | 'body' | 'query' | 'params' = 'body',
    skipMissingProperties = false,
    whitelist = true,
    forbidNonWhitelisted = true,
): RequestHandler => {
    return (req, res, next) => {
        const obj = plainToClass(type, req[value]);
        validate(obj, {skipMissingProperties, whitelist, forbidNonWhitelisted}).then((errors: ValidationError[]) => {
            if (errors.length > 0) {
                const message = errors.map(getAllNestedErrors).join(', ');
                next(new HttpException(400, message));
            } else {
                next();
            }
        });
    };
};
