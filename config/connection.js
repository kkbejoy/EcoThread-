const  MongoClient  = require("mongodb").MongoClient;
const state={
    db:null
}
module.exports.connect=function (done) 
{
  
    const uri="mongodb://0.0.0.0:27017";
    const database='ecomproject'
   
    MongoClient.connect(uri,{ useNewUrlParser: true,useUnifiedTopology:true},(err,data)=>
    {
        if(err)
        {
            return done(err)
        }
        else{
            state.db=data.db(database)
        }
    })
done()
}
module.exports.get=function()
{
    return state.db
}
    



