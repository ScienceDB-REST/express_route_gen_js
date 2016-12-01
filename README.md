# express_route_gen_js
Provides commands to auto-generate CRUD routes for models with Expressjs

## Usage:

<code>
express_route_gen . --name Todo --attributes 'title:string, complete:boolean'
</code>

Writes file `server/routes/todo_routes.js` with the standard routes for 
* GET
* POST
* PUT
* DELETE
requests.

Help from the command line:
<code>
Usage: express_route_gen [options] <directory>

  Options:

    -h, --help                       output usage information
    --name <model_name>              The name of the model as provided to 'sequelize model:create'.
    --attributes <model_attributes>  The model attributes as provided to 'sequelize model:create'.
</code>
