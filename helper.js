var exports = module.exports = {};

exports.paginate = function(req) {
    selectOpts = {}
    if (req.query.limit) selectOpts['limit'] = req.query.limit
    if (req.query.offset) selectOpts['offset'] = req.query.offset
    return selectOpts
}
