/**
 * Created by @Jakofff
 */
try{
	var	fs			= require('fs')
		,path 		= require('path')
		,log4js 	= require('log4js')
		,net 		= require('net');

	var pathApp 	= path.join(__dirname, '/')
		,configPath = path.join(pathApp, 'config/')
		,pathModels = path.join(pathApp, 'models/')
		,pathModules= path.join(pathApp, 'modules/');

	var configFilename	= path.join(configPath, 'config.json')
		,logFilename 	= path.join(configPath, 'log4js.json');

	var fileUtil		= require(path.join(pathModules,'file'))
		,common  		= require(path.join(pathModules,'common'))
		,notifier   	= require(path.join(pathModules,'notifier'))
		,barcodeHandler	= require(path.join(pathModules,'barcode/barcodeHandler'))
		,db				= require(path.join(pathModules,'db'));

	var configApp = {}
		,log = null
		,server = null
		,options = {
			//key:fs.readFileSync('server.key'), //if require ssl
			//cert:fs.readFileSync('server.crt'), //if require ssl
		};

	configApp = fileUtil.readFileToJson(configFilename);
	if(configApp != null){
		try{
			log4js.configure(logFilename, { cwd: configApp.logsPath });
			log = log4js.getLogger('app');

			global.configAppGlobal 	= configApp;
			global.pathRootApp		= pathApp;
			global.pathModelsApp	= pathModels;
			global.pathModulesApp	= pathModules;

			getVars();

			log.info('-----------------------------------');
			log.info('App BarcodeBox|Configuration loaded');
			server = net.createServer();

			//db.connect(configApp.data.db.barcodeBoxUrl, function(res){
				server.listen(configApp.port, function(){
					log.info('App BarcodeBox|Server Up: ' + JSON.stringify(server.address()));
					notifier.notify(0, 'Start BarcodeBox App');
				});
			//});

			server.on('connection', barcodeHandler.onBarcodeConnection);

		}catch(Exception){
			log.error('App BarcodeBox|Exception: ' + Exception.stack);
			notifier.notify(3, Exception.stack);
		}
	}


	function getVars(){
		console.log('------PATHS------');
		console.log(pathApp);
		console.log(pathModules);
		//console.log(pathRoutes);
		console.log(configPath);
		console.log('------FILES CONFIG------');
		console.log(configFilename);
		console.log(logFilename);
		console.log('------PATHS GLOBLALS------');
		console.log(pathRootApp);
		console.log(pathModulesApp);
		//console.log(pathRoutesApp);
		console.log('--------------------------');
	}

}catch(Exception){
	console.log('App BarcodeBox|Exception: ' + Exception.stack);
}
