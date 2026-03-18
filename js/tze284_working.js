/**
 * External converter for TS0601 (_TZE284_qf5mzewi)
 *
 * Install:
 *   /opt/zigbee2mqtt/data/external_converters/tze284.js
 *
 * configuration.yaml:
 *   external_converters:
 *     - external_converters/tze284.js
 *
 * NOTE:
 * This firmware appears to mishandle standard Tuya MCU time sync.
 * A manual clock_offset (hours) is exposed in Zigbee2MQTT UI.
 *
 * Examples:
 *   -7  => send 7 hours less
 *   -6  => send 6 hours less
 *    0  => no correction
 */

const exposes = require('zigbee-herdsman-converters/lib/exposes');
const tuya = require('zigbee-herdsman-converters/lib/tuya');

const e = exposes.presets;
const ea = exposes.access;

const vc = tuya.valueConverter;
const vcb = tuya.valueConverterBasic ?? vc;

// Helper: int -> 4 bytes
const to4Bytes = (v) => [
    (v >> 24) & 0xFF,
    (v >> 16) & 0xFF,
    (v >> 8) & 0xFF,
    v & 0xFF,
];

// User-adjustable clock offset
const tzLocal = {
    clock_offset: {
        key: ['clock_offset'],
        convertSet: async (entity, key, value, meta) => {
            const offset = Number(value);
            if (Number.isNaN(offset)) {
                throw new Error('clock_offset must be a number');
            }

            if (!meta.device.meta) meta.device.meta = {};
            meta.device.meta.clockOffset = offset;

            return {state: {clock_offset: offset}};
        },
        convertGet: async (entity, key, meta) => {
            const offset = meta.device.meta?.clockOffset ?? -7;
            return {state: {clock_offset: offset}};
        },
    },
};

// Custom MCU time sync response
const fzLocal = {
    mcuSyncTime_withOffset: {
        cluster: 'manuSpecificTuya',
        type: ['commandMcuSyncTime'],
        convert: async (model, msg, publish, options, meta) => {
            const now = Math.round(Date.now() / 1000);

            // -7 means "send 7 hours less"
            const offset = Number(msg.device?.meta?.clockOffset ?? -7);

            const fakeUtc = now + (offset * 3600);

            const payload = {
                payloadSize: 8,
                payload: [
                    ...to4Bytes(fakeUtc),
                    ...to4Bytes(0),
                ],
            };

            await msg.endpoint.command(
                'manuSpecificTuya',
                'mcuSyncTime',
                payload,
                {disableDefaultResponse: true},
            );

            return {};
        },
    },
};

console.log('### LOADED tze284.js (TS0601 _TZE284_qf5mzewi) ###');

const definition = {
    fingerprint: [
        {
            modelID: 'TS0601',
            manufacturerName: '_TZE284_qf5mzewi',
        },
    ],

    model: 'TS0601_qf5mzewi',
    vendor: 'Tuya',
    description: 'Temperature & humidity sensor (Tuya TS0601, _TZE284_qf5mzewi)',

    fromZigbee: [
        tuya.fz.datapoints,
        fzLocal.mcuSyncTime_withOffset,
    ],

    toZigbee: [
        tuya.tz.datapoints,
        tzLocal.clock_offset,
    ],

    configure: tuya.configureMagicPacket,

    extend: [
        tuya.modernExtend.tuyaBase({
            dp: true,
            queryOnConfigure: true,
            queryIntervalSeconds: 60,
            timeStart: 'off',
        }),
    ],

    exposes: [
        e.temperature(),
        e.humidity(),
        e.battery(),

        exposes.numeric('clock_offset', ea.STATE_SET)
            .withUnit('h')
            .withValueMin(-24)
            .withValueMax(24)
            .withDescription('Manual clock correction for device firmware'),

        exposes.enum('temperature_unit', ea.STATE_SET, ['celsius', 'fahrenheit'])
            .withDescription('Temperature unit'),

        exposes.numeric('max_temperature', ea.STATE_SET)
            .withUnit('°C')
            .withDescription('Max temperature alarm threshold'),

        exposes.numeric('min_temperature', ea.STATE_SET)
            .withUnit('°C')
            .withDescription('Min temperature alarm threshold'),

        exposes.numeric('max_humidity', ea.STATE_SET)
            .withUnit('%')
            .withDescription('Max humidity alarm threshold'),

        exposes.numeric('min_humidity', ea.STATE_SET)
            .withUnit('%')
            .withDescription('Min humidity alarm threshold'),

        exposes.binary('temperature_alarm', ea.STATE, true, false)
            .withDescription('Temperature alarm state'),

        exposes.binary('humidity_alarm', ea.STATE, true, false)
            .withDescription('Humidity alarm state'),

        exposes.numeric('temperature_report_interval', ea.STATE_SET)
            .withUnit('s')
            .withDescription('Temperature report interval'),

        exposes.numeric('temperature_sensitivity', ea.STATE_SET)
            .withUnit('°C')
            .withDescription('Temperature sensitivity'),

        exposes.numeric('humidity_sensitivity', ea.STATE_SET)
            .withUnit('%')
            .withDescription('Humidity sensitivity'),

        exposes.numeric('temperature_calibration', ea.STATE_SET)
            .withUnit('°C')
            .withDescription('Temperature calibration offset'),

        exposes.numeric('humidity_calibration', ea.STATE_SET)
            .withUnit('%')
            .withDescription('Humidity calibration offset'),
    ],

    meta: {
        clockOffset: -7,
        tuyaDatapoints: [
            [1, 'temperature', vc.divideBy10],
            [2, 'humidity', vc.raw],
            [4, 'battery', vc.raw],

            [9, 'temperature_unit',
                (vcb.lookup
                    ? vcb.lookup({celsius: tuya.enum(0), fahrenheit: tuya.enum(1)})
                    : vc.raw)],

            [10, 'max_temperature', vc.divideBy10],
            [11, 'min_temperature', vc.divideBy10],

            [12, 'max_humidity', vc.raw],
            [13, 'min_humidity', vc.raw],

            [14, 'temperature_alarm', vc.raw],
            [15, 'humidity_alarm', vc.raw],

            [17, 'temperature_report_interval', vc.raw],

            [19, 'temperature_sensitivity', vc.divideBy10],
            [20, 'humidity_sensitivity', vc.raw],

            [23, 'temperature_calibration', vc.divideBy10],
            [24, 'humidity_calibration', vc.raw],
        ],
    },
};

module.exports = definition;
