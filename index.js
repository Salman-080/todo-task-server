const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Task management system running");
})

app.listen(port, () => {
  console.log(`app running on port: ${port}`);
})

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pcelgh9.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    const taskCollection = client.db("TaskDB").collection("tasksCollection");
    const userCollection = client.db("TaskDB").collection("usersCollection");

    app.post("/tasksData", async (req, res) => {
      const taskData = req.body;

      console.log(taskData);
      
      const result = await taskCollection.insertOne(taskData);

      res.send(result);
    })

    app.get("/getAllTasks/:email", async (req, res) => {
      const email = req.params.email;
      const query = {
        userEmail: email
      }
      const result = await taskCollection.find(query).toArray();
      res.send(result);
    })

    // delete task

    app.delete("/taskDelete/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: new ObjectId(id) };

      const result = await taskCollection.deleteOne(query);
      res.send(result);
    })

    //update status

    app.patch("/updateStatus/:id/:status", async (req, res) => {
      const id = req.params.id;
      const status = req.params.status;
      const query = {
        _id: new ObjectId(id)
      }

      const updateDoc = {
        $set: {
          status: status
        }
      }
      const result = await taskCollection.updateOne(query, updateDoc);
      res.send(result);
    })

    //updating task info

    app.get("/updateTask/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: new ObjectId(id) };

      const result = await taskCollection.findOne(query);
      res.send(result);
    })

    // do update task

    app.put("/DoUpdateTasksData/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      console.log(id);

      const query = { _id: new ObjectId(id) };

      const updateDoc = {
        $set: {
          taskTitle: data.taskTitle,
          deadLine: data.deadLine,
          taskDescription: data.taskDescription,
          priority: data.priority
        }
      }

      console.log(updateDoc);

      const result = await taskCollection.updateOne(query, updateDoc);

      res.send(result);
    })

    // post userCollection

    app.post("/userData", async(req,res)=>{
      const userInfo= req.body;

      const result= await userCollection.insertOne(userInfo);

      res.send(result);
    })

    //get User Info

    app.get("/getAllUserInfo/:email", async(req,res)=>{
      const email= req.params.email;
      console.log(email)
      const query={userEmail: email};
      
      const result= await userCollection.findOne(query);

      res.send(result);
    })

    //update my profile

    app.patch("/upDatingMyProfileData/:email", async(req,res)=>{
      const email= req.params.email;
      const myProfileDatas= req.body;
      const query={userEmail: email};
      const updateDoc={
        $set: {
          userName: myProfileDatas?.name,
        }
      }
      const result= await userCollection.updateOne(query,updateDoc);
      res.send(result);
    })
    // await client.connect();
    // // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
