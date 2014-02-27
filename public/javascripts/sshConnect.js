var sshClient = require('ssh2');
var S = require('string');
var connect = require('./mysqlConnect')

var cmdRunning = 'luna-send -n 1 -f palm://com.palm.applicationManager/running "{}"'
var cmdMemory = 'free -o'
var sub ='n-'
var memPerProcess = 'ps -eo %mem,cmd | sort -k1 -r'

exports.sshConnect = function(app,res,hostip,page,port,username,password)
{

	//Default values
	portno =  port || 22;
	un = username || 'root';
	passwd = password || '1234';
	var arrforIDnProc = [];
	var arrforMem = [];
	var processCount = 0;
	var memData = [];
	var processMem = [];

	var c = new sshClient();
	c.on('connect', function() {
	    console.log('Connection :: connect')
	});

	if('memory' === page)
	{

		function getProcessMemory(data)
		{
			//console.log('in getProcessMemory::'+data);
			var str1 = data.toString()
			var cmds = str1.split(',');
			var count = 1;

			var c1 = new sshClient();
			c1.on('connect', function() {
			   	console.log('C1 Connection :: connect')
			});

			c1.on('ready', function() 
			{
		    	console.log('C1 Connection :: ready');
                count=cmds.length;
				for(var i=0;i<cmds.length;i++)
				{
				   c1.exec(cmds[i], function(err, stream) {
				  		//console.log('in exec loop');
				    	if (err) throw err;
				    	stream.on('data', function(data, extended) 
						{
							if(S(data).startsWith('%MEM'))
								data = 0;
							processMem.push(data);
							//console.log('processMem::'+processMem);
							count--;
							if(0 === count)
								connect.dbConnect(app,res,page,arrforIDnProc,arrforMem[1],processCount,processMem);
				    	});
				    });
				}
		    });
			c1.connect({
				host: hostip,
				port: portno,
				username: un,
				password: passwd
			});
		}

		function getPerProcessMem(memData)
		{
			//console.log('memData::'+memData);
			//console.log("processMem::"+processMem);
			
		}

		function getProcessOnTarget(proc)
	    {
	      console.log("list of running apps::"+proc);
	      var obj = JSON.parse(proc);
	      processCount = obj.running.length;
	      for(var i = 0; i < obj.running.length; i++) 
	      {
	      	arrforIDnProc.push(obj.running[i]["id"],obj.running[i]["processid"])

	      	// Removing 'n-' from process id to run top command
	      	if(S(obj.running[i]["processid"]).startsWith(sub))
	      	{
	      		var procID = S(obj.running[i]["processid"]).chompLeft(sub) 
	      		var memDataCmd = 'top -b -n 1 -p "'+ procID+'" | tail -n 2 | head -n 1 | awk '+"'{print $10}'";
	      	}
	      	else
	      		var memDataCmd = 'top -b -n 1 -p "'+ obj.running[i]["processid"]+'" | tail -n 2 | head -n 1 | awk '+"'{print $10}'";

	      	memData.push(memDataCmd);
	      }
	    }

	    function getMemoryOnTarget(usage)
	    {
	      var str = usage.toString()
	      var lines = str.split(/\n/g);
	      for(var i = 0; i < lines.length; i++) 
		  {
			lines[i] = lines[i].split(/\s+/);
			arrforMem.push(lines[i]);
	      }
	      
	    }

		c.on('ready', function() {
		    console.log('Connection :: ready');
		  
		  	c.exec(cmdRunning, function(err, stream) {
		    	if (err) throw err;
		    	stream.on('data', function(data, extended) {
		   		    getProcessOnTarget(data);
		   		    getProcessMemory(memData);
		    	});

		    	stream.on('end', function() {
		      		console.log('Stream :: EOF');
		    	});

		    	stream.on('close', function() {
		      		console.log('Stream :: close');
		    	});

		    	stream.on('exit', function(code, signal) {
		      		console.log('Stream :: exit :: code: ' + code + ', signal: ' + signal);
		      		c.end();
		    	});
		    	stream.end();
		  	});

		  	c.exec(cmdMemory, function(err, stream) {
		    	if (err) throw err;
		    	stream.on('data', function(data, extended) {
		    		getMemoryOnTarget(data);
		    	});

		    	stream.on('end', function() {
		      		console.log('Stream :: EOF');
		    	});

		    	stream.on('close', function() {
		      		console.log('Stream :: close');
		    	});

		    	stream.on('exit', function(code, signal) {
		      		console.log('Stream :: exit :: code: ' + code + ', signal: ' + signal);
		      		c.end();
		    	});
		    	stream.end();
		  	});

		  	c.exec(memPerProcess, function(err, stream) {
		    	if (err) throw err;
		    	stream.on('data', function(data, extended) {
		    		getPerProcessMem(data);
		    	});

		    	stream.on('end', function() {
		      		console.log('Stream :: EOF');
		    	});

		    	stream.on('close', function() {
		      		console.log('Stream :: close');
		    	});

		    	stream.on('exit', function(code, signal) {
		      		console.log('Stream :: exit :: code: ' + code + ', signal: ' + signal);
		      		c.end();
		    	});
		    	stream.end();
		  	});
		});
	}

	if('cpu' === page)
	{
		console.log('in cpu page');
	}
	if('perf' === page)
	{
		c.on('ready', function() 
		{
		    console.log('Connection :: ready');
		  	c.exec('uptime', function(err, stream) 
		  	{

		    	if (err) throw err;
		    	stream.on('data', function(data, extended) {
		    		console.log('in exec function');
		    		console.log('data::'+data);
		    	});

		    	stream.on('end', function() {
		      		console.log('Stream :: EOF');
		    	});

		    	stream.on('close', function() {
		      		console.log('Stream :: close');
		    	});

		    	stream.on('exit', function(code, signal) {
		      		console.log('Stream :: exit :: code: ' + code + ', signal: ' + signal);
		      		c.end();
		    	});
		    	stream.end();
		  	});
		});
	}
	c.on('error', function(err) {
	  	console.log('Connection :: error :: ' + err);
	});

	c.on('end', function() {
		console.log('Connection :: end');
	});

	c.on('close', function(had_error) {
	  	console.log('Connection :: close');
	});

	c.connect({
	  host: hostip,
	  port: portno,
	  username: un,
	  password: passwd
	});
}