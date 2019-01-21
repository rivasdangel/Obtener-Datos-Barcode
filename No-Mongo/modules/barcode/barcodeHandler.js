var path = require('path'),
  log = require('log4js').getLogger('app'),
  fs = require('fs');

var DAO = require('./barcodeDAO'),
  notifier = require('../notifier'),
  processor = require('../processorbox');
var sec = Date.now();
var memory;
memoryVerify();

function memoryVerify() {
  try {
    memory = fs.readFileSync('./modules/barcode/memory.json');
    if (JSON.stringify(memory).indexOf('}') > 0) {
      memory = JSON.parse(memory);
    } else {
      throw 12121212;
    }
  } catch (err) {
    if (err.code == 'ENOENT' || err == 12121212) {
      fs.writeFileSync('./modules/barcode/memory.json', '{"bcn":"0","flag":false}');
      memory = {
        "bcn": "0",
        "flag": false
      };
    }
  }
}

var onBarcodeConnection = function(sock) {
  try {
    log.info('barcodeHandler|barcode tcp connected: ' + sock.remoteAddress + ':' + sock.remotePort);
    log.info('-----------------------------------');
    sock.setEncoding('utf8');
    sock.on('data', onBarcodeGetData, sock);
    sock.once('close', onBarcodeClose, sock);
    sock.on('error', onBarcodeError, sock);

  } catch (Exception) {
    log.error('barcodeHandler|onBarcodeConnection|Exception: ' + Exception.stack);
    notifier.notify(3, Exception.stack);
  }
}

var onBarcodeGetData = function(data, sock) {
  try {
    log.info('barcodeHandler|onBarcodeGetData: ' + data);

    var res = data.trim().split(":");

    var readData = "";
    var bankNumber = "";
    var quality = "";
    var matchingLevel = "";

    if (res != null) {
      readData = res[0] != "" ? res[0] : "";
      bankNumber = res[1] != "" ? res[1] : "";
      quality = res[2] != "" ? res[2] : "";
      matchingLevel = res[3] != "" ? res[3] : "";
      if (readData == "ERROR" && memory.flag == false && Date.now() - sec < 60000) {
        memory.bcn = "0";
        readData == memory.bcn;
        fs.writeFileSync('./modules/barcode/memory.json', JSON.stringify(memory));
      }
      if ((readData != "ERROR") && Date.now() - sec < 60000) {
        memory.bcn = readData;
        memory.flag = true;
        fs.writeFileSync('./modules/barcode/memory.json', JSON.stringify(memory));
      }
      if (memory.flag == true && (readData == "ERROR")) {
        readData = memory.bcn;
      }
      //console.log(readData+"  "+memory.bcn+"   "+memory.flag);
      if (Date.now() - sec >= 60000) {
        var data = {};
        data.idLine = configAppGlobal.data.idLine;
        data.record = {
					date_creation: new Date().getTime(),
					read_data: readData
        };
        //log.info('barcodeHandler|getBarcodeData|record: ' + JSON.stringify(data));

        processor.sendBarcodeData(data, function(resp) {
          log.info('barcodeHandler|getBarcodeData|sendBarcodeData: ' + JSON.stringify(resp));
          if (resp) {
            // DAO.updateDataStatus(data.record, function(result) {
            //   log.info('barcodeHandler|onBarcodeGetData|update record: ' + JSON.stringify(result));
            // });
          } else {
            log.error('barcodeHandler|onBarcodeGetData|sendBarcodeData|Error: No send data to processor box');
            notifier.notify(3, 'No send data to processor box');
          }
        });
        /*DAO.saveData(readData, bankNumber, quality, matchingLevel, function(result){
		    	log.info('barcodeHandler|onBarcodeGetData|save record: ' + JSON.stringify(result));

		    	if(result != null && result.success == true && result.code == 1){
		    			//send data to ws in processor box
		    			var data = {};
		    			data.idLine = configAppGlobal.data.idLine;
		    			data.record = result.data.record;
		    			//log.info('barcodeHandler|getBarcodeData|record: ' + JSON.stringify(data));

		    			processor.sendBarcodeData(data, function(resp){
		    				//log.info('barcodeHandler|getBarcodeData|sendBarcodeData: ' + JSON.stringify(resp));
		    				if(resp){
		    					DAO.updateDataStatus(data.record, function(result){
		    						log.info('barcodeHandler|onBarcodeGetData|update record: ' +  JSON.stringify(result));
		    					});
		    				}else{
		    					log.error('barcodeHandler|onBarcodeGetData|sendBarcodeData|Error: No send data to processor box');
		    	    			notifier.notify(3, 'No send data to processor box');
		    				}
		    			});

	    		}else{
	    			log.error('barcodeHandler|onBarcodeGetData|Error|No save data to db');
	    			notifier.notify(3, 'No save data to db');
	    		}
		    });*/
        sec = Date.now();
        memory.bcn = "0";
        memory.flag = false;
        fs.writeFileSync('./modules/barcode/memory.json', JSON.stringify(memory));
      }
      //sec++;
    } else {
      log.info('barcodeHandler|onBarcodeGetData|No receive data');
    }

  } catch (Exception) {
    log.error('barcodeHandler|onBarcodeGetData|Exception: ' + Exception.stack);
    notifier.notify(2, Exception.stack);
  }
}

