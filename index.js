#!/usr/bin/env nodejs
console.log( "Hello, world!" )

var ejs = require( 'ejs' )
var inflection = require( 'inflection' );

// Parse command-line-arguments:
var program = require('commander');
program
.arguments('<directory>')
.option('--name <model_name>', 'The name of the model as provided to \'sequelize model:create\'.')
.option('--attributes <model_attributes>', 'The model attributes as provided to \'sequelize model:create\'.')
.action(function(directory) {
  console.log('directory: %s name: %s attributes: %s',
      directory, program.name, program.attributes);
  ejs.renderFile( 'views/pages/controller_read.ejs', {
    name: program.name,
    namePl: inflection.pluralize( program.name ),
    attributes: program.attributes
  }, {}, function( err, str ) {
   console.log(str) 
  } )
})
.parse(process.argv);
