const express = require ('express');
const ejs = require('ejs')
const serverless = require('serverless-http');
const app = express();
const fs = require ('fs')



app.set('view engine', 'ejs');
app.use(express.static('public'));

// ejs.renderFile("./views/index.ejs").then( html =>{
//     fs.writeFile('views/index.html', html, function (err) {
//         if (err) throw err;
//     });
// })

app.use('/',(req, res)=>{
    ejs.renderFile("../views/index.ejs").then( html =>{
        res.send(html)
    })
    // res.sendFile(path.join(__dirname, "../views/index.html"))
    // res.sendFile(path.join(__dirname, "../views/index.ejs"))
    // res.render('index');
})

//debug
// app.get("/*", (req, res) =>{
//   res.sendFile(path.join(__dirname, "../views/index.ejs"))
// })

//serverless
const handler = serverless(app);
module.exports.handler = async (event, context) => {
    return await handler(event, context);
};

// app.listen(3000, () => {
//     console.log("Listening on port 3000")
// });