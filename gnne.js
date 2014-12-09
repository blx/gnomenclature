// todo: handle errors (eg. 404)

var express = require('express'),
    path = require('path'),
    compression = require('compression'),
    app = express();

[
    'index',
    'q',
].map(function(routeName) {
    require('./routes/' + routeName)(app);
});

app.use(compression());
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));

if (process.env.NODE_ENV == 'development') {
    var errorhandler = require('errorhandler');
    app.use(errorHandler());
}

app.listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});
