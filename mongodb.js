const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;
const ObjectID = mongodb.ObjectID;

const connectionURL = "mongodb://127.0.0.1:27017"; //127.0.0.1
const databaseName = "task-manager";

MongoClient.connect(
  connectionURL,
  { useNewUrlParser: true },
  (error, client) => {
    //, { useNewURLParser: true }
    if (error) {
      return console.log("Unable to connect to database");
    }

    const db = client.db(databaseName);

    // db.collection("users")
    //   .deleteMany({
    //     age: 15,
    //   })
    //   .then((result) => {
    //     console.log(result.deletedCount);
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //   });

    db.collection("tasks").deleteOne({
        description: "Learn Websocket"
    }).then((result) => {
        console.log(result)
    }).catch((error)=>{
        console.log(error)
    })

  }
);
