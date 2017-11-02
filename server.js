// BASE SETUP
// =============================================================================

var express    = require('express');    
var app        = express();                 
var bodyParser = require('body-parser');
var paginate = require('paginate-array');

var port = process.env.PORT || 8080;   

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// DATABASE SETUP
// =============================================================================
var itemsDB;
var dbURL = 'mongodb://meiwey:test1234@itemsdb-shard-00-00-4c3ma.mongodb.net:27017,itemsdb-shard-00-01-4c3ma.mongodb.net:27017,itemsdb-shard-00-02-4c3ma.mongodb.net:27017/test?ssl=true&replicaSet=itemsDB-shard-0&authSource=admin';
const MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

MongoClient.connect(dbURL, (err, database) => {
	if(err) 
		return console.log(err);
	itemsDB = database;
	app.listen(port);
	console.log('Database connected. Listening to ' + port);

})

// OBJECT DEFINITION
// =============================================================================
var Item = function (id, name, price, brand) {
    this.Id = id;
    this.Name = name;
    this.Price = price;
    this.Brand = brand;
}

// API FUNCTIONS
// =============================================================================


// POST API
app.post('/items',(req,res)=>{
	
	var itemToInsert = new Item();
	itemToInsert.Id = req.body.id;
	itemToInsert.Name = req.body.name;
	itemToInsert.Price = req.body.price;
	itemToInsert.Brand = req.body.brand;
	
	itemsDB.collection('items').save(itemToInsert, (err,result)=> {
	if(err)
		return console.log(err);
		
	console.log('Item saved to Database');
	res.redirect('/items');
	})
})

// GET API
app.get('/items',(req,res)=>{
	
	var pageNumber = 1;
	var numItemsPerPage = 30;
	var cursor = itemsDB.collection('items').find();
	cursor.toArray(function(err,results){
		const paginateCollection = paginate(results,pageNumber, numItemsPerPage);
		/*
		var parentObj = {"items":results}
		res.json(parentObj);
		*/
		res.json(paginateCollection);
	});
	
})

// DELETE API
app.delete('/items',(req,res)=>{

	itemsDB.collection('items').findOneAndDelete({ 
			//_id:ObjectId(req.body.id)
			Id : req.body.id
		},
		(err, result) => {
			if (err) return res.send(500, err)
    		else res.send({message: 'Item '+ req.body.id + " is deleted"})
	})
})

// PATCH API
app.patch('/items', (req,res)=> {
  itemsDB.collection('items')
  .findOneAndUpdate({Id: req.body.id}, {
    $set: {
      Name: req.body.name,
      Price: req.body.price,
      Brand : req.body.brand
    }
  }, {
    sort: {_id: -1},
    upsert: true
  }, (err, result) => {
    if (err) return res.send(err)
    res.send(result)
  })
})

