var Parser = require('./lib/parser');

Lib = new Parser();
Lib.Parser = Parser;
Lib.Defaults = require('./lib/defaults');

module.exports = Lib;
