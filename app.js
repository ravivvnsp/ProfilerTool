/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
//var user = require('../routes/user');
var http = require('http');
var path = require('path');
var disPage = require('./routes/display');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}
 
app.get('/', routes.index);
require('./routes/mem')(app);
require('./routes/cpu')(app);
require('./routes/perf')(app);
app.get('/reports', disPage.showData);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Profiler server listening on port ' + app.get('port'));
});