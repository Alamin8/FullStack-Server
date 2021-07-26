const dotenv = require('dotenv')
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require("cookie-parser");
const app = express();
const port = process.env.PORT || 5000

// Connection
dotenv.config({path:'./config.env'})
require('./db/connection')

app.use(express.json());
app.use(cookieParser());

//Route
app.use(require('./router/auth'))


app.listen(port, ()=>{
    console.log(`Server is running at port ${port}`);
});


