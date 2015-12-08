var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

router.use(bodyParser.urlencoded({extended:true}));
router.use(methodOverride(function(req,res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body){
    var method = req.body._method
    delete req.body._method
    return method
  }
}))

router.route('/')
  .get(function(req,res,next) {
    mongoose.model('Book').find({}, function(err,books) {
      if(err){
        return console.error(err);
      }else{
        res.format({
          html: function() {
            res.render('books/index', {
              title: 'Bookshelf',
              'books': books
            });
          },
          json: function() {
            res.json(books);
          }
        })
      }
    })
  })
  .post(function(req,res) {
    mongoose.model('Book').create({
      title: req.body.title,
      author: req.body.author,
      isbn: req.body.isbn,
      year: req.body.year,
      description: req.body.description,
      isAwesome: req.body.isAwesome
    }, function(err,book) {
      if (err) {
        res.send('couldn\'t create a book')
      } else {
        console.log('POST creating new book: ' + book);
        res.format({
          html: function() {
            res.location('books');
            res.redirect('/books');
          },
          json: function() {
            res.json(book);
          }
        })
      }
    })
  })

router.get('/new', function(req,res) {
  res.render('books/new', {title: 'Add new book'});
});

router.param('id', function(req, res, next, id) {
  mongoose.model('Book').findById(id, function (err, book) {
    if (err) {
      console.log(id + ' was not found');
      res.status(404)
      var err = new Error('Not Found');
      err.status = 404;
      res.format({
        html: function(){
          next(err);
         },
        json: function(){
          res.json({message : err.status  + ' ' + err});
         }
      });
    } else {
      req.id = id;
      next(); 
    } 
  });
});

router.route('/:id')
  .get(function(req, res) {
    mongoose.model('Book').findById(req.id, function (err, book) {
      if (err) {
      console.log('GET Error: There was a problem retrieving: ' + err);
      } else {
      console.log('GET Retrieving ID: ' + book._id);
      res.format({
        html: function(){
          res.render('books/show', {
          "book" : book
          });
        },
        json: function(){
          res.json(book);
        }
      });
      }
    });
  });

router.get('/:id/edit', function(req, res) {
  mongoose.model('Book').findById(req.id, function (err, book) {
    if (err) {
      console.log('GET Error: There was a problem retrieving: ' + err);
    } else {
      console.log('GET Retrieving ID: ' + book._id);
      res.format({
        html: function(){
             res.render('books/edit', {
              title: 'book' + book._id,
              "book": book
            });
         },
        json: function(){
             res.json(book);
         }
      });
    }
  });
});

router.put('/:id/edit', function(req, res) {
  mongoose.model('Book').findById(req.id, function (err, book) {
    book.update({
      title: req.body.title,
      author: req.body.author,
      isbn: req.body.isbn,
      year: req.body.year,
      description: req.body.description,
      isAwesome: req.body.isAwesome
    }, function (err, bookID) {
      if (err) {
        res.send("There was a problem updating the information to the database: " + err);
      } else {
        res.format({
          html: function(){
            res.redirect("/books/" + book._id);
          },
          json: function(){
            res.json(book);
          }
        });
       }
    })
  });
});

router.delete('/:id/edit', function (req, res){
  mongoose.model('Book').findById(req.id, function (err, book) {
    if (err) {
      return console.error(err);
    } else {
      book.remove(function (err, book) {
        if (err) {
          return console.error(err);
        } else {
          console.log('DELETE removing ID: ' + book._id);
          res.format({
            html: function(){
              res.redirect("/books");
            },
            json: function(){
              res.json({message : 'deleted',
                item : book
              });
            }
          });
        }
      });
    }
  });
});

module.exports = router;