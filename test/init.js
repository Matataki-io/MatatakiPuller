const fs = require('fs')
fs.createReadStream('./config/config.js.example').pipe(fs.createWriteStream('./config/config.js'))
