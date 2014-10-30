(function(module){
  'use strict';
  // Reference http://stackoverflow.com/questions/12413705/parsing-natural-language-ingredient-quantities-for-recipes

  var Defaults = require('./defaults');
  var unitsOfMeasure = Defaults.unitsOfMeasure;
  var noiseWords = Defaults.noiseWords;
  var inflect = require('i')();

  var isNumeric = function(n){
    return !isNaN(parseFloat(n)) && isFinite(n);
  };

  var isFraction = function(n){
    return n.match(/^(\d+\W\d+\/\d+|\d+\/\d+)$/);
  };

  var getNumber = function(s){
    return s.match(/^(\d+\W\d+\/\d+|\d+\/\d+|\d+\.\d+|\d+)/);
  };

  var properCase = function(what){
    if(!what){
      return what;
    }
    return what.replace(/\w\S*/g, function(txt){
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  };

  var Parser = function(opts){
    var options = opts || {};
    var expandedUnits = [];
    var unitsOfMeasure = options.unitsOfMeasure||Defaults.unitsOfMeasure;
    var unitsKeys = Object.keys(unitsOfMeasure);
    var unitsTable = {};
    unitsKeys.forEach(function(key){
      expandedUnits = expandedUnits.concat(unitsOfMeasure[key]);
      unitsOfMeasure[key].forEach(function(alt){
        unitsTable[alt] = key;
      });
    });
    this.options = options;
    this.expandedUnits = expandedUnits;
    this.unitsOfMeasure = unitsOfMeasure;
    this.unitsTable = unitsTable;
  };

  Parser.prototype.isUnitOfMeasure = function(value){
    var val = inflect.singularize(value);
    if(this.unitsOfMeasure[val.toLowerCase()] || this.expandedUnits.indexOf(val) > -1){
      return true;
    }
    return false;
  };

  Parser.prototype.unitExpander = function(unit){
    var val = inflect.singularize(unit);
    val = properCase(this.unitsTable[val.toLowerCase()] || this.unitsTable[val] || val);
    return val;
  };

  Parser.prototype.getNumber = function(from){
    var part = from.shift();
    if(part){
      if(isNumeric(part) || isFraction(part)){
        return (part + ' ' + this.getNumber(from)).trim();
      }
      from.unshift(part);
    }
    return '';
  };


  Parser.prototype.getAmount = function(from){
    var s = from.join(' ');
    var start = getNumber(s);
    if(start){
      s = s.substr(start[0].length);
      var tmp = s.match(this.options.reToWords||Defaults.reToWords);
      if(tmp){
        s = s.substr(tmp[0].length);
        var end = getNumber(s);
        if(end){
          return {
            match: {
              min: start[1],
              max: end[1]
            },
            rest: s.substr(end[0].length).trim().split(' ')
          };
        }
      }
      return {
        match: start[1],
        rest: s.trim().split(' ')
      };
    }
    return false;
  };

  var checkForMatch = function(len, section, within, offset){
    if(within.length-offset<len){
      return false;
    }
    var seg = within.slice(offset, offset+len).join(' ').toLowerCase();
    if(seg===section){
      return offset;
    }
    return checkForMatch(len, section, within, offset+1);
  };

  Parser.prototype.findMatch = function(args){
    var matchList = args.lookFor,
        matchIdx = checkForMatch(matchList.length, matchList.join(' '), args.within, 0);
    if(matchIdx!==false){
      args.within.splice(matchIdx, matchList.length);
    }
    return matchIdx;
  };

  Parser.prototype.getALittle = function(from){
    var idx = this.findMatch({
      lookFor: ['a', 'little'],
      within: from
    });
    return idx===false?false:true;
  };

  Parser.prototype.getByWeight = function(from){
    var idx = this.findMatch({
      lookFor: ['by', 'weight'],
      within: from
    });
    return idx===false?false:true;
  };

  Parser.prototype.getFluidic = function(from){
    var val = from[0].toLowerCase().replace(/\./g, '');
    if((this.options.fluidicWords||Defaults.fluidicWords).indexOf(val)>-1){
      from.shift();
      return true;
    }
    return false;
  };

  Parser.prototype.getUnit = function(from){
    if(this.getALittle(from)){
      return 'a little';
    }
    if(this.isUnitOfMeasure(from[0]||'')){
      return this.unitExpander(from.shift());
    }
    return false;
  };

  Parser.prototype.getOptional = function(from){
    var res = false;
    var reOptional = this.options.reOptional || Defaults.reOptional;
    from.filter(function(val, idx){
      if(reOptional.test(val)){
        res = true;
        from.splice(idx, 1);
      }
    });
    return res;
  };

  Parser.prototype.getToTaste = function(from){
    var idx = this.findMatch({
      lookFor: ['to', 'taste'],
      within: from
    });
    return idx===false?false:true;
  };

  Parser.prototype.removeNoise = function(from){
    var res = false;
    var nw = this.options.noiseWords||noiseWords;
    from.filter(function(val, idx){
      if(nw.indexOf(val.toLowerCase())>-1){
        res = true;
        from.splice(idx, 1);
      }
    });
    return res;
  };

  Parser.prototype.getPrep = function(from){
    var start = false, end;
    var inPrep = false, hasPrep = false;
    var prep = from.forEach(function(item, idx){
      if((!inPrep) && (start === false) && item[0]==='('){
        inPrep = true;
        start = idx;
      }
      if(inPrep && (item.substr(-1)===')')){
        inPrep = false;
        end = idx;
      }
    });
    if(start !== false){
      prep = from.splice(start, end+1).join(' ');
      return prep.substr(-1)===')'?prep.substring(1, prep.length-1):prep.substr(1);
    }
    return false;
  };

  Parser.prototype.parse = function(source){
    var parts = source.split(/[ \t]/);
    var ing = {};
    var val, tmpAmount;
    if(parts[0]==='a'){
      tmpAmount = 1;
      parts.shift();
    }
    if((!tmpAmount) && (val = this.getAmount(parts))){
      ing.amount = val.match;
      parts = val.rest;
    }
    if(this.getFluidic(parts)){
      ing.fluidic = true;
    }
    if(val = this.getUnit(parts)){
      ing.unit = val;
    }
    if(this.getByWeight(parts)){
      ing.byWeight = true;
    }
    if(this.getOptional(parts)){
      ing.optional = true;
    }
    if(this.getToTaste(parts)){
      ing.toTaste = true;
    }
    if(val = this.getPrep(parts)){
      ing.prep = val;
    }
    this.removeNoise(parts);
    ing.name = parts.join(' ');
    if(tmpAmount){
      if(ing.unit!=='Little'){
          ing.amount = tmpAmount+'';
      }
    }
    return ing;
  };

  module.exports = Parser;
})(module);
