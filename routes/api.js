var mongo = require('mongodb');

var Db = mongo.Db,
    Connection = mongo.Connection,
    Server = mongo.Server,
    BSON = mongo.BSONPure,
    ObjectID = mongo.ObjectID;

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('blogdb', server, {safe:true});

db.open(function(err, db) {
  if(!err) {
    console.log('Connected to "blogDB" database.');
    db.collection('posts', {strict:true}, function(err, collection) {
      if(err) {
        console.log("The 'posts' collection doesn't exist. Creating it"
                   + "with sample data.");
        populateDB();
      }
    });
  }
});

// Get
exports.posts = function(req, res) {
  db.collection('posts', function(err, collection) {
    collection.find().toArray(function(err, items) {
      var collected_posts = [];
      items.forEach(function(post) {
        collected_posts.push({
          id: post._id.toHexString(),
          title: post.title,
          text: post.text.substr(0, 50) + '...'
        });
      });
      res.send({
        posts: collected_posts
      });
    });
  });
};

exports.post = function(req, res) {
  var id = req.params.id;
  console.log("Retrieving post: " + id);
  db.collection('posts', function(err, collection) {
    collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
      if (err) {
        res.send({'error':"An error has occurred"});
      } else {
        res.send({
          post: item
        });
      }
    });
  });
};

// Post
exports.addPost = function(req, res) {
  var post = req.body;
  console.log("Adding post: " + JSON.stringify(post));
  db.collection('posts', function(err, collection) {
    collection.insert(post, {safe:true}, function(err, result) {
      if (err) {
        res.send({'error':"An error has occurred"});
      } else {
        console.log("Success: " + JSON.stringify(result[0]));
        res.send(post);
      }
    });
  });
}

// Put
exports.editPost = function(req, res) {
  var id = req.params.id;
  var post = req.body;
  console.log("Updating post: " + id);
  console.log(JSON.stringify(post));
  db.collection('posts', function(err, collection) {
    collection.update({'_id':new BSON.ObjectID(id)}, post, {safe:true}, function(err, result) {
      if (err) {
        console.log("Error updating wine: " + err);
        res.send({'error':"An error has occurred."});
      } else {
        console.log('' + result + ' document(s) updated');
        res.send(post);
      }
    });
  });
}

// Delete
exports.deletePost = function(req, res) {
  var id = req.params.id;
  console.log("Deleting wine " + id);
  db.collection('posts', function(err, collection) {
    collection.remove({'_id':new BSON.ObjectID(id)}, {safe:true}, function(err, result){
      if (err) {
        res.send({'error':"An error has occurred."});
      } else {
        console.log('' + result + ' document(s) deleted.');
        res.send(req.body);
      }
    });
  });
}

// Initial population
var populateDB = function() {
  var posts = [
    {
      title: "blog post uno",
      text: "this is the first blog post. how excited are you? i know i "
            + "am very excited about this blog post. so excited i can't even"
            + "describe my feelings right now. it's just magical."
    },
    {
      title: "blog post dos",
      text: "this is the second blog post. now we're getting somewhere."
            + " i can feel the magic in the air as well as in my veins. "
            + "it's like cocaine, except digital, and not quite as addictive."
    }];

  db.collection('posts', function(err, collection) {
    collection.insert(posts, {safe:true}, function(err, result) {});
  });
};