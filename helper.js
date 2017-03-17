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


exports.modelCsvExample = function(model, discardAttrs) {
  return exports.filterModelAttributesForCsv(model,
    discardAttrs).then(function(x) {
    csvHeader = []
    csvExmplRow = []
    x.forEach(function(i) {
      csvStr = i.data_type
      if (i.is_nullable.toLowerCase() === 'false' || i.is_nullable.toLowerCase() ===
        'no' || i.is_nullable === 0)
        csvStr += ",required"
      if (i.column_default)
        csvStr += ",default:" + i.column_default
      csvHeader = csvHeader.concat([i.column_name])
      csvExmplRow = csvExmplRow.concat([csvStr])
    })
    return [csvHeader, csvExmplRow]
  })
}

exports.csvRowToMap = function(csvHeader, csvRow) {
  csvMap = {}
  for (var i = 0, len = csvHeader.length; i < len; i++) {
    csvMap[csvHeader[i]] = csvRow[i]
  }
  return csvMap
}

exports.parseCsv = function(csvStr) {
  csvRows = csvStr.split(/\n|\r/)
  csvHeader = csvRows[0].split(/,/)
  csvMaps = []
  for (var i = 1, len = csvRows.length; i < len; i++) {
    csvMaps = csvMaps.concat([exports.csvRowToMap(csvHeader, csvRows[i].split(
      /,/))])
  }
  return csvMaps
}
