var mongoose	= require('mongoose')
	,path 		= require('path')
	,moment		= require('moment')
	,log		= require('log4js').getLogger('app')
	,notifier   = require('../notifier')
	,datareader	= require('../../models/DataReader');
var sec=0;

var DataReader  = mongoose.model('DataReader');


var saveData = function(readData, bankNumber, quality, matchingLevel, callback){
	try{
		var resp = {};
		resp.success = false;
		resp.code = -1;
		resp.msg = "No ok default";
		resp.data = null;

		//each save record, delete 5 days of historic.
		removeData();


		var dataReader = new DataReader({
			read_data:		readData,
			bank_number:	bankNumber,
			quality:		quality,
			matching_level:	matchingLevel,
			status:			0,
			//date_send:		Date.now()
			date_creation:	Date.now()
	    });
if(sec >=0){
		dataReader.save(function(err, dataReader) {
			if(err){
				resp.code = -3;
	    		resp.msg = err;
	    		return callback(resp);
			}

			resp.success = true;
			resp.code = 1;
			resp.msg = 'ok';
			resp.data = { record: dataReader };

			log.info('barcodeDAO|saveData|Record added');
	        return callback(resp);
	    });
			sec=0;
}
sec++;
	}catch(Exception){
		log.error('barcodeDAO|saveData|Exception: ' + Exception.stack);
		notifier.notify(3, Exception.stack);
	}
};


var updateDataStatus = function(record, callback){
	try{
		var resp = {};
		resp.success = false;
		resp.code = -1;
		resp.msg = "No ok default";
		resp.data = null;


		record.status = 1;
		record.date_send =  Date.now();

		var recordUpdate = record.toObject();
		delete recordUpdate._id;

		log.info('barcodeDAO|updateData|Record update: ' + JSON.stringify(recordUpdate));

		DataReader.update({_id: record.id}, recordUpdate, function(err, raw){
			if(err){
				resp.code = -3;
	    		resp.msg = err;
	    		return callback(resp);
			}

			log.info('barcodeDAO|updateData|Record update raw: ' + JSON.stringify(raw));

			resp.success = true;
			resp.code = 1;
			resp.msg = 'ok';
			resp.data = { record: recordUpdate };

	        return callback(resp);
	    });

	}catch(Exception){
		log.error('barcodeDAO|updateData|Exception: ' + Exception.stack);
		notifier.notify(3, Exception.stack);
	}
};

var removeData = function(){

//	DataReader.remove({_id: '58e89618b329640b0c16ced5'}, function(err){
//		if(err != null){
//			log.error('barcodeDAO|saveData|remove error: ' + err);
//		}
//
//		log.info('barcodeDAO|saveData|remove ok');
//	});

	var dayToDelete = moment().subtract(5, 'days');


	DataReader.remove({status: 1, date_creation: {$lte: dayToDelete } }, function(err){
		if(err != null){
			log.error('barcodeDAO|removeData|remove error: ' + err);
		}

		log.info('barcodeDAO|removeData|remove ok');
	});
};

var getData = function(callback){
	try{
		var resp = {};
		resp.success = false;
		resp.code = -1;
		resp.msg = "No ok default";
		resp.data = null;

		DataReader.find({status: 0}, function(err, docs){
			if(err){
				resp.code = -3;
	    		resp.msg = err;
	    		return callback(resp);
			}

			resp.success = true;
			resp.code = 1;
			resp.msg = 'ok';
			resp.data = { records: docs };

	        return callback(resp);
	    });

	}catch(Exception){
		log.error('barcodeDAO|getData|Exception: ' + Exception.stack);
		notifier.notify(3, Exception.stack);
	}
};


module.exports = {
	saveData: saveData,
	updateDataStatus: updateDataStatus,
	getData: getData
}
