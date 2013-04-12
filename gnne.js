/*
 *    Gnomenclature Project
 *
 *    Copyright 2013 Benjamin Cook <bc@benlxc.ca>
 */

var express = require('express'),
    http = require('http'),
    path = require('path'),
    app = express();

[
    'index',
    'q',
    'about'
].map(function(routeName) {
    require('./routes/' + routeName)(app);
});

app.configure(function(){
    app.use(express.compress());
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.favicon());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
    app.use(express.errorHandler());
});

http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});
