# Zigbee2MQTT Converter for Tuya TS0601 (_TZE284_qf5mzewi)

External converter for the Tuya **TS0601 temperature & humidity sensor with display**, compatible with **Zigbee2MQTT**.

This converter adds support for the device and fixes a **known firmware time synchronization bug**.

![TS0601 Sensor](/pictures/sensor.png)

---

# Device

| Property | Value |
|--------|--------|
| Model | TS0601 |
| Manufacturer | `_TZE284_qf5mzewi` |
| Vendor | Tuya |
| Type | Temperature & Humidity Sensor |
| Display | Temperature, Humidity, Comfort Indicator |
| Power | Battery |

---

# Features

Supported via Zigbee2MQTT:

- Temperature
- Humidity
- Battery level
- Temperature unit (°C / °F)
- Temperature alarm thresholds
- Humidity alarm thresholds
- Temperature sensitivity
- Humidity sensitivity
- Temperature calibration
- Humidity calibration
- Report interval

Additional fix:

- Correct device **clock synchronization**

---

# Device Display

The device shows:

- Time
- Date
- Temperature
- Humidity
- Comfort indicator
- Battery level
- Zigbee connection status

---

# Firmware Issue

The firmware used in this device incorrectly interprets MCU time synchronization.

The result is:

- incorrect clock on the display
- typically **+7 hours offset**

This converter compensates for the issue when responding to the `commandMcuSyncTime` request from the device.

---

# Installation

Copy the converter file:

```
/opt/zigbee2mqtt/data/external_converters/tze284.js
```

Add it to `configuration.yaml`:

```
external_converters:
  - external_converters/tze284.js
```

Restart Zigbee2MQTT.

---

# Compatibility

Tested with:

- Zigbee2MQTT **2.x**
- Tuya TS0601 (`_TZE284_qf5mzewi`)

---

# Author

Balint Vereskuti  
GitHub: https://github.com/kopaszsop

---

# License

MIT
