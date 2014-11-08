module.exports = {};

var reOptional = module.exports.reOptional = /^(optional|\(\W*optional\W*\)$)/i;

var unitsOfMeasure = module.exports.unitsOfMeasure = {
  tablespoon: ['T', 'Tbs', 'tbs'],
  teaspoon: ['t', 'Tsp', 'tsp'],
  cup: ['C', 'c'],
  pint: ['pt', 'PT', 'Pt'],
  quart: ['QT', 'Qt', 'qt'],
  pinch: [],
  little: [],
  dash: [],
  gallon: ['Gal', 'GAL', 'gal'],
  ounce: ['oz', 'Oz', 'OZ'],
  milliliter: ['ml'],
  liter: ['L', 'l'],
  inch: ['"', 'in', 'In', 'IN'],
  millimeter: ['mm'],
  centimeter: ['cm'],
  whole: [],
  half: [],
  can: [],
  bottle: [],
  large: ['lg', 'LG', 'Lg'],
  'package': ['pkg', 'Pkg', 'PKG'],
  pound: ['lb', 'Lb', 'LB']
};

var fluidicWords = module.exports.fluidicWords = [
  'fluid', 'fl'
];

var reToWords = module.exports.reToWords = / *(to *|- *)/i;

var noiseWords = module.exports.noiseWords = [
  'a', 'of'
];
