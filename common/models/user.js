module.exports = function(User) {	

	User.beforeRemote('create', function(context, user, next) {
		// console.log('id_clip of the newly created comment = ' + comment.id_clip);	

		var username = context.args.data.username;

		// console.log('username of req = ' + username);		
		
		User.find({where: {username: username}}, function(err, data) {
			if(err) {
				next(err);
			}else if(data.length > 0) {
				// console.log('data is fetched');
				next(new Error('The username has been registered'));
			}else {
				next();
			}
		});			
	});

	User.afterRemote('create', function(context, user, next) {
		// console.log('after create');

		var login = {
			username: user.username,
			password: context.args.data.password
		};

		// console.log('user is ' + JSON.stringify(login));

		var result = context.result;

		User.login(login, function(err, token) {
			if(err) {
				next(err);
			}else{
				// console.log('token = ' + token);
				result.token = token.id;
				next();
			}			
		});
	});
};
