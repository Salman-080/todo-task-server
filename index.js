const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const Pool = require("pg").Pool;
require("dotenv").config();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.user,
  host: "localhost",
  database: "todo-task",
  password: process.env.password,
  port: 5432,
});

app.get("/", (req, res) => {
  res.send("Task management system running");
});

app.listen(port, () => {
  console.log(`app running on port: ${port}`);
});

// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pcelgh9.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });
app.post("/userData", async (req, res) => {
  const userInfo = req.body;

  const { userName, userEmail, userImage } = userInfo;
  // console.log(userInfo);

  // const emailExist = "SELECT * FROM userList WHERE useremail = $1";
  const emailExistCheck = await pool.query(
    "SELECT * FROM userList WHERE useremail = $1",
    [userEmail]
  );
  // console.log(emailExistCheck.rows,"check");

  if (emailExistCheck.rows.length > 0) {
    return res.send({ msg: "Email already exists" });
  }

  pool.query(
    "INSERT INTO userList(username, useremail, userimage) VALUES ($1, $2, $3) RETURNING *",
    [userName || null, userEmail || null, userImage || null],
    (err, result) => {
      if (err) {
        // console.log("User Data didn't store", err);
        return res.send({ msg: err });
      }
      res.send({
        msg: "User Data created successfully",
        data: result.rows[0],
      });
      // console.log("user data result: ", result);
    }
  );
});

app.get("/getAllUserInfo/:email", async (req, res) => {
  const email = req.params.email;
  // console.log(email)
  const result = await pool.query(
    "SELECT * FROM userList WHERE useremail = $1",
    [email]
  );

  if (result?.rows?.length == 0) {
    return res.send({});
  }

  res.send(result.rows[0]);
});

app.post("/tasksData", (req, res) => {
  const taskData = req.body;
  console.log(taskData);

  const {
    taskTitle,
    priority,
    deadLine,
    status,
    taskDescription,
    userEmail, // This might be undefined if not sent from frontend
  } = taskData;

  pool.query(
    "INSERT INTO tasklist (tasktitle, priority, deadline, status, taskdescription, useremail) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [taskTitle, priority, deadLine, status, taskDescription, userEmail || null],
    (err, result) => {
      if (err) {
        console.log("Data didn't store", err);
        return res.status(500).json({ msg: err });
      }
      res.send({
        msg: "Data created successfully",
        data: result.rows[0],
      });
      console.log("hi", result.rows);
    }
  );
});

app.get("/getAllTasks/:email", async (req, res) => {
  const email = req.params.email;
  const result = await pool.query("SELECT * FROM tasklist WHERE useremail=$1", [
    email,
  ]);
  // console.log("all task",result);
  if (result?.rows?.length == 0) {
    return res.send([]);
  }
  res.send(result?.rows);
});

    app.patch("/updateStatus/:id/:status", async (req, res) => {
      const id = req.params.id;
      const status = req.params.status;

      const result =await pool.query("UPDATE tasklist SET status=$1 WHERE id=$2 RETURNING *",[status, id]);

      console.log(result.rows);
      // const query = {
      //   _id: new ObjectId(id)
      // }

      // const updateDoc = {
      //   $set: {
      //     status: status
      //   }
      // }
      // const result = await taskCollection.updateOne(query, updateDoc);
      // res.send(result);
    })



// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     const taskCollection = client.db("TaskDB").collection("tasksCollection");
//     const userCollection = client.db("TaskDB").collection("usersCollection");

//     app.post("/tasksData", async (req, res) => {
//       const taskData = req.body;

//       console.log(taskData);

//       const result = await taskCollection.insertOne(taskData);

//       res.send(result);
//     })

//     app.get("/getAllTasks/:email", async (req, res) => {
//       const email = req.params.email;
//       const query = {
//         userEmail: email
//       }
//       const result = await taskCollection.find(query).toArray();
//       res.send(result);
//     })

//     // delete task

//     app.delete("/taskDelete/:id", async (req, res) => {
//       const id = req.params.id;

//       const query = { _id: new ObjectId(id) };

//       const result = await taskCollection.deleteOne(query);
//       res.send(result);
//     })

//     //update status

//     app.patch("/updateStatus/:id/:status", async (req, res) => {
//       const id = req.params.id;
//       const status = req.params.status;
//       const query = {
//         _id: new ObjectId(id)
//       }

//       const updateDoc = {
//         $set: {
//           status: status
//         }
//       }
//       const result = await taskCollection.updateOne(query, updateDoc);
//       res.send(result);
//     })

//     //updating task info

//     app.get("/updateTask/:id", async (req, res) => {
//       const id = req.params.id;

//       const query = { _id: new ObjectId(id) };

//       const result = await taskCollection.findOne(query);
//       res.send(result);
//     })

//     // do update task

//     app.put("/DoUpdateTasksData/:id", async (req, res) => {
//       const id = req.params.id;
//       const data = req.body;
//       console.log(id);

//       const query = { _id: new ObjectId(id) };

//       const updateDoc = {
//         $set: {
//           taskTitle: data.taskTitle,
//           deadLine: data.deadLine,
//           taskDescription: data.taskDescription,
//           priority: data.priority
//         }
//       }

//       console.log(updateDoc);

//       const result = await taskCollection.updateOne(query, updateDoc);

//       res.send(result);
//     })

//     // post userCollection

//     app.post("/userData", async(req,res)=>{
//       const userInfo= req.body;

//       const result= await userCollection.insertOne(userInfo);

//       res.send(result);
//     })

//     //get User Info

//     app.get("/getAllUserInfo/:email", async(req,res)=>{
//       const email= req.params.email;
//       console.log(email)
//       const query={userEmail: email};

//       const result= await userCollection.findOne(query);

//       res.send(result);
//     })

//     //update my profile

//     app.patch("/upDatingMyProfileData/:email", async(req,res)=>{
//       const email= req.params.email;
//       const myProfileDatas= req.body;
//       const query={userEmail: email};
//       const updateDoc={
//         $set: {
//           userName: myProfileDatas?.name,
//         }
//       }
//       const result= await userCollection.updateOne(query,updateDoc);
//       res.send(result);
//     })
//     // await client.connect();
//     // // Send a ping to confirm a successful connection
//     // await client.db("admin").command({ ping: 1 });
//     // console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
//     // Ensures that the client will close when you finish/error
//     // await client.close();
//   }
// }
// run().catch(console.dir);
