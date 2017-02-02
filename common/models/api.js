var request = require('request');
var LoopBackContext = require('loopback-context');

module.exports = function(Api) {
	Api.remoteMethod(
    	'getImageFromWebpage',
    	{
    		accepts: [
    					{arg: 'url', type: 'string', required: true}
    				 ],
      		http: {path: '/getImageFromWebpage', verb: 'post'},
		    returns: [
		    	{arg: 'imageList', type: 'array'},
		    	{arg: 'title', type: 'string'}
		    ]
		}
	);

	Api.getImageFromWebpage = function(url, cb) {

		var userID = getCurrentUserId();

		if(!userID) {
			var err = new Error('User Not Login');
			err.status = 403;
			return cb(err);
		}

		request({
		    method: 'POST',
		    // url: 'http://localhost/image-fetcher-pro/scan.php',
		    url: 'http://121.40.197.226:2333/scan.php',
		    form: {
			    	url: url,
			        weibo: 'false'
			      }
		    },
		  	function (error, response, body) {
		    	if (error) {
		    		return cb(error);		      		
		    	}else{
		    		var content = JSON.parse(body);		    		
		    		var images = content.images;
		    		var title = content.title;
		    		var result = [];

		    		for(i in images) {
		    			var src = images[i].src;

		    			// console.error('src = ', src);	

						if(!isValidSrc(src)) {
							continue;
						}

						result.push(src);		    	
		    		}
		    		cb(null, result, title.substring(0, 15));
		    		// cb(null, result, "");
		    	}
			}
		);

		var Visit = Api.app.models.visit;
		Visit.recordVisit("fetch_clips", url);
  	};

  	function isValidSrc(src) {
  		// if(src.indexOf('gif') !== -1) {
		// 	var position = src.indexOf('gif');		
		// 	var newSrc = src.substr(0, position)+'gif';  
		// 	result.push(newSrc);		
		// }
		if(src.indexOf('icon') !== -1) {
			return false;
		}

		if(src.indexOf('user') !== -1) {
			return false;
		}

  		return true;
  	}

  	function getCurrentUserId() {
	    var ctx = LoopBackContext.getCurrentContext();
	    var accessToken = ctx && ctx.get('accessToken');
	    var userId = accessToken && accessToken.userId;
	    return userId;
	}

	function endsWith(str, suffix) {
	    return str.indexOf(suffix, str.length - suffix.length) !== -1;
	}
};
