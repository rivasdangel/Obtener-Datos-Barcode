/**
 * Created by @Jakofff
 */
var fs = require('fs')
	,common = require('../common');

var readFileToJson = function(filename) {
	console.log(common.time() + "|fileUtil|readFileToJson");
	var config = null;
	
	try {
		var data = fs.readFileSync(filename, 'utf8');
		if(data != ''){
			config = JSON.parse(data);
			console.log(common.time() + "|fileUtil|readFileToJson|Loaded file: " + filename);
		}else{
			console.log(common.time() + "|fileUtil|readFileToJson|Empty file: " + filename);
		}
	}catch (Exception) {
		console.log(common.time() + "|fileUtil|readFileToJson|Exception: " + Exception.stack);
	}
	
	return config;
}

var writeFileState = function(fileName, value, time){
	console.log(common.time() + "|fileUtil|writeFileState");
	
	var newContent = time + "," + value;

	try{
		fs.appendFileSync(fileName, newContent);
		
	}catch (Exception) {
		console.log(common.time() + "|fileUtil|writeFileState|Exception: " + Exception.stack);
	}
}
    
var clean = function(fileName){
	fs.truncateSync(fileName, 0);
}

module.exports = {
	readFileToJson: readFileToJson,
	writeFileState: writeFileState,
	clean: clean
}