/**
 * Created by @Jakofff
 */
var fs 		= require('fs')
	,log4js 	= require('log4js')
	,restClient = require('node-rest-client').Client;

var	file 		= require('../file')
	,common 	= require('../common');

var client		= new restClient()
	,log 		= log4js.getLogger('app');
	


var sendBarcodeData = function(d, callback){
	log.info('ProcessorBox|sendBarcodeData: ' + JSON.stringify(d));
	var self = this;
	var url = configAppGlobal.data.processorBox.url + configAppGlobal.data.processorBox.wsBarcodeSendData;
	
	var args = {
		data: d,
		headers: { 
			"Content-Type": "application/json; charset=utf-8"
			//"Content-Length": Buffer.byteLength(record, 'utf8')
		},
		requestConfig: {
	        timeout: 2000, //request timeout in milliseconds 
	        noDelay: false, //Enable/disable the Nagle algorithm 
	        keepAlive: false, //Enable/disable keep-alive functionality idle socket. 
	        keepAliveDelay: 1000 //and optionally set the initial delay before the first keepalive probe is sent 
	    },
	    responseConfig: {
	        timeout: 2000 //response timeout 
	    }
	}
			
	try{
		
		var req = client.post(url, args, function(data, response){
		    //console.log(data);
		    //console.log('-----------------');
		    //console.log(response);
		    
		    if(response != null && (response.complete == true && response.statusCode == 200)){
		    	if(data != null && (data.success == true && data.code == 1)){
		    		log.info('ProcessorBox|sendBarcodeData|Send to processor box');
		    		
		    		return callback(true);
		    	}else{
		    		log.info('ProcessorBox|sendBarcodeData|Error in data response|complete: ' + response.complete + '|statusCode:' + response.statusCode + '|statusMessage: ' + response.statusMessage);
		    		return callback(false);
		    	}
		    }else{
		    	log.info('ProcessorBox|sendBarcodeData|Error in response|complete: ' + response.complete + '|statusCode:' + response.statusCode + '|statusMessage: ' + response.statusMessage);
		    	return callback(false);
		    }
		});
		
		/*req.on('requestTimeout', function(req){
		    log.info('ProcessorBox|sendBarcodeData|requestTimeout');
		    req.abort();
		    return callback(false);
		});
		 
		req.on('responseTimeout', function(res){
		    log.info('ProcessorBox|sendBarcodeData|responseTimeout|has expired');
		    return callback(false);
		});*/
		 
//		//it's usefull to handle request errors to avoid, for example, socket hang up errors on request timeouts 
		req.on('error', function(err){
			log.info('ProcessorBox|sendBarcodeData|request error: ' + err.message);
			return callback(false);
		});
		
		//req.end();
		
	}catch(Exception){
		log.log('ProcessorBox|sendBarcodeData|Exception: ' + Exception.stack);
		return callback(false);
	}
}

module.exports = {
	sendBarcodeData: sendBarcodeData
}