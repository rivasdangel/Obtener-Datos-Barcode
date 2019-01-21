var mongoose = require('mongoose');

var Schema		= mongoose.Schema,
	ObjectId	= Schema.ObjectId;

var DataReader = new Schema({ 
	read_data:		{ type: String },
	bank_number: 	{ type: String },
	quality: 		{ type: String },
	matching_level: { type: String },
	status: 		{ type: Number },
	date_creation: 	{ type: Date },
	date_send:		{ type: Date }	
});

module.exports = mongoose.model('DataReader', DataReader);