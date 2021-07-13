const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const objectId = require("mongodb").ObjectID;
   
const app = express();
const jsonParser = express.json();
 
const mongoClient = new MongoClient('mongodb://localhost:27017/', { useUnifiedTopology: true });

let dbClient;

app.use(express.static('public'));
 
mongoClient.connect(function(err, client){
    if(err) return console.log(err);
    dbClient = client;
    app.locals.collection = client.db('todos').collection('todo');;
    app.listen(3000, function(){
        console.log('http://localhost:3000');
    });
});

app.get("/api/todos", function(req, res) {  

    const collection = app.locals.collection;
    collection.find().toArray(function(err, data){         
        if(err) return res.send('Error!');
        res.send(data)
    });     
});

app.post("/api/todos", jsonParser, function (req, res) {    

    if(!req.body) return res.sendStatus(400);   
    const description = req.body.description;
    const date = req.body.date;
    const todo = {description: description, date: date, completed: false}; 
    const collection = req.app.locals.collection;
    collection.insertOne(todo, function(err, result){               
        if(err) return console.log(err);
        // task.time = new objectId(task._id).getTimestamp().getTime()
        res.json(todo);
    });
});

app.delete("/api/todos", jsonParser, function(req, res){
    
    if(req.body.id){
        const id = new objectId(req.body.id);
        const collection = req.app.locals.collection;
        collection.findOneAndDelete({_id: id}, function(err, result){               
            if(err) return console.log(err);    
            res.send(result.value);
        });
    } else {
        const collection = req.app.locals.collection;
        collection.deleteMany({}, function(err, result){
            if(err) return console.log(err);    
            res.end();
        });
    }
});

app.put("/api/todos", jsonParser, function(req, res){
        
    const id = new objectId(req.body.id);
    const completed = req.body.completed;
    const collection = req.app.locals.collection;
    collection.updateOne(
        {_id: id},
        { $set: {completed: completed}},
        (err, result)=>{
            if(err) return console.log(err);   
            res.json({
                _id: id,
                completed: completed,
            });
        }
    );
    
})

process.on("SIGINT", () => {
    dbClient.close();
    process.exit();
});

