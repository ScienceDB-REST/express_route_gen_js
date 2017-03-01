var unique = require('array-unique');
var exports = module.exports = {};

// Generate the Javascript using EJS templates
exports.generateJs = function(templateName, options) {
    return ejs.renderFile(exprRouteGenPath + '/views/pages/' + templateName + '.ejs', options, {}, function(err, str) {
        return jsb(str);
    });
}

exports.attributesArray = function(attributesStr) {
    return attributesStr.trim().split(',').map(function(x) {
        return x.trim().split(':')
    });
}

exports.typeAttributes = function(attributesArray) {
    y = {};
    attributesArray.forEach(function(x) {
        if (!y[x[1]]) y[x[1]] = [x[0]]
        else y[x[1]] = y[x[1]].concat([x[0]])
    })
    return y;
}
