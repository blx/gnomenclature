// Gnomenclature Project
// Copyright 2013 Benjamin Cook <bc@benlxc.ca>

/*
 * in:  - GET request for q?n=[..]&conf=[....]
 *      - gn.conf client object is json-stringified into the query params
 *
 * out: - a JSON list of [n] question-answers.
 */


// COME BACK TO THIS LATER ......................
var makedb = function(gndb, _) {
    var mongo = require('mongodb');
    var mongosrv = new mongo.Server("127.0.0.1", 27017, {});
    
    new mongo.Db("gn-ions", mongosrv, {smallfiles:true, safe:false}).open(function (err, client) {
        if (err) throw err;
        
        var cat_ = _(gndb.cations).map(function(ion) {
            return {
                symbol: ion[0],
                names: ion[1],
                valence: ion[2],
                isPolyatomic: ion[3],
                isMultivalent: ion[4]
            };
        });
        var an_ = _(gndb.anions).map(function(ion) {
            return {
                symbol: ion[0],
                names: ion[1],
                valence: ion[2],
                isPolyatomic: ion[3],
                canBeAcidAnion: ion[4]
            };
        });
        
        var cations = new mongo.Collection(client, "cations");
        cations.insert(cat_);
        
        var anions = new mongo.Collection(client, "anions");
        anions.insert(an_);
        
    });
};

module.exports = function(app) {
    app.get('/q', function(req, res) {
        var __ = require('underscore'),
            gndb = require('./q.inc.js'),
            util = require('util');

        String.prototype.startsWith = function(needle) {
            return this.indexOf(needle) === 0;
        };

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
                multivalents: (reqconf.multivalents != 'off' ? reqconf.multivalents : false)
            },
            obj = [],
            pick = function(ar, n) {
                return __.first(__.shuffle(ar), n);
            },
            pickone = function(ar) {
                return pick(ar, 1)[0];
            },
            oneinchance = function(oneinchance) {
                return pickone( __.range(0, oneinchance) ) > 0 ? false : true;
            },
            parens = function(ion) {
                return ( (ion.isradical && ion.n) ? ('(' + ion.symbol + ')') : ion.symbol ) + ion.n;
            },
            balance = function(cat, an, isperoxide) {
                cat.n = Math.abs(an.charge);
                an.n = cat.charge;
                
                if (cat.n == an.n)   cat.n = an.n = '';
                else if (an.n == 1)  an.n = '';
                else if (cat.n == 1) cat.n = '';
                
                if (isperoxide)
                    an.n = an.n ? an.n+1 : 2;
            };

        
        // generate option list for each of the [n] requested questions
        var opts = __.map(__.range(0, conf.n), function() {
            var acid = oneinchance(3) ? conf.acids : false;
            return {
                qmode: (conf.qmode == 'mixed' ? pickone(['ntf', 'ftn']) : conf.qmode),
                acid: acid,
                peroxide: (!acid && conf.peroxides) ? oneinchance(2) : false,
                hydrate: (!acid && conf.hydrates) ? oneinchance(2) : false,
                multivalent: oneinchance(2) ? conf.multivalents : false
            }
        });
        
        // pick ions for each of the [n] requested questions
        var ionsets = __.map(opts, function(opt) {
            var cation, anion;
            
            if (opt.acid) {
                cation = gndb.cations[0];  // hydrogen
                anion = pickone(__.filter(gndb.anions, function(an) {
                    return an[4] ? true : false;
                }));
            }
            else {
                if (opt.multivalent) {
                    cation = pickone(__.filter(gndb.cations, function(cat) {
                        return cat[4] ? true : false;
                    }));
                }
                else {
                    cation = pickone(__.filter(gndb.cations, function(cat) {
                        return cat[4] ? false : true;
                    }));
                }
                                
                if (opt.peroxide)
                    anion = gndb.anions[0];  // oxygen
                else {
                    // avoid the case of "HH2PO4" or "HHCO3"
                    anion = pickone(__.filter(gndb.anions, function(an) {
                        return this[0].startsWith("H") && an[0].startsWith("H") ? false : true;
                    }, cation));
                }
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
            
            balance(cat, an, opt.peroxide);
            
            var q_formula = parens(cat) + parens(an);
            var q_names = [];

            // multivalent modes: if not "mixed", allow only certain types
            if (opt.multivalent == "latin")
                cat.names = [cat.names[1]];
            else if (opt.multivalent == "iupac")
                cat.names = [cat.names[0]];

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
                    if (opt.peroxide) {
                        q_names.push(cat.names[ci] + ' peroxide');
                    }
                    else {
                        for (var ai = 0; ai < __.size(an.names); ai++) {
                            q_names.push(cat.names[ci] + ' ' + an.names[ai]);
                        }
                    }
                }
            }
            q_names = __.uniq(q_names);
            
            // handle hydrates
            if (opt.hydrate) {
                hnum = __.random(1, 10);

                hformula = (hnum > 1 ? hnum : '') + 'H2O';
                hname = gndb.hydrates[hnum];
                
                q_formula += ' ' + hformula;
                q_names = __(q_names).map(function(name) {
                    return name + ' ' + hname;
                });
            }
            
            
            // append to response object
            
            if (opt.qmode == 'ftn') {
                obj.push({
                    'question': q_formula,
                    'answer': q_names
                });
            }
            else if (opt.qmode == 'ntf') {
                obj.push({
                    'question': q_names[__.random(q_names.length - 1)],
                    'answer': [q_formula]
                });
            }
        });
    
        res.json(obj);
    });
};