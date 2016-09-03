module.exports = function(Post) {
	Post.getCommentQty = function(id_post, cb) {		

		// console.log('id_post is ' + id_post);

		Post.find({where: {id_post: id_post}}, function(err, data) {
			if(err) return cb(err);
			cb(null, data);
		});		
  	};

  	Post.updateCommentQty = function(id_clip, qty, cb) {		

		// console.log('id_clip is ' + id_clip);

		Post.updateAll({id_clip: id_clip}, {comment_quantity: qty}, function(err, info) {
			if (err) return cb(err);
			// console.log('count of record updated = ' + info.count);			
			// cb(null, info.count);
			if (cb) cd();
		});
  	};

  	Post.remoteMethod(
    	'getCommentQty',
    	{
    		accepts: {arg: 'id_post', type: 'string', required: true},
      		http: {path: '/getCommentQty', verb: 'post'},
		    returns: {arg: 'commentQtyList', type: 'Array'}
		}
	);

	Post.remoteMethod(
    	'updateCommentQty',
    	{
    		accepts: [{arg: 'id_clip', type: 'string', required: true}, {arg: 'qty', type: 'number', required: true}],
      		http: {path: '/updateCommentQty', verb: 'post'},
		    returns: {arg: 'recordUpdated', type: 'number'}
		}
	);
};
