#!/usr/bin/env nodejs

// Required packages:
ejs = require('ejs');
inflection = require('inflection');
fs = require('fs-extra');
path = require('path');
jsb = require('js-beautify').js_beautify;
exprRouteGenPath = __dirname;
funks = require(exprRouteGenPath + '/funks.js');
program = require('commander');


// Parse command-line-arguments and execute:
program
    .arguments('<directory>')
    .option('--name <model_name>', 'The name of the model as provided to \'sequelize model:create\'.')
    .option('--attributes <model_attributes>', 'The model attributes as provided to \'sequelize model:create\'.')
    .action(function(directory) {
        console.log('directory: %s name: %s attributes: %s',
            directory, program.name, program.attributes);
        var opts = {
            name: program.name,
            nameLc: program.name.toLowerCase(),
            namePl: inflection.pluralize(program.name),
            namePlLc: inflection.pluralize(program.name).toLowerCase(),
            attributesArr: funks.attributesArray(program.attributes),
            typeAttributes: funks.typeAttributes(funks.attributesArray(program.attributes))
        }
        var routesDir = directory + '/server/routes';
        var routesFl = routesDir + '/' + opts.nameLc + '_routes.js';
        var routesHelperFl = routesDir + '/' + 'helper.js';
        var contrJs = '';
        // GET requests
        contrJs += '\n' + funks.generateJs('controller_get', opts);
        // POST requests
        contrJs += '\n' + funks.generateJs('controller_post', opts);
        // PUT requests
        contrJs += '\n' + funks.generateJs('controller_put', opts);
        // DELETE requests
        contrJs += '\n' + funks.generateJs('controller_delete', opts);
        // Output:
        fs.writeFile(routesFl, contrJs, function(err) {
            if (err)
                return console.log(err);
            console.log("Wrote routes into '%s'.", routesFl);
        });
        // Copy helper functions into target project to enable editing, if
        // wanted:
        if (!path.existsSync(routesHelperFl))
            fs.copySync(path.resolve(__dirname, 'helper.js'), routesHelperFl);
    }).parse(process.argv);
