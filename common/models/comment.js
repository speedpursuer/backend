module.exports = function(Comment) {

	Comment.remoteMethod(
    	'getComments',
    	{
    		accepts: [
    					{arg: 'id_clip', type: 'string', required: true},
    					{arg: 'limit', type: 'number'},
    					{arg: 'skip', type: 'number'}
    				 ],
      		http: {path: '/commentsByClip', verb: 'post'},
		    returns: {arg: 'commentsList', type: 'Array'}
		}
	);

	Comment.getComments = function(id_clip, limit, skip, cb) {		

		var filter = {where: {id_clip: id_clip}, include: "author", order: "id DESC"};

		if(limit > 0 && skip >= 0) {
			filter.limit = limit;
			filter.skip = skip;
		}

		Comment.find(filter, function(err, data) {			
			if(err) cb(err);
			cb(null, data);
		});		
  	};

  	Comment.beforeRemote('create', function(context, comment, next) {

		//Only logged-in user can call this function, so userID is always available
		var userID = context.req.accessToken && context.req.accessToken.userId;

		Comment.app.models.client.findById(userID)
		.then(function(user) {
			if (user.locked) {
		    	var err = new Error('User disabled');
				err.status = 801;
		      	throw err;
		    }

			return Comment.app.models.account.find({where: {id_user: userID, type: "comment"}});
		})
		.then(function(accounts) {

			if(accounts.length == 0) {
				var err = new Error('Comment account not exists');
				err.status = 401;
		      	throw err;
			}

			context.args.data.id_account = accounts[0].id;
			context.args.data.time = Date.now();				    
			next();
		})	
		.catch(function(err){
			return next(err);
		});

		// Comment.app.models.client.findById(userID, function(err, user) { 
		// 	if (err) {
		//       	return next(err);
		//     }		    

		//     if (user.locked) {
		//     	var err = new Error('User disabled');
		// 		err.status = 801;
		//       	return next(err);
		//     }

		//     Comment.app.models.account.find({where: {id_user: userId, type: "comment"}}, function(err, user) {
						    
		// 	    context.args.data.id_account = user[0].id;
		// 		context.args.data.time = Date.now();				    
		// 	    next();
		// 	});
		// });		
	});

 //  	Comment.beforeRemote('create', function(context, comment, next) {

	// 	//Only logged-in user can call this function, so userID is always available
	// 	var userID = context.req.accessToken && context.req.accessToken.userId;
		
	// 	Comment.app.models.client.findById(userID, function(err, user) { 
	// 		if (err) {
	// 	      	return next(err);
	// 	    }		    

	// 	    if (user.locked) {
	// 	    	var err = new Error('User disabled');
	// 			err.status = 801;
	// 	      	return next(err);
	// 	    }
		    
	// 	    context.args.data.id_user = userID;
	// 		context.args.data.time = Date.now();				    
	// 	    next();
	// 	});
	// });
};
