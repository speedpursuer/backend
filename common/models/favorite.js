var request = require('request');

module.exports = function(Favorite) {
	Favorite.remoteMethod(
    	'convertSQLtoCouch',
    	{    		
      		http: {path: '/convertSQLtoCouch', verb: 'post'},
		    returns: {arg: 'result', type: 'boolean'}
		}
	);

	Favorite.remoteMethod(
    	'test',
    	{    		
      		http: {path: '/test', verb: 'post'},
		    returns: {arg: 'result', type: 'boolean'}
		}
	);

	Favorite.remoteMethod(
    	'remove',
    	{    		
      		http: {path: '/remove', verb: 'post'},
		    returns: {arg: 'result', type: 'boolean'}
		}
	);

	Favorite.remove = function(cb) {
		var serverURL = 'http://localhost:4984/cliplay_user_data/';
		var docID = 'favorite_' + uuid;
		var uri = serverURL + docID;
		var auth = {
			    		'user': 'cliplay_user',
			    		'pass': 'Cliplay_nba'			   
				   };

		request({
		    method: 'PUT',
		    uri: uri,
		    multipart: [
			    {
			    	'content-type': 'application/json',
			        body: JSON.stringify(favorite)						  
			    }
		    ],
		    auth: auth},
		  	function (error, response, body) {
		    	if (error) {
		      		return console.error('upload failed:', error);
		    	}
			}
		);
	};

	Favorite.convertSQLtoCouch = function(cb) {
		var dataSource = Favorite.app.datasources.accountDS;		

		var string = "SELECT client.uuid, favorite.id_clip " +
					 "FROM favorite " +
					 "LEFT JOIN client " +
					 "ON favorite.id_user = client.id " +
					 "where favorite.id_user <> 1 " +
					 "group by favorite.id_user, favorite.id_clip " +
					 "order by favorite.id_user asc, max(favorite.time) desc"
				     // "group by post.id_post, post.id_clip, post.id";

		dataSource.connector.execute(string, null, function(err, result){			
			if(err) return cb(err);		
			// console.error('result:', result.length);
			
			var clips = [];
			var currentUuid = result[0].uuid;
			var limit = result.length;
			// var limit = 50;

			for(var i=0; i<limit; i++) {
				var uuid = result[i].uuid;
				var id_clip = result[i].id_clip;

				if(currentUuid != uuid || i == limit-1) {					
					var doc = {
						owner: "user_" + currentUuid,
						title: "我的最爱",
						_id: "favorite_" + currentUuid,
						type: "favorite",
						clips: clips
					};
					// console.error('doc:', doc);
					// console.error('currentUuid:', currentUuid);
					createDataInCouch(doc, currentUuid);
					clips = [];					
				}

				clips.push(id_clip);
				currentUuid = uuid;

				// console.error('uuid:', result[i].uuid);
				// console.error('id_clip:', result[i].id_clip);
			}
			cb(null, true);
		});
	}

	function createDataInCouch(favorite, uuid) {

		var serverURL = 'http://localhost:4984/cliplay_user_data/';
		var docID = 'favorite_' + uuid;
		var uri = serverURL + docID;
		var auth = {
			    		'user': 'cliplay_user',
			    		'pass': 'Cliplay_nba'			   
				   };

		request({
		    method: 'PUT',
		    uri: uri,
		    multipart: [
			    {
			    	'content-type': 'application/json',
			        body: JSON.stringify(favorite)						  
			    }
		    ],
		    auth: auth},
		  	function (error, response, body) {
		    	if (error) {
		      		return console.error('upload failed:', error);
		    	}
			}
		);
	}

	Favorite.test = function(cb) {

		console.log("test!");

		var serverURL = 'http://localhost:4984/cliplay_user_data/';
		var docID = 'favorite_b60d692c25674b0e92ab95c0907426eb';
		var uri = serverURL + docID;
		var auth = {
			    		'user': 'cliplay_user',
			    		'pass': 'Cliplay_nba'			   
				   };

		request({
		    method: 'GET',
		    uri: uri,		    
		    auth: auth},
		  	function (error, response, body) {
		    	if (error) {
		    		cb(error);
		      		return console.error('upload failed:', error);
		    	}

		    	var favorite = JSON.parse(body);

		    	console.log("favorite = " + body);

		    	cb(null, true);
			}
		);
	};
};
