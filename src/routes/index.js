const fs = require('fs');

let routes = [];

// read the dir, excluding the index file, and add each to the routes array
fs.readdirSync(__dirname)
  .filter(file => file != 'index.js')
  .forEach(file => {

    routes = routes.concat(require(`./${file}`))

  });

module.exports = routes;