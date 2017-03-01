const objectAssign = require('object-assign');

var exports = module.exports = {};

exports.paginate = function(req) {
    selectOpts = {}
    if (req.query.limit) selectOpts['limit'] = req.query.limit
    if (req.query.offset) selectOpts['offset'] = req.query.offset
    return selectOpts
}

exports.search = function(req, strAttributes) {
    selectOpts = {}
    if (req.query.search) {
        whereClause = {}
        strAttributes.forEach(function(x) {
            whereClause[x] = {
                $like: "%" + req.query.search + "%"
            }
        })
        selectOpts['where'] = whereClause
    }
    return selectOpts;
}

exports.searchPaginate = function(req, strAttributes) {
    return objectAssign(exports.search(req, strAttributes), exports.paginate(req));
}
