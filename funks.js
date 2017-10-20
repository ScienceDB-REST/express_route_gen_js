var unique = require('array-unique');
var exports = module.exports = {};

// Generate the controller Javascript using EJS templates
exports.generateJs = function(templateName, options) {
  return ejs.renderFile(exprRouteGenPath + '/views/pages/' + templateName +
    '.ejs', options, {},
    function(err, str) {
      return jsb(str);
    });
}

// Parse input 'attributes' argument into array of arrays:
// [ [ 'name':'string' ], [ 'is_human':'boolean' ] ]
exports.attributesArray = function(attributesStr) {
  return attributesStr.trim().split(/[\s,]+/).map(function(x) {
    return x.trim().split(':')
  });
}

// Collect attributes into a map with keys the attributes' types and values the
// attributes' names: { 'string': [ 'name', 'last_name' ], 'boolean': [
// 'is_human' ] }
exports.typeAttributes = function(attributesArray, hasId) {
  y = {};
  attributesArray.forEach(function(x) {
    if (!y[x[1]]) y[x[1]] = [x[0]]
    else y[x[1]] = y[x[1]].concat([x[0]])
  })

  if(hasId){
    y.string.push('id')
  }

  return y;
}
