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



exports.showData = function(req, res)
{
	//table name
	var tab_name = 'memory_usage_'+todayDate;
	var dispQuery = 'select * from '+db+'.'+tab_name;
	client.query(dispQuery,function(err, results, fields){
		res.render('display', {title:'Memory Usage Report', page: "memory",fields: fields,results: results });
	});
}