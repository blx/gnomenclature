/* 0:  symbol
 * 1:  name(s)
 * 2:  charge
 * 3:  is radical?
 * 4:  can be acid anion?
 */

// NOTE:  IUPAC and Royal Society uses only "sulfur" with f.
//        -> GNNE should accept both spellings but only use F in questions.

// TODO:  fix problems of "hydrogen dihydrogen phosphate" etc.
// TODO:  is 9hydate nona or nova?
// TODO:  is 1hydrate mono or no prefix?

exports.cations = [
    ['H',   ['hydrogen'],              1, false, false],
    ['Li',  ['lithium'],               1, false, false],
    ['Be',  ['beryllium'],             2, false, false],
    ['Na',  ['sodium'],                1, false, false],
    ['Mg',  ['magnesium'],             2, false, false],
    ['Al',  ['aluminum', 'aluminium'], 3, false, false],
    ['K',   ['potassium'],             1, false, false],
    ['Ca',  ['calcium'],               2, false, false],
    ['Ba',  ['barium'],                2, false, false],
    
    ['NH4', ['ammonium'],              1, true, false]
];

exports.anions = [
    ['Br',    ['bromide'],                           -1, false, ['bromic']],
    ['Cl',    ['chloride'],                          -1, false, ['chloric']],
    ['F',     ['fluoride'],                          -1, false, ['fluoric']],
    ['I',     ['iodide'],                            -1, false, ['iodic']],
    ['O',     ['oxide'],                             -2, false, false],
    ['S',     ['sulphide', 'sulfide'],               -2, false, ['sulphuric', 'sulfuric']],

    ['BrO',   ['hypobromite'],                       -1, true, ['hypobromous']],
    ['BrO2',  ['bromite'],                           -1, true, ['bromous']],
    ['BrO3',  ['bromate'],                           -1, true, ['bromic']],
    ['BrO4',  ['perbromate'],                        -1, true, ['perbromic']],
    ['C2O4',  ['oxalate'],                           -2, true, ['oxalic']],
    ['ClO',   ['hypochlorite'],                      -1, true, ['hypochlorous']],
    ['ClO2',  ['chlorite'],                          -1, true, ['chlorous']],
    ['ClO3',  ['chlorate'],                          -1, true, ['chloric']],
    ['ClO4',  ['perchlorate'],                       -1, true, ['perchloric']],
    ['CrO4',  ['chromate'],                          -2, true, ['chromic']],
    ['Cr2O7', ['dichromate'],                        -2, true, ['dichromic']],
    ['CN',    ['cyanide'],                           -1, true, false],
    ['OCN',   ['cyanate'],                           -1, true, false],
    ['SCN',   ['thiocyanate'],                       -1, true, false],
    ['CO3',   ['carbonate'],                         -2, true, ['carbonic']],
    ['HCO3',  ['hydrogen carbonate', 'bicarbonate'], -1, true, false],
    ['IO',    ['hypoiodite'],                        -1, true, ['hypoiodous']],
    ['IO2',   ['iodite'],                            -1, true, ['iodous']],
    ['IO3',   ['iodate'],                            -1, true, ['iodic']],
    ['IO4',   ['periodate'],                         -1, true, ['periodic']],
    ['MnO4',  ['permanganate'],                      -1, true, false],
    ['NO2',   ['nitrite'],                           -1, true, ['nitrous']],
    ['NO3',   ['nitrate'],                           -1, true, ['nitric']],
    ['OH',    ['hydroxide'],                         -1, true, false],
    ['PO2',   ['hypophosphite'],                     -3, true, ['hypophosphorous']],
    ['PO3',   ['phosphite'],                         -3, true, ['phosphorous']],
    ['PO4',   ['phosphate'],                         -3, true, ['phosphoric']],
    ['PO5',   ['perphosphate'],                      -3, true, ['perphosphoric']],
    ['HPO4',  ['monohydrogen phosphate'],            -2, true, false],
    ['H2PO4', ['dihydrogen phosphate'],              -1, true, false],
    ['SO2',   ['hyposulphite', 'hyposulfite'],       -2, true, ['hyposulphurous', 'hyposulfurous']],
    ['SO3',   ['sulphite', 'sulfite'],               -2, true, ['sulphurous', 'sulfurous']],
    ['SO4',   ['sulphate', 'sulfate'],               -2, true, ['sulphuric', 'sulfuric']],
    ['SO5',   ['persulphate', 'persulfate'],         -2, true, ['persulphuric', 'persulfuric']],
    ['S2O3',  ['thiosulphate', 'thiosulfate'],       -2, true, false]
];

exports.hydrates = {
    1: 'hydrate',
    2: 'dihydrate',
    3: 'trihydrate',
    4: 'tetrahydrate',
    5: 'pentahydrate',
    6: 'hexahydrate',
    7: 'heptahydrate',
    8: 'octahydrate',
    9: 'nonahydrate',
    10: 'decahydrate'
};
