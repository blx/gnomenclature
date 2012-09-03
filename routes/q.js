
/*
 * GET a JSON list of question-answers.
 */

exports.q = function(req, res) {
    var __ = require('underscore');

    require('./q.inc.js');

    var num = (req.query.n &&
               req.query.n <= _cations.length &&
               req.query.n <= _anions.length) ? parseInt(req.query.n) : 1,
        obj = [],
        pick = function(z) {return __.chain(z).shuffle().first(num).value();},
        parens = function(radc, n) {return ((radc[3] && n) ? '(' + radc[0] + ')' : radc[0]) + n;};
    
    __.each(__.zip(pick(_cations), pick(_anions)), function(ar) {
        var cat = ar[0], an = ar[1];
        var a = cat[2], c = Math.abs(an[2]);
        
        if (a === c)      a = c = '';
        else if (a === 1) a = '';
        else if (c === 1) c = '';
        
        obj.push({
            'question': parens(cat, c) + parens(an, a),
            
            'answer': __.map((__.isArray(an[1]) ? an[1] : [an[1]]), function(an) {
                return cat[1] + ' ' + an;
            })
        });
    });
    
    res.json(obj);
};