
/*
 * GET home page.
 */

/*module.exports = function(app) {
  app.get('/', function(req, res){
    res.render('index', { title: 'Profiler' })
  });
};*/

exports.index = function(req, res){
  res.render('index', { title: 'Profiler Tool' });
};