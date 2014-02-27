var http = require('http')
var mysql = require('mysql');
var fs = require('fs');
var util = require('util');
var db = 'testdb';

//today's date
var currentDate = new Date();
var day = currentDate.getDate();
var month = currentDate.getMonth() + 1;
var year = currentDate.getFullYear();
var todayDate = day+"_"+month+"_"+year;

var client = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'welcome'
});

exports.dbConnect = function(app,res,page,processData,memData,count,processMem)
{
	if('memory' === page)
	{
		//table name
		var tab_name = page+'_usage_'+todayDate;
		console.log('processmem::'+processMem[2]);
		
		//Establish connection
		client.connect(function(err){
	    	if(err != null) {
	        	res.end('Error connecting to mysql:' + err+'\n');
	    	}
		});

		client.query('CREATE DATABASE '+ db,function(err, results){
			console.log('in createdb');
			if (err && err.number != client.ERROR_DB_CREATE_EXISTS) 
				throw err;
			useDB(db);
		});
		
		function useDB(db)
		{
			client.query('USE '+db,function(err){
					if(err)
						throw err;
			});
			createTable(tab_name);
		}

		function createTable(tab_name)
		{
			console.log('in createTable');
			/*var dropTable= 'drop table '+tab_name;
			client.query(dropTable,function(err, results){
				console.log('in drop table**********');
				if (err)
					throw err;
			});*/
			var createTable = 'CREATE TABLE IF NOT EXISTS '+tab_name+' (slno integer primary key AUTO_INCREMENT, appID VARCHAR(255),processID VARCHAR(255),processMemory VARCHAR(255),used VARCHAR(255),free VARCHAR(255),total VARCHAR(255),shared VARCHAR(255),buffer VARCHAR(255),cached VARCHAR(255),processCount integer)'; 
			client.query(createTable,function(err, results){
				if (err && err.number != client.ERROR_TABLE_EXISTS_ERROR)
					throw err;
			});
			insertDataToTable(tab_name,processData,memData,count,processMem);
		}

		function insertDataToTable(tab_name,processData,memData,count,processMem)
		{
			var tabData = 'select count(*) as appCount from '+tab_name;
			
			client.query(tabData,function(err, results)
			{
				if (err)
					throw ("table does not exist::"+err);
				//console.log("count::"+results[0].appCount);
				if(undefined === results[0].appCount)
				{
					for(var i=0;i<processData.length;i++)
					{
						console.log("tabData::"+processMem[i]);
						var insertQuery ='insert into '+tab_name +'(appID,processID,processMemory,used,free,total,shared,buffer,cached,processCount) values ('+'"'+processData[i]+'","'+processData[i+1]+'","'+processMem[i/2]+'",'+memData[2]+','+memData[3]+','+memData[1]+','+memData[4]+','+memData[5]+','+memData[6]+','+count+')';
						console.log("in insertQuery::"+insertQuery);
						client.query(insertQuery,function(err, results){
							if (err)
								throw err;
						});
						i+=1;
					}
				}
				else
				{
						var tabData1 = 'select appID as app,processID as id,processCount as totcnt from '+tab_name;
						//console.log("tabData1::"+tabData1);
						client.query(tabData1,function(err, tabresults)
						{
							if (err)
								throw err;

							for(var j=0;j<processData.length;j++)
							{
								var flag = 0;
								for(var k=0;k<tabresults.length;k++)
								{
									if((processData[j+1] === tabresults[k].id) && (processData[j] === tabresults[k].app))
									{
										flag=1;
										break;
									}
								}
								if(0 === flag)
								{
									console.log("Superrrrr::"+processMem[j])
									var newQuery ='insert into '+tab_name +'(appID,processID,processMemory,used,free,total,shared,buffer,cached,processCount) values ('+'"'+processData[j]+'","'+processData[j+1]+'","'+processMem[j/2]+'",'+memData[2]+','+memData[3]+','+memData[1]+','+memData[4]+','+memData[5]+','+memData[6]+','+count+')';			
									console.log("in new process insertQuery::"+newQuery);
									client.query(newQuery,function(err, results){
										if (err)
											throw ("new process insert "+err);
									});
								}
								j+=1;
							}
						});
				}
			});
		}
	}
	if('cpu' === page)
	{
		console.log('in cpu page');
	}
	res.end("Data captured successfully");
}