var onBarcodeClose = function(data) {
  try {
    log.info('barcodeHandler|onBarcodeClose: ' + data);
    notifier.notify(3, 'Barcode disconnected!!!');

  } catch (Exception) {
    log.error('barcodeHandler|onBarcodeClose|Exception: ' + Exception.stack);
    notifier.notify(2, Exception.stack);
  }
}

var onBarcodeError = function(error) {
  try {
    log.info('barcodeHandler|onBarcodeError: ' + error);

  } catch (Exception) {
    log.error('barcodeHandler|onBarcodeError|Exception: ' + Exception.stack);
    notifier.notify(2, Exception.stack);
  }
}

var barcodeSenderData = function() {
  try {
    log.info('barcodeHandler|barcodeSenderData');

    DAO.getData(function(result) {
      //log.info('barcodeHandler|barcodeSenderData|result: ' + JSON.stringify(result));

      if (result != null && result.success == true && result.code == 1) {

        var records = result.data.records;
        log.info('barcodeHandler|barcodeSenderData|records: ' + records.length);

        if (records != null && records.length > 0) {
          records.forEach(function(record) {
            log.info('barcodeHandler|barcodeSenderData|record: ' + JSON.stringify(record));
            //send data to ws in processor box
            var data = {};
            data.idLine = configAppGlobal.data.idLine;
            data.record = record;
            //log.info('barcodeHandler|getBarcodeData|record: ' + JSON.stringify(data));

            processor.sendBarcodeData(data, function(resp) {
              //log.info('barcodeHandler|getBarcodeData|sendBarcodeData: ' + JSON.stringify(resp));
              if (resp) {
                DAO.updateDataStatus(data.record, function(result) {
                  log.info('barcodeHandler|barcodeSenderData|update record: ' + JSON.stringify(result));
                });
              } else {
                log.error('barcodeHandler|barcodeSenderData|sendBarcodeData|Error: No send data to processor box');
                notifier.notify(3, 'No send data to processor box');
              }
            });
          });
        }
      }
    });

  } catch (Exception) {
    log.error('barcodeHandler|onBarcodeGetData|Exception: ' + Exception.stack);
    notifier.notify(2, Exception.stack);
  }
}

module.exports = {
  onBarcodeConnection: onBarcodeConnection,
  onBarcodeGetData: onBarcodeGetData,
  onBarcodeClose: onBarcodeClose,
  onBarcodeError: onBarcodeError
//  ,barcodeSenderData: barcodeSenderData
}
