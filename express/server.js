const express = require ('express');
const serverless = require('serverless-http');
const app = express();
const path = require('path')

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use('/',(req, res)=>{
    res.sendFile(path.join(__dirname, "../views/index.html"))
    // res.render('index');
})

//serverless
const handler = serverless(app);
module.exports.handler = async (event, context) => {
    return await handler(event, context);
};