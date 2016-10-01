var moment = require('moment');
var LIMIT_PER_MIN = 2;

module.exports = function(Comment) {

	Comment.remoteMethod(
    	'commentsByClip',
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

	Comment.commentsByClip = function(id_clip, limit, skip, cb) {		

		var filter = {where: {id_clip: id_clip}, include: "author", order: "id DESC"};

		if(limit > 0 && skip >= 0) {
			filter.limit = limit;
			filter.skip = skip;
		}

		Comment.find(filter, function(err, data) {			
			if(err) cb(err);
			cb(null, data);
		});		

		var Visit = Comment.app.models.visit;
		Visit.recordVisit("commentViewVisit", id_clip+': '+skip);
  	};

  	Comment.beforeRemote('create', function(context, comment, next) {

		//Only logged-in user can call this function, so userID is always available
		var userID = context.req.accessToken && context.req.accessToken.userId;
		var accountID = context.args.data.id_account;

		Comment.app.models.client.findById(userID)
		.then(function(user) {
			if (user.locked) {
		    	var err = new Error('User disabled');
				err.status = 801;
		      	throw err;
		    }
			return Comment.app.models.account.findById(accountID);
		})
		.then(function(account) {

			if(!account) {
				var err = new Error('Comment account not exists');
				err.status = 401;
		      	throw err;
			}else{
				return true;	
			}			
		})
		.then(function() {

			var min = moment().subtract(1, 'minutes').format("YYYY-MM-DD HH:mm:ss");
		    var max = moment().format("YYYY-MM-DD HH:mm:ss");
		    		    
			var where = {
						   and: [
						     { id_user: userID },					     
						     { time: { between: [min, max] } }
						   ]
						};

			return Comment.count(where);
		})
		.then(function(data) {			

			if(data >= LIMIT_PER_MIN) {
				var Visit = Comment.app.models.visit;
				Visit.recordVisit("commentExceedLimit", "");

				var err = new Error('Exceed limit');
				err.status = 805;
		    	throw err;
			}else{
				context.args.data.id_user = userID;
				context.args.data.time = Date.now();				    
				next();
			}			
		})	
		.catch(function(err){
			return next(err);
		});
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
