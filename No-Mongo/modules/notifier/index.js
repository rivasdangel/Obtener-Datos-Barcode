/**
 * Created by @Jakofff
 */
var os 			= require('os')
	,fs 		= require('fs')
	,log4js 	= require('log4js')
	,restClient = require('node-rest-client').Client;

var	file 		= require('../file')
	,common 	= require('../common');

var client		= new restClient()
	,log 		= log4js.getLogger('app');
	


var getDataByDevice = function(url, callback){
	log.info('Notifier|getDataByDevice');
	
	var hostname = os.hostname()
		,data = null;
	
	var args = {
	    data: { Name: hostname },
	    headers: { 'Content-Type': 'application/json' }
	};
	
	try{
		client.post(url + 'GetDeviceByName', args, function(data, response) {
			//console.log(data);
			//console.log(response);
		    if(response.complete == true && response.statusCode == 200){
		    	if(data != null){
		    		return callback(data);
		    	}else{
		    		return callback(null);
		    	}
		    }else{
		    	return callback(null);
		    }
		});
	}catch(Exception){
		log.log('Notifier|getDataByDevice|Exception: ' + Exception.stack);
	}
}

var notify = function(idLevel, data){
	log.info('Notifier|notify: ' + new Date().getTime());
	var self = this;
	var enabled = configAppGlobal.data.notifier.enabled;
	var url = configAppGlobal.data.notifier.url;
	var idDevice = configAppGlobal.data.idDevice;
	var idApp = configAppGlobal.data.idApp;
	
	log.info('Notifier|notify|enabled: ' + enabled);
	
	var args = {
	    data: { 
	    	IdDevices: idDevice,
	    	IdApp: idApp,
	    	IdLevel: idLevel,
	    	Data: data,
			DateTimeEvent: new Date().getTime()
	    },
	    headers: { 'Content-Type': 'application/json' },
	    requestConfig: {
	        timeout: 2000, //request timeout in milliseconds 
	        noDelay: false, //Enable/disable the Nagle algorithm 
	        keepAlive: false, //Enable/disable keep-alive functionality idle socket. 
	        keepAliveDelay: 1000 //and optionally set the initial delay before the first keepalive probe is sent 
	    },
	    responseConfig: {
	        timeout: 2000 //response timeout 
	    }
	};
			
			
	try{
		if(enabled){
			var req = client.post(url, args, function (data, response) {
			    //console.log(data);
			    //console.log('-----------------');
			    //console.log(response);
			    
			    d = data.d;
			    
			    if(response != null && (response.complete == true && response.statusCode == 200)){
			    	if(d != null && (d.Success == true && d.Code == 1)){
			    		log.info('Notifier|notify|Send');
			    	}else{
			    		log.info('Notifier|notify|Error in data response|Sucess: ' + d.Success + '|Code: ' + d.Code + '|Msg: ' + d.Msg);
			    	}
			    }else{
			    	log.info('Notifier|notify|Error in response|complete: ' + response.complete + '|statusCode:' + response.statusCode + '|statusMessage: ' + response.statusMessage);
			    }
			});
			
			/*req.on('requestTimeout', function(req){
			    log.info('Notifier|notify|requestTimeout');
			    req.abort();
			});
			 
			req.on('responseTimeout', function(res){
			    log.info('Notifier|notify|responseTimeout|has expired');
			});*/
			 
			//it's usefull to handle request errors to avoid, for example, socket hang up errors on request timeouts 
			req.on('error', function(err){
				log.info('Notifier|notify|request error: ' + err.message);
			});
		}
		
	}catch(Exception){
		log.log('Notifier|notify|Exception: ' + Exception.stack);
	}
}

module.exports = {
	getDataByDevice: getDataByDevice,
	notify: notify
}