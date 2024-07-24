const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(`mongodb+srv://yerragollavenkatasekhar:ESTOE1GeRDLdXnto@cluster0.e29epjh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`, ()=> {
  console.log('connected to mongodb')
})
