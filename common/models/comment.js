var loopback = require('loopback');

module.exports = function(Comment) {
	// Comment.updateCommentQty = function(id_clip, qty, cb) {		

	// 	console.log('id_clip is ' + id_clip);

	// 	Post.updateAll({id_clip: id_clip}, {comment_quantity: qty}, function(err, info) {
	// 		if (err) return cb(err);
	// 		console.log('count of record updated' + info.count);			
	// 		cb(null, info.count);
	// 	});		
 //  	};

 //  	Comment.remoteMethod(
 //    	'getCommentQty',
 //    	{
 //    		accepts: {arg: 'id_post', type: 'string', required: true},
 //      		http: {path: '/commentQty', verb: 'get'},
	// 	    returns: {arg: 'commentQtyList', type: 'Array'}
	// 	}
	// );

	Comment.beforeRemote('create', function(context, comment, next) {
		// console.log('id_clip of the newly created comment = ' + comment.id_clip);

		// var d = new Date();

		// console.log('local time = ' + d.toLocaleString());

		context.args.data.id_user = context.req.accessToken.userId;

		context.args.data.time = Date.now();		

		next();
	});

	Comment.afterRemote('create', function(context, comment, next) {
		// console.log('id_clip of the newly created comment = ' + comment.id_clip);
		
		Comment.count({id_clip: comment.id_clip}, function(err, count) {
			if (err) return cb(err);
			// console.log('count of comments for the clip (id = ' + comment.id_clip + ') = ' + count);			

			var Post = Comment.app.models.post;

			Post.updateCommentQty(comment.id_clip, count, next());

		});				
	});

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
