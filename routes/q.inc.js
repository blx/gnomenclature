/* 0:  symbol
 * 1:  name(s)
 * 2:  charge
 * 3:  is radical?
 * 4:  can be acid anion?
 */

// NOTE:  IUPAC and Royal Society uses only "sulfur" with f.
//        -> GNNE should accept both spellings but only use F in questions.

// TODO:  fix problems of "hydrogen dihydrogen phosphate" etc.

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
    ['Br',    ['bromide'],                           -1, false, 'bromic'],
    ['Cl',    ['chloride'],                          -1, false, 'chloric'],
    ['F',     ['fluoride'],                          -1, false, 'fluoric'],
    ['I',     ['iodide'],                            -1, false, 'iodic'],
    ['O',     ['oxide'],                             -2, false, false],
    ['S',     ['sulphide', 'sulfide'],               -2, false, true],

    ['BrO',   ['hypobromite'],                       -1, true, true],
    ['BrO2',  ['bromite'],                           -1, true, true],
    ['BrO3',  ['bromate'],                           -1, true, true],
    ['BrO4',  ['perbromate'],                        -1, true, true],
    ['C2O4',  ['oxalate'],                           -2, true, true],
    ['ClO',   ['hypochlorite'],                      -1, true, true],
    ['ClO2',  ['chlorite'],                          -1, true, true],
    ['ClO3',  ['chlorate'],                          -1, true, true],
    ['ClO4',  ['perchlorate'],                       -1, true, true],
    ['CrO4',  ['chromate'],                          -2, true, true],
    ['Cr2O7', ['dichromate'],                        -2, true, true],
    ['CN',    ['cyanide'],                           -1, true, false],
    ['OCN',   ['cyanate'],                           -1, true, false],
    ['SCN',   ['thiocyanate'],                       -1, true, false],
    ['CO3',   ['carbonate'],                         -2, true, true],
    ['HCO3',  ['hydrogen carbonate', 'bicarbonate'], -1, true, false],
    ['IO',    ['hypoiodite'],                        -1, true, true],
    ['IO2',   ['iodite'],                            -1, true, true],
    ['IO3',   ['iodate'],                            -1, true, true],
    ['IO4',   ['periodate'],                         -1, true, true],
    ['MnO4',  ['permanganate'],                      -1, true, false],
    ['NO2',   ['nitrite'],                           -1, true, true],
    ['NO3',   ['nitrate'],                           -1, true, true],
    ['OH',    ['hydroxide'],                         -1, true, false],
    ['PO2',   ['hypophosphite'],                     -3, true, true],
    ['PO3',   ['phosphite'],                         -3, true, true],
    ['PO4',   ['phosphate'],                         -3, true, true],
    ['PO5',   ['perphosphate'],                      -3, true, true],
    ['HPO4',  ['monohydrogen phosphate'],            -2, true, false],
    ['H2PO4', ['dihydrogen phosphate'],              -1, true, false],
    ['SO2',   ['hyposulphite', 'hyposulfite'],       -2, true, true],
    ['SO3',   ['sulphite', 'sulfite'],               -2, true, true],
    ['SO4',   ['sulphate', 'sulfate'],               -2, true, true],
    ['SO5',   ['persulphate', 'persulfate'],         -2, true, true],
    ['S2O3',  ['thiosulphate', 'thiosulfate'],       -2, true, false]
];
