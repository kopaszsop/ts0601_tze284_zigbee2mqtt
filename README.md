# Zigbee2MQTT Converter for Tuya TS0601 (_TZE284_qf5mzewi)

External converter for Tuya temperature & humidity sensor with display.

Fixes:

- Unsupported device in Zigbee2MQTT
- Incorrect time display caused by Tuya MCU firmware bug

## Features

- Temperature
- Humidity
- Battery
- Alarm thresholds
- Sensitivity settings
- Calibration
- Correct device clock

## Installation

1. Copy the converter:
/opt/zigbee2mqtt/data/external_converters/tze284_working.js

2. Add to `configuration.yaml`:

>external_converters:
>
>&nbsp;&nbsp;&nbsp;&nbsp;external_converters/tze284_working.js


4. Restart Zigbee2MQTT.

5. Optional: remove and reinsert batteries and/or reconfigure the device

## Device

Model: TS0601

Manufacturer: _TZE284_qf5mzewi

## Firmware issue

This device interprets MCU time incorrectly (UTC+8).  
The converter compensates for this.

## Author

Balint Vereskuti
