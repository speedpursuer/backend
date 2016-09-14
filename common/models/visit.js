var moment = require('moment');
var LoopBackContext = require('loopback-context');

var DAILY_LIMIT = 4;
var TYPE = {
	shareClip: "shareClip",
};

module.exports = function(Visit) {

	Visit.beforeRemote('shareClip', function(ctx, unused, next) {

		//Only logged-in user can call this function, so userID is always available
		var userID = ctx.req.accessToken && ctx.req.accessToken.userId;
		
		Visit.app.models.client.findById(userID, function(err, user) { 
			if (err) {
		      	return next(err);
		    }		    

		    if (user.locked) {
		    	var err = new Error('User disabled');
				err.status = 801;
		      	return next(err);
		    }		    
		    next();
		});
	});

	Visit.shareClip = function(id_clip, cb) {		

		var ctx = LoopBackContext.getCurrentContext();
  		var accessToken = ctx && ctx.get('accessToken');
  		var userID = accessToken && accessToken.userId;

		if(!userID) {			
			cb(null, false);
		}

		var min = moment({hour: 0, minute: 0, seconds: 0, milliseconds: 0}).format("YYYY-MM-DD HH:mm:ss");
		var max = moment({hour: 23, minute: 59, seconds: 59, milliseconds: 999}).format("YYYY-MM-DD HH:mm:ss");

		var where = {
					   and: [
					     { type: TYPE.shareClip },
					     { id_user: userID },
					     { time: { between: [min, max] } }
					   ]
					};

		Visit.find({where: where})
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
			var newVisit = {
				type: TYPE.shareClip,
				subject: id_clip,
				id_user: userID,
				time: Date.now()
			}
			return Visit.create(newVisit);
		})	
		.then(function(data){
			cb(null, true);
		})	
		.catch(function(err){
			cb(err);
		});	
  	};

	Visit.remoteMethod(
    	'shareClip',
    	{
    		accepts: {arg: 'id_clip', type: 'string', required: true},
      		http: {path: '/shareClip', verb: 'post'},
		    returns: {arg: 'result', type: 'boolean'}
		}
	);
};
