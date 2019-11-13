const path = require('path')
const walkSync = require('walk-sync')

module.exports = walkSync(__dirname, { directories: false })
  .filter((filename) => !filename.startsWith('.'))
  .filter((filename) => filename.endsWith('-route.js'))
  .map((routeFile) => require(path.join(__dirname, routeFile)))
  .reduce((all, routes) => all.concat(routes), [])
