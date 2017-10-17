const objectAssign = require('object-assign');
const math = require('mathjs');
const XLSX = require('xlsx');
const Promise = require('bluebird');
const csv_parse = Promise.promisify(require('csv-parse'));

var exports = module.exports = {};

exports.paginate = function(req) {
  selectOpts = {}
  if (req.query.per_page) selectOpts['limit'] = req.query.per_page
  if (req.query.page) {
    os = (req.query.page - 1) * selectOpts['limit']
    selectOpts['offset'] = os
  }
  return selectOpts
}

exports.sort = function(req) {
  sortOpts = {}
  if (req.query.sort) {
    sortOpts = {
      order: [req.query.sort.split('|')]
    }
  }
  return sortOpts
}

exports.search = function(req, strAttributes) {
  selectOpts = {}
  if (req.query.filter) {
    fieldClauses = []
    strAttributes.forEach(function(x) {
      fieldWhereClause = {}
      fieldWhereClause[x] = {
        $like: "%" + req.query.filter + "%"
      }
      fieldClauses = fieldClauses.concat([fieldWhereClause])
    })
    selectOpts['where'] = {
      $or: fieldClauses
    }
  }
  return selectOpts;
}

exports.includeAssociations = function (req) {
  return req.query.excludeAssociations ? {} : {
    include: [{
      all: true
    }]
  }
}

exports.searchPaginate = function(req, strAttributes) {
  return objectAssign(
    exports.search(req, strAttributes),
    exports.sort(req),
    exports.paginate(req),
    exports.includeAssociations(req)
  );
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

exports.parseCsv = function(csvStr, delim, cols) {
    if (!delim) delim = ","
    if (typeof cols === 'undefined') cols = true
    return csv_parse(csvStr, {
      delimiter: delim,
      columns: cols
    })
}

exports.parseXlsx = function(bstr) {
  var workbook = XLSX.read(bstr, {
    type: "binary"
  });
  var sheet_name_list = workbook.SheetNames;
  return XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
}

exports.requestedUrl = function(req) {
  var port = req.app.settings.port || cfg.port;
  return req.protocol + '://' + req.hostname +
    (port == 80 || port == 443 ? '' : ':' + port) +
    req.path;
}

exports.prevNextPageUrl = function(req, isPrevious) {
  baseUrl = exports.requestedUrl(req).replace(/\?.*$/, '')
  query = []
  i = isPrevious ? -1 : 1
  // page
  p = req.query.page == '1' ? null : (req.query.page + i)
  query = query.concat(['page=' + p])
  // per_page
  query = query.concat(['per_page=' + (req.query.per_page || 20)])
  // filter
  if (req.query.filter) query = query.concat(['filter=' + req.query.filter])
  // sort
  if (req.query.sort) query = query.concat(['sort=' + req.query.sort])
  // Append query to base URL
  if (query.length > 0) baseUrl += "?" + query.join("&")
  return baseUrl
}

exports.vueTable = function(req, model, strAttributes) {
  search = exports.search(req, strAttributes)
  searchSortPagIncl = exports.searchPaginate( req, strAttributes )
  queries = []
  queries.push(model.findAll(search))
  queries.push(model.findAll(searchSortPagIncl))
  return Promise.all(queries).then(
    function(res) {
      searchRes = res[0]
      paginatedSearchRes = res[1]
      lastPage = math.ceil(searchRes.length / req.query.per_page)
      return {
        data: paginatedSearchRes,
        total: searchRes.length,
        per_page: req.query.per_page,
        current_page: req.query.page,
        'from': (req.query.page - 1) * req.query.per_page + 1,
        'to': req.query.page * req.query.per_page,
        last_page: lastPage,
        prev_page_url: (req.query.page == 1) ? null : exports.prevNextPageUrl(
          req, true),
        next_page_url: (req.query.page == lastPage) ? null : exports.prevNextPageUrl(
          req, false)
      }
    })
}

