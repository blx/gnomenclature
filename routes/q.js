
/*
 * in:  - GET request for q?conf=[....]
 *      - gn.conf client object is json-stringified into the query params
 *
 * out: - a JSON list of question-answers.
 */

module.exports = function(app) {
    app.get('/q', function(req, res) {
        var __ = require('underscore'),
            iondb = require('./q.inc.js');

        var conf = JSON.parse(req.query.conf),
            num = (req.query.n &&
                   req.query.n <= iondb.cations.length &&
                   req.query.n <= iondb.anions.length) ? parseInt(req.query.n) : 1,
            qmode = (conf.qmode &&
                     __.contains(['ftn', 'ntf', 'mixed'], conf.qmode.toLowerCase())) ?
                     conf.qmode.toLowerCase() : 'mixed',
            obj = [],
            pick = function(z) {return __.chain(z).shuffle().first(num).value();},
            parens = function(radc, n) {return ((radc[3] && n) ? '(' + radc[0] + ')' : radc[0]) + n;};
    
        /* acids:
    
        - pick H and an anion
        - balance charges same as before (cation always = 1 now)
        - if anion is non-radical, q_name = "hydro" + anion[5 new field] + " acid"
        - if anion is radical, q_name = anion[5 new field] + " acid"
    
         */
    
        __.each(__.zip(pick(iondb.cations), pick(iondb.anions)), function(ar) {
            var cat = ar[0], an = ar[1];
            var a = cat[2], c = Math.abs(an[2]);
        
            if (a === c)      a = c = '';
            else if (a === 1) a = '';
            else if (c === 1) c = '';
        
            var q_formula = parens(cat, c) + parens(an, a);
            /*
            var q_name = __.map((__.isArray(an[1]) ? an[1] : [an[1]]), function(an) {
                    return cat[1] + ' ' + an;
                });*/
        
            var q_name = [],
                ran  = an[1],
                rcat = cat[1];
        
            for (var rcat_i = 0; rcat_i < __.size(rcat); rcat_i++) {
                for (var ran_i = 0; ran_i < __.size(ran); ran_i++) {
                    q_name = __.union(q_name, rcat[rcat_i] + ' ' + ran[ran_i]);
                }
            }

            var current_mode = (qmode === 'mixed' ? ['ftn', 'ntf'][__.random(1)] : qmode);
        
            if (current_mode === 'ftn') {
                obj.push({
                    'question': q_formula,
                    'answer': q_name
                });
            }
            else if (current_mode === 'ntf') {
                obj.push({
                    'question': q_name[__.random(q_name.length - 1)],
                    'answer': [q_formula]
                });
            }
        });
    
        res.json(obj);
    });
};