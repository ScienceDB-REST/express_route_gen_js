# express_route_gen_js
Provides commands to auto-generate CRUD routes for models with Expressjs. This is Ruby-on-Rails or SailsJS like controller scaffolding. See [this blog](http://mherman.org/blog/2015/10/22/node-postgres-sequelize/#.WDcA0qIrLVr) for more details.

## Usage:

```
express_route_gen . --name Todo --attributes 'title:string, complete:boolean' [--acl n]
```

Writes file `server/routes/todo_routes.js` with the standard routes for 
* GET
* POST
* PUT
* DELETE
requests.

Help from the command line:
```
Usage: express_route_gen [options] <directory>

  Options:

    -h, --help                       output usage information
    --name <model_name>              The name of the model as provided to 'sequelize model:create'.
    --attributes <model_attributes>  The model attributes as provided to 'sequelize model:create'.
    --acl <number_of_path_components n>  If and only if this argument is provided the snippet "acl.middleware(n)" will be used to provide authorization guards with the package "acl".
```
## Adjust your `ExpressJS` routes

```
// Required packages:
// - Some are _not_ defined as local variables in order to enable required
// files to use these imports:
express = require('express');
models = require('../models/index');
helper = require(__dirname + '/helper.js');
router = express.Router();
var glob = require('glob'),
    path = require('path');


// Base Route:
router.get('/', function(req, res, next) {
    res.render('index', {
        title: 'Express'
    });
});


// Include model specific routes:
glob.sync(__dirname + '/*_routes.js').forEach(function(file) {
    console.log('Requiring model specific routes from \'%s\'', file);
    require(path.resolve(file));
});


// Exports:
module.exports = router;
```
