/*
 * Factory+ / AMRC Connectivity Stack (ACS) Files component
 * Copyright 2023 AMRC
 */

import 'reflect-metadata';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import {useExpressServer} from 'routing-controllers';
import swaggerUi from 'swagger-ui-express';
import {CREDENTIALS, KB_HOSTNAME, KB_REALM, LOG_FORMAT, NODE_ENV, ORIGIN, PORT, SERVER_KEYTAB} from '@config/index.js';
import errorMiddleware from '@middlewares/error.middleware.js';
import {newLogger, stream} from '@utils/logger.js';
import {FplusHttpAuth, resolve} from '@amrc-factoryplus/utilities';
import * as yaml from 'js-yaml';
import * as fs from 'fs';

const logger = newLogger('app');

class App {
    public app: express.Application;
    public env: string;
    public port: string | number;

    constructor(Controllers: Function[]) {
        this.app = express();
        this.env = NODE_ENV || 'development';
        this.port = PORT || 3000;

        // Initialises F+ auth api;
        this.initializeAuthentication();

        // Boilerplate generated
        this.initializeMiddlewares();
        this.initializeRoutes(Controllers);
        this.initializeSwagger();
        this.initializeErrorHandling();
    }

    public listen(): void {
        this.app.listen(this.port, () => {
            logger.info(`=================================`);
            logger.info(`======= ENV: ${this.env} =======`);
            logger.info(`🚀 App listening on the port ${this.port}`);
            logger.info(`=================================`);
        });
    }

    public getServer() {
        return this.app;
    }

    private initializeAuthentication() {
        const auth = new FplusHttpAuth({
            realm: KB_REALM,
            hostname: KB_HOSTNAME,
            keytab: SERVER_KEYTAB,
        });

        auth.setup(this.app);
    }

    private initializeMiddlewares() {
        this.app.use(morgan(LOG_FORMAT, {stream}));
        this.app.use(hpp());
        this.app.use(helmet());
        this.app.use(compression());
        this.app.use(express.json());
        this.app.use(express.urlencoded({extended: true}));
        this.app.use(cookieParser());
    }

    private initializeRoutes(controllers: Function[]) {
        useExpressServer(this.app, {
            cors: {
                origin: ORIGIN,
                credentials: CREDENTIALS,
            },
            controllers: controllers,
            defaultErrorHandler: false,
        });
    }

    private initializeSwagger() {
        const filePath = resolve(import.meta, '../schemas/openapi.yml');
        const swaggerDocument = yaml.load(fs.readFileSync(filePath, 'utf8'));

        this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    }

    private initializeErrorHandling() {
        this.app.use(errorMiddleware);
    }
}

export default App;
