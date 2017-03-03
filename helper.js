const objectAssign = require('object-assign');
var csvWriter = require('csv-write-stream');
var fs = require('fs-extra');

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
  return objectAssign(exports.search(req, strAttributes), exports.paginate(
    req));
}

exports.modelAttributes = function(model) {
  return model.sequelize.query(
    "SELECT column_name, data_type, is_nullable, column_default " +
    "FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '" +
    model.tableName + "'", {
      type: model.sequelize.QueryTypes.SELECT
    }
  )
}

exports.discardModelAttributes = ['createdAt', 'updatedAt']

exports.filterModelAttributesForCsv = function(model, discardAttrs) {
  discardAttrs = discardAttrs || exports.discardModelAttributes
  modelPrimaryKey = model.primaryKeyField
  if (modelPrimaryKey)
    discardAttrs = discardAttrs.concat([modelPrimaryKey])
  return exports.modelAttributes(model).then(function(x) {
    return x.filter(function(i) {
      return discardAttrs.indexOf(i.column_name) < 0
    })
  })
}

exports.modelCsvExample = function(csvFile, model, discardAttrs) {
  return exports.filterModelAttributesForCsv(model,
    discardAttrs).then(function(x) {
    csvMap = {}
    x.forEach(function(i) {
      csvStr = i.data_type
      if (i.is_nullable.toLowerCase() === 'false' || i.is_nullable.toLowerCase() ===
        'no' || i.is_nullable === 0)
          csvStr += ",required"
      if (i.column_default)
        csvStr += ",default:" + i.column_default
      csvMap[i.column_name] = csvStr
    })
    var writer = csvWriter()
    writer.pipe(fs.createWriteStream(csvFile))
    writer.write(csvMap)
    writer.end()
  })
}
