var md5 = require("blueimp-md5");

module.exports = function(Post) {
	
	Post.remoteMethod(
    	'getCommentQty',
    	{
    		accepts: {arg: 'id_post', type: 'string', required: true},
      		http: {path: '/getCommentQty', verb: 'post'},
		    returns: {arg: 'commentQtyList', type: 'array'}
		}
	);

	Post.remoteMethod(
    	'getCommentQtyByClips',
    	{
    		accepts: {arg: 'clips', type: 'array', required: true},
      		http: {path: '/getCommentQtyByClips', verb: 'post'},
		    returns: {arg: 'commentQtyList', type: 'array'}
		}
	);

	Post.remoteMethod(
    	'updatePostClip',
    	{
    		accepts: {arg: 'postData', type: 'array', required: true},
      		http: {path: '/updatePostClip', verb: 'post'},
		    returns: {arg: 'result', type: 'boolean'}
		}
	);
	
	Post.getCommentQty = function(id_post, cb) {		
				
		var dataSource = Post.app.datasources.accountDS;		

		var string = "SELECT post.id_clip, count(comment.id) as comment_quantity " +
					 "FROM post " +
					 "LEFT JOIN comment " +
					 "ON post.id_clip = comment.id_clip " +
					 'where post.id_post = "' + id_post + '" ' +
				     "group by post.id_post, post.id_clip, post.id";

		dataSource.connector.execute(string, null, function(err, result){			
			if(err) return cb(err);			
			cb(null, result);
		}); 
  	};

  	Post.getCommentQtyByClips = function(clips, cb) {		

  		var ids_post = '';

  		for(i in clips) {  		   			
  			ids_post += '"' + clips[i] + '",';  			
  		}

  		ids_post = ids_post.substring(0, ids_post.length - 1);
						
		var dataSource = Post.app.datasources.accountDS;		

		var string = "SELECT post.id_clip, count(comment.id) as comment_quantity " +
					 "FROM post " +
					 "LEFT JOIN comment " +
					 "ON post.id_clip = comment.id_clip " +
					 'where post.id_clip in (' + ids_post + ') ' +
				     "group by post.id_post, post.id_clip, post.id";

		dataSource.connector.execute(string, null, function(err, result){			
			if(err) return cb(err);			
			cb(null, result);
		}); 
  	};

  	Post.updatePostClip = function(postData, cb) {
		  		
		var newData = [];		

		for(i in postData) {

			if(postData[i].deleted) continue;
			
			var postID = postData[i].id;
			var images = postData[i].doc.image;

			for(j in images) {
				var clipID = images[j].url;				

				newData.push({
					id_post: postID, 
					id_clip: clipID,
					key_clip: md5(clipID)
				});
			}
		}

		Post.create(newData, function(err, data) {
			cb(null, true);
		});
  	};

	// 	Post.updatePostClip = function(postData, cb) {

		// var postIDs = [];		
		// var newData = [];
		// var set = {};

		// for(i in postData) {

		// 	if(postData[i].deleted) continue;
			
		// 	var postID = postData[i].id;
		// 	var images = postData[i].doc.image;

		// 	postIDs.push(postID);

		// 	for(j in images) {
		// 		var clipID = images[j].url;

		// 		set[postID + "_" + clipID] = {
		// 			id_post: postID, 
		// 			id_clip: clipID
		// 		};
		// 	}
		// }

		// Post.find({where: {id_post: {inq: postIDs}}})
		// .then(function(data){			
		//  	for(i in data) {				
		// 		set[data[i].id_post + "_" + data[i].id_clip] = data[i];
		// 	}			

		// 	for(i in set) {
		// 		newData.push(set[i]);
		// 	}

		// 	return Post.destroyAll({id_post: {inq: postIDs}});
		// })
		// .then(function(info){			
		// 	return Post.create(newData);
		// })
		// .then(function(models){			
		// 	cb(null, true);
		// })
		// .catch(function(err){
		//   	cb(null, false);
		// });
  // 	};
};
