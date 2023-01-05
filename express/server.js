const express = require ('express');
const serverless = require('serverless-http');
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use('/',(req, res)=>{
    res.render('index');
})

//debug
app.get("/*", (req, res) =>{
  res.sendFile(path.join(__dirname, "../public/index.ejs"))
})

//serverless
const handler = serverless(app);
module.exports.handler = async (event, context) => {
    return await handler(event, context);
};

// app.listen(3000, () => {
//     console.log("Listening on port 3000")
// });