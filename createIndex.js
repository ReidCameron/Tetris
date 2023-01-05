const ejs = require('ejs')
const fs = require ('fs')

ejs.renderFile("./views/index.ejs").then( html =>{
    fs.writeFile('./views/index.html', html, function (err) {
        if (err) throw err;
    });
})