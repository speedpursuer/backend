module.exports = function(app) {
  var remotes = app.remotes();
  // modify all returned values
  remotes.after('**', function (ctx, next) {
    ctx.result = {
      data: ctx.result
    };
    next();
  });
};