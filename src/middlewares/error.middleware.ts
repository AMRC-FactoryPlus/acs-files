/*
 * Factory+ / AMRC Connectivity Stack (ACS) Files component
 * Copyright 2023 AMRC
 */

import {NextFunction, Request, Response} from 'express';
import {HttpException} from '@exceptions/HttpException.js';
import {newLogger} from '@utils/logger.js';

const logger = newLogger('errorMiddleware');

const errorMiddleware = (error: HttpException, req: Request, res: Response, next: NextFunction) => {
    try {
        const status: number = error.status || 500;
        const message: string = error.message || 'Something went wrong';

        logger.error(`[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}`);
        res.status(status).json({message});
    } catch (error) {
        next(error);
    }
};

export default errorMiddleware;
