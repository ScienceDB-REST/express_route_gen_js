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
