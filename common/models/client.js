module.exports = function(Client) {

	function convertClient(platform, openID) {
		var uid = platform + '-' + openID;

		var client = {
			email: uid + '@cliplay.com',
			password: uid,
		}

		return client;
	}

  	Client.register = function(platform, openID, name, avatar, cb) {		

		var client = convertClient(platform, openID);

		Client.find({where: {platform: platform, openID: openID}})
		.then(function(data) {
			var now = Date.now();

			if(data.length > 0) {									
				return Client.updateAll(
					{email: client.email}, 
					{
						name: name,
						avatar: avatar,
						lastUpdated: now
					}
				);									
			}else {				
				return Client.create({
					platform: platform, 
					openID: openID, 
					email: client.email, 
					password: client.password,
					name: name,
					avatar: avatar,
					created: now,
					lastUpdated: now					
				});				
			}
		})
		.then(function(info) {			

			var login = {
				email: client.email,
				password: client.password
			};

			return Client.login(login);
		})
		.then(function(token) {
			cb(null, token.id);
		})		
		.catch(function(err) {
			cb(err);
		});		
  	};

  	Client.remoteMethod(
    	'register',
    	{
    		accepts: [
    					{arg: 'platform', type: 'string', required: true},
    					{arg: 'openID', type: 'string', required: true},
    					{arg: 'name', type: 'string', required: true},
    					{arg: 'avatar', type: 'string'},
    				 ],
      		http: {path: '/register', verb: 'post'},
		    returns: {arg: 'accesstoken', type: 'string'}
		}
	);

 //  	function login(client, cb) {

	// 	function doLogin(login, cb) {
	// 		Client.login(login, function(err, token) {
	// 			if(err) {
	// 				// console.log('login err = ' + err);
	// 				cb(null, "");
	// 			}else {
	// 				// console.log('token = ' + token.id);
	// 				cb(null, token.id);
	// 			}			
	// 		});
	// 	}

	// 	var login = {
	// 		email: client.email,
	// 		password: client.password
	// 	};

	// 	// console.log('login is ' + JSON.stringify(login));

	// 	if(client.id) {

	// 		// console.log('AccessTokens exsiting, destroyAll');

	// 		var AccessToken = Client.app.models.AccessToken;

	// 		AccessToken.destroyAll({
	// 			userId: client.id
	// 		}, function(err, info) {
	// 			if(err) console.log('login err = ' + err);
	// 			// console.log(info.count + ' of AccessTokens destroyed');
	// 			doLogin(login, cb);
	// 		});
	// 	}else {
	// 		doLogin(login, cb)
	// 	}
	// }

	// function updateClient(email, name, avatar) {
	// 	Client.updateAll(
	// 		{email: email}, 
	// 		{
	// 			name: name,
	// 			avatar: avatar,
	// 			lastUpdated: Date.now()
	// 		}, 
	// 		function(err, info) {
	// 	    	// if(!err) console.log(info.count + " records updated");
	// 		}
	// 	);
	// }

	// Client.register_ = function(platform, openID, name, avatar, cb) {		

	// 	// console.log('registerring client');

	// 	var client = convertClient(platform, openID);		

	// 	// return cb(null);

	// 	Client.find({where: {platform: platform, openID: openID}}, function(err, data) {

	// 		// console.log('finding client');

	// 		if(err) {
	// 			// console.log('err finding client = ' + err);
	// 			return cb(err);
	// 		}else if(data.length > 0) {	
	// 			// console.log('user exsiting, going to login directly');			
	// 			updateClient(client.email, name, avatar);
	// 			// console.log('exsiting user ID = ' + data[0].id);		
	// 			client.id = data[0].id;
	// 			login(client, cb);
	// 		}else {
	// 			var time = Date.now();

	// 			Client.create({
	// 				platform: platform, 
	// 				openID: openID, 
	// 				email: client.email, 
	// 				password: client.password,
	// 				name: name,
	// 				avatar: avatar,
	// 				created: time,
	// 				lastUpdated: time,
	// 				status: 'active'
	// 			}, function(err, newClient) {
	// 				if (err) throw err;
	// 				// console.log('created clients:', newClient);
	// 				login(client, cb);
	// 			});
	// 		}
	// 	});	
 //  	};
};
