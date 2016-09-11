var loopback = require('loopback');

module.exports = function(Comment) {
	
	Comment.beforeRemote('create', function(context, comment, next) {		

		context.args.data.id_user = context.req.accessToken.userId;
		context.args.data.time = Date.now();		

		next();
	});

	// Comment.afterRemote('create', function(context, comment, next) {
		
	// 	Comment.count({id_clip: comment.id_clip}, function(err, count) {
	// 		if (err) return cb(err);			

	// 		var Post = Comment.app.models.post;

	// 		Post.updateCommentQty(comment.id_clip, count, next());

	// 	});				
	// });

	Comment.getComments = function(id_clip, limit, skip, cb) {		

		// console.log('id_clip is ' + id_clip);

		var filter = {where: {id_clip: id_clip}, include: "author", order: "id DESC"};

		if(limit > 0 && skip >= 0) {
			filter.limit = limit;
			filter.skip = skip;
		}

		Comment.find(filter, function(err, data) {
			if(err) console.log('Err is ' + err);
			// console.log('Data length is ' + data.length);
			// console.log('where is ' + JSON.stringify(filter));
			// console.log('typeof data is ' + typeof(data));
			// response = data;
			cb(null, data);
		});		
  	};

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
};
