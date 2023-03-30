/*
 * Factory+ / AMRC Connectivity Stack (ACS) Files component
 * Copyright 2023 AMRC
 */

import {FileEntry} from '@/interfaces/file_entry_service.interface.js';
import {newLogger} from './logger.js';
import * as FileEntryPayload from '@utils/factoryplus_payloads/FileEntryPayload.js';
import {Address, MetricBuilder, ServiceClient, SpB, Topic, UUIDs} from '@amrc-factoryplus/utilities';
import {Device_Info, FILE_SERVICE_DEVICE_INFO_INSTANCE_UUID, FILE_SERVICE_UUID} from './constants.js';
import {ConnectionError} from '@exceptions/MqttException.js';
import {QoS} from 'mqtt-packet';

/**
 * Class to handle Sparkplug B F+ MQTT Client
 *
 */

const logger = newLogger('util.fplus_mqtt');

export default class FileServiceMQTT {
    private fplus: ServiceClient;
    private readonly device_uuid: string;

    private readonly url: string;
    private readonly silent: boolean;
    private readonly address: Address;
    private seq: number;
    private mqtt: any;
    private isConnected: boolean;

    constructor(opts) {
        this.fplus = opts.fplus;

        this.device_uuid = opts.device_uuid;
        this.url = opts.url;
        this.silent = opts.silent;

        this.address = Address.parse(opts.sparkplug_address);
        this.seq = 0;
    }

    public init() {
        this.run();
        return this;
    }

    /**
     * Publish a DATA payload with the new file entry to the MQTT broker
     * @param newFileEntry
     */
    public publishFileEntryMessage(newFileEntry: FileEntry): void {
        if (!this.isConnected) {
            logger.error('MQTT Client not connected');
            throw new ConnectionError('Mqtt Client not connected');
        }

        const metrics = FileEntryPayload.newDataPayload(newFileEntry).metrics;

        logger.info('MQTT: New file payload...');
        this.publish('DATA', metrics);
    }

    /**
     * Death handler
     * @private
     */
    private will() {
        if (this.silent) return undefined;

        const ndeath = {
            timestamp: Date.now(),
            metrics: MetricBuilder.death.node([]),
        };
        const will = SpB.encodePayload(ndeath);
        this.isConnected = false;

        return {
            topic: this.address.topic('DEATH').toString(),
            payload: will as Buffer,
            qos: 0 as QoS,
            retain: false,
        };
    }

    /**
     * mqtt client entry point
     * @private
     */
    private async run() {
        if (this.silent) logger.debug('Running in monitor-only mode.');

        const mqtt = await this.fplus.mqtt_client({
            verbose: true,
            will: this.will(),
        });
        this.mqtt = mqtt;

        mqtt.on('gssconnect', this.on_connect.bind(this));
        mqtt.on('error', this.on_error.bind(this));
        mqtt.on('message', this.on_message.bind(this));
        mqtt.subscribe(this.address.topic('CMD').toString());
    }

    /**
     * Helper function to encode metrics to Sparkplug B Payload
     * @param metrics
     * @param with_uuid
     * @private
     */
    private encode_metrics(metrics, with_uuid?) {
        const payload = {
            timestamp: Date.now(),
            metrics: metrics,
            seq: this.seq,
            uuid: undefined,
        };
        this.seq = this.seq < 255 ? this.seq + 1 : 0;
        if (with_uuid) payload.uuid = UUIDs.FactoryPlus;

        return SpB.encodePayload(payload);
    }

    /**
     * Helper function to build DATA message and publish it to broker
     * @param kind
     * @param metrics
     * @param with_uuid
     * @private
     */
    private publish(kind, metrics, with_uuid?: boolean) {
        if (!this.mqtt) {
            logger.debug("Can't publish without an MQTT connection.");
            return;
        }

        const topic = this.address.topic(kind);
        const payload = this.encode_metrics(metrics, with_uuid);

        this.mqtt.publish(topic, payload);
    }

    private on_connect() {
        logger.debug('Connected to MQTT broker.');
        this.isConnected = true;
        this.rebirth();
    }

    private rebirth() {
        if (this.silent) return;

        this.seq = 0;
        const Birth = MetricBuilder.birth;
        let metrics = Birth.node([]);

        // Service info
        metrics = metrics.concat([
            {name: 'Device_Information/Schema_UUID', type: 'String', value: UUIDs.Schema.Device_Information},
            {name: 'Device_Information/Instance_UUID', type: 'String', value: FILE_SERVICE_DEVICE_INFO_INSTANCE_UUID},
            {name: 'Device_Information/Manufacturer', type: 'String', value: Device_Info.Manufacturer},
            {name: 'Device_Information/Model', type: 'String', value: Device_Info.Model},
            {name: 'Device_Information/Serial', type: 'String', value: Device_Info.Serial},

            {name: 'Schema_UUID', type: 'UUID', value: UUIDs.Schema.Service},
            {name: 'Instance_UUID', type: 'UUID', value: this.device_uuid},
            {name: 'Service_UUID', type: 'UUID', value: FILE_SERVICE_UUID},
            {name: 'Service_URL', type: 'String', value: this.url},
        ]);

        metrics = metrics.concat(FileEntryPayload.getBirthPayload().metrics);
        // metrics = metrics.concat(CommandEscalationPayload.getBirthPayload().metrics);

        logger.debug(`Publishing birth certificate`);
        this.publish('BIRTH', metrics, true);
    }

    private on_error(error) {
        logger.debug('MQTT error: %o', error);

        logger.error(`Failed to connect to Factory+ MQTT, error: ${error}`);
        this.isConnected = false;
        //TODO: Reconnect or kill app?
    }

    private async on_message(topicstr, message) {
        const topic = Topic.parse(topicstr);
        const addr = topic.address;

        let payload;
        try {
            payload = SpB.decodePayload(message);
        } catch {
            logger.debug(`Bad payload on topic ${topicstr}`);
            return;
        }

        switch (topic.type) {
            case 'BIRTH':
                //await this.on_birth(addr, payload);
                break;
            case 'DEATH':
                //await this.on_death(addr, payload);
                break;
            case 'DATA':
                //await this.on_data(addr, payload);
                break;
            case 'CMD':
                await this.on_command(addr, payload);
                break;
            default:
                logger.debug(`Unknown Sparkplug message type ${topic.type}!`);
        }
    }

    private async on_command(addr, payload) {
        if (!addr.equals(this.address)) {
            //console.log(`Received CMD for ${addr}`);
            return;
        }

        for (const m of payload.metrics) {
            switch (m.name) {
                case 'Node Control/Rebirth':
                    await this.rebirth();
                    break;
                default:
                    logger.debug(`Received unknown CMD: ${m.name}`);
                /* Ignore for now */
            }
        }
    }
}
