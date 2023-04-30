const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient

var db, collection;

const url = "mongodb+srv://jbowne24:paige24jb@cluster0.tkio3fd.mongodb.net/firstDemo?retryWrites=true&w=majority";
const dbName = "firstDemo";

app.listen(3000, () => {
  MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
    if (error) {
      throw error;
    }
    db = client.db(dbName);
    console.log("Connected to `" + dbName + "`!");
  });
});

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.static('public'))

app.get('/', (req, res) => {
  db.collection('messages').find().toArray((err, result) => {
    if (err) return console.log(err)
    res.render('index.ejs', {
      messages: result.map(pplMSG => {
        return {
          ...pplMSG,
          reactions: pplMSG.thumbUp + pplMSG.thumbDown
        }
      })
    })
  })
})

app.post('/messages', (req, res) => {
  db.collection('messages').insertOne({ name: req.body.name, msg: req.body.msg, thumbUp: 0, thumbDown: 0 }, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    res.redirect('/')
  })
})

app.put('/messages', (req, res) => {
  console.log(req.body)
  db.collection('messages')
    .findOneAndUpdate({ name: req.body.name, msg: req.body.msg }, {
      $inc: {
        thumbUp: 1
      }
    }, {
      sort: { _id: -1 },
      upsert: true //if record not found then create one 
    }, (err, result) => {
      if (err) return res.send(err)
      res.send(result)
    })
})

app.put('/messages/thumbDown', (req, res) => {
  db.collection('messages')
    .findOneAndUpdate({ name: req.body.name, msg: req.body.msg }, {
      $inc: {
        thumbDown: - 1
      }
    }, {
      sort: { _id: -1 },
      upsert: true  //might be a bug later on that leon leaves and you need to fix
    }, (err, result) => {
      if (err) return res.send(err)
      res.send(result)
    })
})

app.delete('/messages', (req, res) => {
  db.collection('messages').findOneAndDelete({ name: req.body.name, msg: req.body.msg }, (err, result) => {
    if (err) return res.send(500, err)
    res.send('Message deleted!')
  })
})
