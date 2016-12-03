var moment = require('moment');
var LoopBackContext = require('loopback-context');

var DAILY_LIMIT = 14;
var TYPE = {
	shareClip: "shareClip",
	slowPlay: "slowPlay",
	appStart: "appStart",
};

module.exports = function(Visit) {

	Visit.remoteMethod(
    	'shareClip',
    	{
    		accepts: [
    					{arg: 'id_clip', type: 'string', required: true},
    					{arg: 'id_account', type: 'string', required: true}
    				 ],    		
      		http: {path: '/shareClip', verb: 'post'},
		    returns: {arg: 'result', type: 'boolean'}
		}
	);

	Visit.remoteMethod(
    	'recordVisit',
    	{
    		accepts: [
    					{arg: 'type', type: 'string', required: true},
    					{arg: 'subject', type: 'string', required: true}
    				 ],    		
      		http: {path: '/recordVisit', verb: 'post'},
		    returns: {arg: 'result', type: 'boolean'}
		}
	);

	Visit.remoteMethod(
    	'recordFavorite',
    	{
    		accepts: [
    					{arg: 'id_clip', type: 'string', required: true},
    					{arg: 'id_post', type: 'string', required: true}
    				 ],    		
      		http: {path: '/recordFavorite', verb: 'post'},
		    returns: {arg: 'result', type: 'boolean'}
		}
	);

	Visit.remoteMethod(
    	'recordSlowPlay',
    	{
    		accepts: {arg: 'id_clip', type: 'string', required: true},    		
      		http: {path: '/recordSlowPlay', verb: 'post'},
		    returns: {arg: 'result', type: 'boolean'}
		}
	);

	Visit.remoteMethod(
    	'recordAppStart',
    	{
      		http: {path: '/recordAppStart', verb: 'post'},
		    returns: {arg: 'result', type: 'boolean'}
		}
	);

	Visit.shareClip = function(id_clip, id_account, cb) {		
				
  		var userID = getCurrentUserId();

  		Visit.app.models.client.findById(userID)
		.then(function(user) {
			if (user.locked) {
		    	var err = new Error('User disabled');
				err.status = 801;
		      	throw err;
		    }

			return Visit.app.models.account.findById(id_account);
		})
		.then(function(account) {

			if(!account) {
				var err = new Error('Share account not exists');
				err.status = 401;
		      	throw err;
			}

			return true;
		}).then(function(){
			var min = moment({hour: 0, minute: 0, seconds: 0, milliseconds: 0}).format("YYYY-MM-DD HH:mm:ss");
			var max = moment({hour: 23, minute: 59, seconds: 59, milliseconds: 999}).format("YYYY-MM-DD HH:mm:ss");

			var where = {
						   and: [
						     { type: TYPE.shareClip },
						     { id_user: userID },						     
						     { time: { between: [min, max] } }
						   ]
						};
			return Visit.find({where: where});
		})
		.then(function(data){
			if(data.length > DAILY_LIMIT) {			
				var err = new Error("Excceed share limit");
				err.status = 804;
				throw err;			
			}else {
				return true;
			}			
		})
		.then(function(){			
			return saveVisit(TYPE.shareClip, id_clip, userID, id_account);
		})	
		.then(function(data){
			cb(null, true);
		})	
		.catch(function(err){
			cb(err);
		});	
  	};

  	Visit.recordVisit = function(type, subject, cb) {

		var userID = getCurrentUserId();

		if(!userID || !subject || !type) {
			if(cb) cb(false);
		}

		saveVisit(type, subject, userID, "")
		.then(function(){
			if(cb) cb(null, true);
		})
		.catch(function(err){
			if(cb) cb(err);
		});
	};

	Visit.recordFavorite = function(id_clip, id_post, cb) {

		var userID = getCurrentUserId();

		if(!userID || !id_clip || !id_post) {
			if(cb) cb(false);
		}

		var newFavorite = {
			id_user: userID,
			id_clip: id_clip,
			id_post: id_post,			
			time: Date.now()
		}

		Visit.app.models.favorite.create(newFavorite)
		.then(function(){		
			if(cb) cb(null, true);
		})
		.catch(function(err){
			if(cb) cb(err);
		});
	};

	Visit.recordSlowPlay = function(id_clip, cb) {

		var userID = getCurrentUserId();

		if(!userID || !id_clip) {
			if(cb) cb(false);
		}

		saveVisit(TYPE.slowPlay, id_clip, userID, "")
		.then(function(){		
			if(cb) cb(null, true);
		})
		.catch(function(err){
			if(cb) cb(err);
		});
	};

	Visit.recordAppStart = function(cb) {

		var userID = getCurrentUserId();

		if(!userID) {
			if(cb) cb(false);
		}

		saveVisit(TYPE.appStart, "", userID, "")
		.then(function(){		
			if(cb) cb(null, true);
		})
		.catch(function(err){
			if(cb) cb(err);
		});
	};

  	function getCurrentUserId() {
	    var ctx = LoopBackContext.getCurrentContext();
	    var accessToken = ctx && ctx.get('accessToken');
	    var userId = accessToken && accessToken.userId;
	    return userId;
	}

	function saveVisit(type, subject, userID, accountID) {
		var newVisit = {
			type: type,
			subject: subject,
			id_user: userID,
			id_account: accountID,
			time: Date.now()
		}
		return Visit.create(newVisit);
	}

 //  	Visit.beforeRemote('shareClip', function(ctx, unused, next) {

	// 	//Only logged-in user can call this function, so userID is always available
	// 	var userID = ctx.req.accessToken && ctx.req.accessToken.userId;
		
	// 	Visit.app.models.client.findById(userID, function(err, user) { 
	// 		if (err) {
	// 	      	return next(err);
	// 	    }		    

	// 	    if (user.locked) {
	// 	    	var err = new Error('User disabled');
	// 			err.status = 801;
	// 	      	return next(err);
	// 	    }		    
	// 	    next();
	// 	});		
	// });
};
