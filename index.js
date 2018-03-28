// Required packages:
path = require('path');
inflection = require('inflection');
fs = require('fs-extra');
jsb = require('js-beautify').js_beautify;
program = require('commander');
ejs = require('ejs');
funks = require('./funks.js');
exprRouteGenPath = __dirname;


// Parse command-line-arguments and execute:
program
  .arguments('<directory>')
  .option('--name <model_name>',
    'The name of the model as provided to \'sequelize model:create\'.')
  .option('--attributes <model_attributes>',
    'The model attributes as provided to \'sequelize model:create\'.')
  .option('--acl <number_of_path_components n>',
    'If and only if this argument is provided the snippet "acl.middleware(n)" will be used to provide authorization guards with the package "acl".'
  ).parse(process.argv);


// Do the job:

let doIt = async() => {
  var directory = program.args[0];
  console.log('directory: %s name: %s attributes: %s acl: %i',
    directory, program.name, program.attributes, program.acl);
  var opts = {
    name: program.name,
    nameLc: program.name.toLowerCase(),
    namePl: inflection.pluralize(program.name),
    namePlLc: inflection.pluralize(program.name).toLowerCase(),
    attributesArr: funks.attributesArray(program.attributes),
    typeAttributes: funks.typeAttributes(funks.attributesArray(program.attributes)),
    acl: (program.acl || 0)
  }
  var routesDir = directory + '/server/routes';
  var routesFl = routesDir + '/' + opts.nameLc + '_routes.js';
  var routesHelperFl = routesDir + '/' + 'helper.js';
  var contrJs = '';
  // GET requests
  contrJs += '\n' + await funks.generateJs('controller_get', opts);
  // POST requests
  contrJs += '\n' + await funks.generateJs('controller_post', opts);
  // PUT requests
  contrJs += '\n' + await funks.generateJs('controller_put', opts);
  // DELETE requests
  contrJs += '\n' + await funks.generateJs('controller_delete', opts);
  // Output:
  fs.writeFile(routesFl, contrJs, function(err) {
    if (err)
      return console.log(err);
    console.log("Wrote routes into '%s'.", routesFl);
  });
  // Copy helper functions into target project to enable editing, if
  // wanted:
  fs.stat(routesHelperFl, function(err, stat) {
    if (err != null) {
      fs.copySync(path.resolve(__dirname, 'helper.js'), routesHelperFl);
    }
  });
}

doIt()
