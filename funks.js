var unique = require('array-unique');
const {promisify} = require('util');
const ejsRenderFile = promisify( ejs.renderFile )

// Generate the controller Javascript using EJS templates
module.exports.generateJs = async function(templateName, options) {
  let renderedStr = await ejsRenderFile(exprRouteGenPath + '/views/pages/' +
    templateName +
    '.ejs', options, {})
  let prettyStr = jsb(renderedStr)
  return prettyStr;
}

// Parse input 'attributes' argument into array of arrays:
// [ [ 'name':'string' ], [ 'is_human':'boolean' ] ]
module.exports.attributesArray = function(attributesStr) {
  return attributesStr.trim().split(/[\s,]+/).map(function(x) {
    return x.trim().split(':')
  });
}

// Collect attributes into a map with keys the attributes' types and values the
// attributes' names: { 'string': [ 'name', 'last_name' ], 'boolean': [
// 'is_human' ] }
module.exports.typeAttributes = function(attributesArray) {
  y = {
    string: ['id']
  }
  attributesArray.forEach(function(x) {
    if (!y[x[1]]) y[x[1]] = [x[0]]
    else y[x[1]] = y[x[1]].concat([x[0]])
  })

  return y;
}
