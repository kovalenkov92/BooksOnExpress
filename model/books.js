var mongoose = require('mongoose');
var bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  isbn: Number,
  year: Number,
  description: String,
  isAwesome: {
    type: Boolean,
    default: false
  }
});
mongoose.model('Book', bookSchema);