## nodejs-BarcodeBox
This software is a resident app for read data using serial port of weighing machine.

##Prerequisites

* Node installed for your architecture
* forever module installed with general parameter

##Install

* on user home path, for example: /home/pi/ clone this project.
* install the follow modules:
* npm install fs
* npm install log4js
* npm install serialport

##Configuration

```
#!python

config.json --> configuration for application
log4js.json --> configuration for log
```


##Logs files
There log files:

```
#!python

app_access.log -> records of access to app
app_errors.log -> records of errors in app
app_app.log -> tracking for process of app
```

##Execute App

* In the project directory execute:

```
#!python

node app-serial.js
```

##Software
* NodeJS
* fs module for nodejs
* log4js module for nodejs
* serialport module for nodejs
* Dev on Eclipse Luna
* Plugin nodejs for Eclipse Luna