// Gnomenclature
// Copyright 2013-2015 Benjamin Cook <b@bencook.ca>

/*
 * in:  - GET request for q?n=[..]&conf=[....]
 *      - gn.conf client object is json-stringified into the query params
 *
 * out: - a JSON list of [n] question-answers.
 */

var R = require('ramda')

// Return ~random int in [low, high)
function random(low, high) {
    if (typeof high === 'undefined') {
        high = low
        low = 0
    }
    return Math.floor(Math.random() * (high - low)) + low
}

function pickone(xs) {
    return xs[random(xs.length)]
}

function oneinchance(chance) {
    return random(chance) == 0
}


// 1 in x chance of...
CHANCEOF = R.mapObj(R.partial(R.partial, oneinchance), {
    acid: 3,
    multivalent: 2,
    peroxide: 2,
    hydrate: 2
})

function isHydrogen(ion) {
    return ion.symbol === 'H'
}


function makeQuestionConfig(conf) {
    var acid = conf.acids && CHANCEOF.acid()
    return {
        qmode: conf.qmode == 'mixed' ? pickone(['ntf', 'ftn']) : conf.qmode,
        acid: acid,
        peroxide: !acid && conf.peroxides && CHANCEOF.peroxide(),
        hydrate: !acid && conf.hydrates && CHANCEOF.hydrate(),
        multivalent: conf.multivalents && CHANCEOF.multivalent()
    }
}

function pickIons(db, opt) {
    var cation, anion, hydrate = null

    if (opt.acid) {
        cation = db.hydrogen
        anion = pickone(db.anions.filter(R.prop('acidanionnames')))
    }
    else {
        var filterfn = opt.multivalent ? R.filter : R.reject
        cation = pickone(filterfn(R.prop('ismultivalent'),
                                  db.cations))

        anion = opt.peroxide ? db.oxide
                               // avoid the case of "HH2PO4" or "HHCO3"
                             : isHydrogen(cation) ? pickone(R.reject(isHydrogen, db.anions))
                                                  : pickone(db.anions)
    }

    if (opt.hydrate) {
        var n = random(1, 10+1)

        hydrate = {
            name: db.hydrates[n],
            formula: (n > 1 ? n : '') + 'H2O'
        }
    }

    return {
        cat: cation,
        an: anion,
        hydrate: hydrate,
        opt: opt
    }
}

function balance(cat, an, isperoxide) {
    cat.n = Math.abs(an.charge)
    an.n = cat.charge
    
    if (cat.n == an.n)   cat.n = an.n = ''
    else if (an.n == 1)  an.n = ''
    else if (cat.n == 1) cat.n = ''
    
    if (isperoxide)
        an.n = an.n ? an.n+1 : 2
}

function parenthesize(ion) {
    return ( (ion.isradical && ion.n) ? ('(' + ion.symbol + ')') : ion.symbol ) + ion.n
}

function applyAcid(an, q) {
    q.formula += '(aq)'

    q.names = an.acidanionnames.map(function(name) {
        return (an.isradical ? '' : 'hydro') + name + ' acid'
    })
}

function applyHydrate(hydrate, q) {
    q.formula += ' ' + hydrate.formula
    q.names = q.names.map(function(fname) { return fname + ' ' + hydrate.name })
}

function assembleQuestion(ionset) {
    var cat = ionset.cat,
        an  = ionset.an,
        opt = ionset.opt,
        hydrate = ionset.hydrate

    balance(cat, an, opt.peroxide)

    var q = {
        formula: parenthesize(cat) + parenthesize(an),
        names: []
    }

    // multivalent modes: if not "mixed", allow only certain types
    if (opt.multivalent == 'latin')
        cat.names = [cat.names[1]]
    else if (opt.multivalent == 'iupac')
        cat.names = [cat.names[0]]

    if (opt.acid) {
        applyAcid(an, q)
    }
    else if (opt.peroxide) {
        q.names = cat.names.map(function(cation) {
            return cation + ' peroxide'
        })
    }
    else {
        q.names = R.xprod(cat.names, an.names).map(function(names) {
            return names.join(' ')
        })
    }

    q.names = R.uniq(q.names)  // TODO necessary??

    if (opt.hydrate) applyHydrate(hydrate, q)

    return {
        question: opt.qmode == 'ftn' ? q.formula
                                     : pickone(q.names),
        answer:   opt.qmode == 'ftn' ? q.names
                                     : [q.formula]
    }
}



module.exports = function(app) {
    var db = require('./gndb.js')

    app.get('/q', function(req, res) {

        var reqconf = JSON.parse(req.query.conf),
            conf = {
                n: (req.query.n &&
                    +req.query.n <= Math.min(db.cations.length,
                                             db.anions.length)) ? +req.query.n : 1,
                qmode: R.contains(reqconf.qmode.toLowerCase(),
                                  ['ftn', 'ntf', 'mixed']) ?
                       reqconf.qmode.toLowerCase() : 'mixed',
                acids: !!reqconf.acids,
                hydrates: !!reqconf.hydrates,
                peroxides: !!reqconf.peroxides,
                multivalents: reqconf.multivalents != 'off' && !!reqconf.multivalents
            }

        // Generate [n] question configs,
        // then pick ions for each question,
        // then generate the questions themselves.
        
        res.json(R.map(R.pipe(makeQuestionConfig,
                              R.partial(pickIons, db),
                              assembleQuestion),
                       R.repeat(conf, conf.n)))
    })
}
