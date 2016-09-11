var path = require('path');

var app = require(path.resolve(__dirname, '../server/server'));
var ds = app.datasources.accountDS;

// ds.autoupdate('comment', function(err) {
//   if (err) throw err;
//   ds.disconnect();
// });

ds.autoupdate('post', function(err) {
  if (err) throw err;
  ds.disconnect();
});

// ds.autoupdate('user', function(err) {
//   if (err) throw err;
//   ds.disconnect();
// });

// ds.autoupdate('client', function(err) {
//   if (err) throw err;
//   ds.disconnect();
// });

// ds.autoupdate('AccessToken', function(err) {
//   if (err) throw err;
//   ds.disconnect();
// });

// ds.autoupdate('visit', function(err) {
//   if (err) throw err;
//   ds.disconnect();
// });