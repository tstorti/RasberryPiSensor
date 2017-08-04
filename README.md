# RasberryPiSensor

This is command-line application for a rasberry pi equipped with a BME280 Sensor.  When turned on, the application will update firebase with configuration details allowing for remote control by a web-based UI.  When activated by this web UI, RasberryPiSensor will record data to a firebase database with temperature, humidity, pressure, and timestamp information.    

The web controller application is available at [https://github.com/tstorti/RasberryPiWebInterface].  Additional documentation is available on that page.  

The sensor appplication was developed using Node.js.

### Key npm packages:

- **node-adafruit-bme280**: used for communicating with the Bosch BME280 temperature, humidity, and pressure sensor
- **rpi-gpio**: used for controlling the GPIO pins on the Rasberry Pi.  Currently these are just used to turn on/off LED indicator lights.  Eventually this functionality will be extended to turn on/off relays as part of a remotely controlled environment (using a refrigerator, humidifier)
- **firebase**: used for storing sensor data.  Firebase also sets values for each sensor which are recognized by the web interface and allows for remote control of data collection.  


##### Contributors:
Tony Storti
