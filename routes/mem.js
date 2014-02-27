var connect = require('../public/javascripts/sshConnect')

module.exports = function(app) {
  	app.get('/mem', function(req, res){
  		//res.writeHead(200, { 'Content-Type': 'text/html' });
 		res.render('mem', { title: 'Memory Usage' });

 		var ip = req.query.ip;
 		if(!ip)
 			console.log("IPAddress should not be empty!")
 		else if(ip)
 		{
 			//window.alert("Please provide proper IPAddress");
 			res.write('IPAddress is required');
 			var val = ValidateIPaddress(ip)
 			if(val)
 				connect.sshConnect(app,res,ip,'memory');
 		}

   	});

  	function ValidateIPaddress(ipaddress) 
    {
    	if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress))
    	{
        	return (true)
      	}
      	console.log("You have entered an invalid IP address!")
      	return (false)
 	}
};

