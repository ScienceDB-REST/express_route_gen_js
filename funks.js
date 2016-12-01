var exports = module.exports = {};

// Functions:
exports.generateJs = function(templateName, options) {
    return ejs.renderFile(exprRouteGenPath + '/views/pages/' + templateName + '.ejs', options, {}, function(err, str) {
        return jsb(str);
    });
}
