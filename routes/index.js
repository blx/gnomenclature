
/*
 * GET home page.
 */

module.exports = function(app) {
    app.get('/', function(req, res) {
        res.set('X-Gnome', app.get('gnomenclature-version'));
        res.render('index', { title: 'gnomenclature' });
    });
};