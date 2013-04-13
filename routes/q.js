
/*
 * in:  - GET request for q?n=[..]&conf=[....]
 *      - gn.conf client object is json-stringified into the query params
 *
 * out: - a JSON list of [n] question-answers.
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
                peroxides: (reqconf.peroxides || false),
                multivalents: (reqconf.multivalents || false)
            },
            obj = [],
            pick = function(ar, n) {
                return __.first(__.shuffle(ar), n);
            },
            pickone = function(ar) {
                return pick(ar, 1)[0];
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


        // TODO: make acid/hydrate etc. a probability, as in "70% of questions will be acids"
        
        // generate option list for each of the [n] requested questions
        var opts = __.map(__.range(0, conf.n), function() {
            return {
                acid: conf.acids,
                peroxide: conf.peroxides,
                hydrate: conf.hydrates,
                multivalent: conf.multivalents
            }
        });
        
        // pick ions for each of the [n] requested questions
        var ionsets = __.map(opts, function(opt) {
            if (opt.acid) {
                cation = gndb.cations[0];
                anion = pickone(__.filter(gndb.anions, function(an) {
                    return an[4] ? true : false;
                }));
            }
            else if (opt.multivalent) {
                cation = pickone(__.filter(gndb.cations, function(cat) {
                    return cat[4] ? true : false;
                }));
                anion = pickone(gndb.anions);
            }
            else {
                cation = pickone(gndb.cations);
                anion = pickone(gndb.anions);
            }
            
            return {
                cat: {
                    symbol: cation[0],
                    names: cation[1],
                    charge: cation[2],
                    isradical: cation[3],
                    ismultivalent: cation[4]
                },
                an: {
                    symbol: anion[0],
                    names: anion[1],
                    charge: anion[2],
                    isradical: anion[3],
                    acidanionnames: anion[4]
                },
                opt: opt
            }
        });

        // actually generate the [n] requested questions
        __.each(ionsets, function(ar) {
            var cat = ar.cat,
                an = ar.an,
                opt = ar.opt;
            
            balance(cat, an);
            
            var q_formula = parens(cat) + parens(an);
            var q_names = [];

            if (opt.acid) {
                q_formula += '(aq)';
                
                if (!an.isradical) {
                    q_names = __(an.acidanionnames).map(function(name) {
                        return "hydro" + name + " acid";
                    });
                }
                else {
                    q_names = __(an.acidanionnames).map(function(root) {
                        return root + " acid";
                    });
                }
            }
            else {
                for (var ci = 0; ci < __.size(cat.names); ci++) {
                    for (var ai = 0; ai < __.size(an.names); ai++) {
                        var newname = cat.names[ci] + ' ' + an.names[ai];

                        q_names = __.union(q_names, newname);
                    }
                }
            }
            
            // handle hydrates
            if (opt.hydrate && !opt.acid) {
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