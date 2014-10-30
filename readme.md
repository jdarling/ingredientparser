Ingredient Parser
=================

Simple recipe ingredient parser.  Parses a single line of text into a JavaScript
Object that represents the best guess at what the ingredient line should be.

Works in any browser that supports Array.forEach, Array.reduce, and Object.keys.

Why?
====

I'm building a recipe management application and there were no good ingredient
parsers in existence that worked in the browser.  So, I wrote one.

Install
=======

```
npm install ingredientparser
```

How
===

1. Breaks up the input string on whitespace characters (space and tab)
2. Checks for and concatenates numeric or fractional values
3. Checks for optional or (optional)
4. Checks for "to taste"
5. Checks for text in ()'s to find preparation steps
6. Removes all noise words
7. Returns the resulting object

Input Schema
============

```
<amount> <unit> [of] (<prep>) <ingredient> optional|(optional) (<prep>)
```

Usage
=====

```
var ing = require('ingredientparser');
console.log(ing.parse('1 cup brown sugar'));
```

Outputs:

```
{ amount: '1',
  unit: 'Cup',
  name: 'brown sugar' }
```

Tests
=====

```
mocha test
or
npm test
```

Bug Reports
===========

Found a bug, submit a new issue along with a failing test.  If you feel really
nice and want a thank you, submit a pull request to resolve it as well.
