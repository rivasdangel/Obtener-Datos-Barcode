var mongoose	= require('mongoose')
	,log		= require('log4js').getLogger('app')
	,notifier   = require('../notifier');



var connect = function(url, callback){
	mongoose.connect(url);
	
	var conn = mongoose.connection;
	
	conn.on('connected', function(){  
		log.info('DB|Mongoose connection open to ' + url);
		notifier.notify(0, 'Database connected');
		
		return callback(1);
	});
	
	conn.on('error', function(err){
		log.info('DB|Mongoose connection error: ' + err);
		notifier.notify(3, 'Database error' + err);
		
		return callback(0);
	});
	
	conn.on('disconnected', function(){
		log.info('DB|Mongoose connection disconnected');
		notifier.notify(3, 'Database disconnected');
		
		return callback(0);
	});
	
	process.on('SIGINT', function(){  
		conn.close(function(){
			log.info('DB|Mongoose default connection disconnected through app termination'); 
			notifier.notify(3, 'Database close');
			process.exit(0); 
		}); 
	}); 
}

module.exports = {
	connect: connect
}