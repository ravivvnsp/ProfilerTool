module.exports = function(app) {
  app.get('/cpu', function(req, res){
    res.render('cpu', { title: 'CPU Usage' })
  });
};