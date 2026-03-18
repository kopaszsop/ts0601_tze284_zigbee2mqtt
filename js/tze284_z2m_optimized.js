/**
 * External converter for TS0601 (_TZE284_qf5mzewi)
 *
 * Install:
 *   /opt/zigbee2mqtt/data/external_converters/tze284.js
 */

const exposes = require('zigbee-herdsman-converters/lib/exposes');
const tuya = require('zigbee-herdsman-converters/lib/tuya');

const e = exposes.presets;
const ea = exposes.access;

const vc = tuya.valueConverter;
const vcb = tuya.valueConverterBasic ?? vc;

// convert integer to 4 bytes
const b4 = (v) => [(v>>24)&255,(v>>16)&255,(v>>8)&255,v&255];

// MCU time sync workaround
const fzLocal = {
    mcuSyncTime: {
        cluster: 'manuSpecificTuya',
        type: ['commandMcuSyncTime'],
        convert: async (model, msg) => {

            const now = Math.round(Date.now()/1000);
            const offset = Number(msg.device?.meta?.clockOffset ?? -7);

            const fakeUtc = now + (offset * 3600);

            await msg.endpoint.command(
                'manuSpecificTuya',
                'mcuSyncTime',
                {
                    payloadSize: 8,
                    payload: [...b4(fakeUtc),0,0,0,0],
                },
                {disableDefaultResponse:true},
            );

            return {};
        },
    },
};

// UI adjustable offset
const tzLocal = {
    clock_offset: {
        key: ['clock_offset'],
        convertSet: async (entity, key, value, meta) => {
            const v = Number(value);
            if (Number.isNaN(v)) throw new Error('clock_offset must be number');

            meta.device.meta ??= {};
            meta.device.meta.clockOffset = v;

            return {state:{clock_offset:v}};
        },
        convertGet: async (entity, key, meta) => {
            return {state:{clock_offset: meta.device.meta?.clockOffset ?? -7}};
        },
    },
};

const definition = {

    fingerprint:[{
        modelID:'TS0601',
        manufacturerName:'_TZE284_qf5mzewi',
    }],

    model:'TS0601_qf5mzewi',
    vendor:'Tuya',
    description:'Temperature & humidity sensor with display',

    fromZigbee:[
        tuya.fz.datapoints,
        fzLocal.mcuSyncTime,
    ],

    toZigbee:[
        tuya.tz.datapoints,
        tzLocal.clock_offset,
    ],

    configure: tuya.configureMagicPacket,

    extend:[
        tuya.modernExtend.tuyaBase({
            dp:true,
            queryOnConfigure:true,
            queryIntervalSeconds:60,
            timeStart:'off',
        }),
    ],

    exposes:[

        e.temperature(),
        e.humidity(),
        e.battery(),

        exposes.numeric('clock_offset',ea.STATE_SET)
            .withUnit('h')
            .withValueMin(-24)
            .withValueMax(24)
            .withDescription('Manual clock correction'),

        exposes.enum('temperature_unit',ea.STATE_SET,['celsius','fahrenheit']),

        exposes.numeric('max_temperature',ea.STATE_SET).withUnit('°C'),
        exposes.numeric('min_temperature',ea.STATE_SET).withUnit('°C'),

        exposes.numeric('max_humidity',ea.STATE_SET).withUnit('%'),
        exposes.numeric('min_humidity',ea.STATE_SET).withUnit('%'),

        exposes.binary('temperature_alarm',ea.STATE,true,false),
        exposes.binary('humidity_alarm',ea.STATE,true,false),

        exposes.numeric('temperature_report_interval',ea.STATE_SET).withUnit('s'),

        exposes.numeric('temperature_sensitivity',ea.STATE_SET).withUnit('°C'),
        exposes.numeric('humidity_sensitivity',ea.STATE_SET).withUnit('%'),

        exposes.numeric('temperature_calibration',ea.STATE_SET).withUnit('°C'),
        exposes.numeric('humidity_calibration',ea.STATE_SET).withUnit('%'),
    ],

    meta:{
        clockOffset:-7,

        tuyaDatapoints:[

            [1,'temperature',vc.divideBy10],
            [2,'humidity',vc.raw],
            [4,'battery',vc.raw],

            [9,'temperature_unit',
                (vcb.lookup
                    ? vcb.lookup({celsius:tuya.enum(0),fahrenheit:tuya.enum(1)})
                    : vc.raw)],

            [10,'max_temperature',vc.divideBy10],
            [11,'min_temperature',vc.divideBy10],

            [12,'max_humidity',vc.raw],
            [13,'min_humidity',vc.raw],

            [14,'temperature_alarm',vc.raw],
            [15,'humidity_alarm',vc.raw],

            [17,'temperature_report_interval',vc.raw],

            [19,'temperature_sensitivity',vc.divideBy10],
            [20,'humidity_sensitivity',vc.raw],

            [23,'temperature_calibration',vc.divideBy10],
            [24,'humidity_calibration',vc.raw],
        ],
    },
};

module.exports = definition;
