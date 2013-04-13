
/*
 * in:  - GET request for q?conf=[....]
 *      - gn.conf client object is json-stringified into the query params
 *
 * out: - a JSON list of question-answers.
 */


module.exports = function(app) {
    app.get('/q', function(req, res) {
        var __ = require('underscore'),
            gndb = require('./q.inc.js');

        var reqconf = JSON.parse(req.query.conf),
            conf = {
                n: (req.query.n &&
                    req.query.n <= gndb.cations.length &&
                    req.query.n <= gndb.anions.length) ? parseInt(req.query.n) : 1,
                qmode: (reqconf.qmode &&
                        __.contains(['ftn', 'ntf', 'mixed'], reqconf.qmode.toLowerCase())) ?
                        reqconf.qmode.toLowerCase() : 'mixed',
                acids: (reqconf.acids || false),
                hydrates: (reqconf.hydrates || false),
                peroxides: (reqconf.peroxides || false)
            },
            obj = [],
            pick = function(ar, n) {
                return __.first(__.shuffle(ar), n);
            },
            parens = function(ion) {
                return ( (ion.isradical && ion.n) ? ('(' + ion.symbol + ')') : ion.symbol ) + ion.n;
            },
            balance = function(cat, an) {
                cat.n = Math.abs(an.charge);
                an.n = cat.charge;
            
                if (cat.n == an.n)   cat.n = an.n = '';
                else if (an.n == 1)  an.n = '';
                else if (cat.n == 1) cat.n = '';
            };
    
        /* acids:
    
        - pick H and an anion
        - balance charges same as before (cation always = 1 now)
        - if anion is non-radical, q_name = "hydro" + anion[5 new field] + " acid"
        - if anion is radical, q_name = anion[5 new field] + " acid"
    
         */
    
        __.each(__.zip(pick(gndb.cations, conf.n), pick(gndb.anions, conf.n)), function(ar) {
            var cat = {
                symbol: ar[0][0],
                names: ar[0][1],
                charge: ar[0][2],
                isradical: ar[0][3]
            };
            var an = {
                symbol: ar[1][0],
                names: ar[1][1],
                charge: ar[1][2],
                isradical: ar[1][3],
                acidanionflag: ar[1][4]
            };
            
            // TODO: make acid/hydrate etc. a probability, as in "70% of questions will be acids"
            var opt = {
                acid: conf.acids,
                peroxide: conf.peroxides,
                hydrate: conf.hydrates
            };
            
            balance(cat, an);
            
            var q_formula = parens(cat) + parens(an);

            var q_names = [];
            
            for (var ci = 0; ci < __.size(cat.names); ci++) {
                for (var ai = 0; ai < __.size(an.names); ai++) {
                    var newname = cat.names[ci] + ' ' + an.names[ai];

                    q_names = __.union(q_names, newname);
                }
            }
            
            // handle hydrates
            if (opt.hydrate) {
                hnum = __.random(1, 10);

                hformula = hnum + 'H2O';
                hname = gndb.hydrates[hnum];
                
                q_formula += ' ' + hformula;
                q_names = __(q_names).map(function(name) {
                    return name + ' ' + hname;
                });
            }
            
            
            // append to response object
            
            var current_mode = (conf.qmode == 'mixed' ? ['ftn', 'ntf'][__.random(1)] : conf.qmode);
            
            if (current_mode === 'ftn') {
                obj.push({
                    'question': q_formula,
                    'answer': q_names
                });
            }
            else if (current_mode === 'ntf') {
                obj.push({
                    'question': q_names[__.random(q_names.length - 1)],
                    'answer': [q_formula]
                });
            }
        });
    
        res.json(obj);
    });
};