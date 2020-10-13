'use strict';

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req,res)=>{
  res.json({location: 'Will\'s house'});
});

app.listen(PORT, ()=>{
  console.log(`sever up ${PORT}`);
});

