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


app.post("/userData", async (req, res) => {
  const userInfo = req.body;

  const { userName, userEmail, userImg } = userInfo;
  // console.log(userInfo);

  // const emailExist = "SELECT * FROM userList WHERE useremail = $1";
  const emailExistCheck = await pool.query(
    "SELECT * FROM userList WHERE useremail = $1",
    [userEmail]
  );
  console.log(emailExistCheck.rows,"check");

  if (emailExistCheck.rows.length > 0) {
    return res.send({ msg: "Email already exists" });
  }
  console.log("user passed data",userInfo);

  pool.query(
    "INSERT INTO userList(username, useremail, userimage) VALUES ($1, $2, $3) RETURNING *",
    [userName || null, userEmail || null, userImg || null],
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

  // console.log("findedsssssss",result.rows[0])

  if (result?.rows?.length == 0) {
    return res.send({});
  }

  res.send(result.rows[0]);
});

app.post("/tasksData", (req, res) => {
  const taskData = req.body;
  // console.log(taskData);

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
        // console.log("Data didn't store", err);
        return res.status(500).json({ msg: err });
      }
      res.send({
        msg: "Data created successfully",
        data: result.rows[0],
      });
      // console.log("hi", result.rows);
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
  const id = parseInt(req.params.id);

  const status = req.params.status;

  const result = await pool.query("UPDATE tasklist SET status=$1 WHERE id=$2", [
    status,
    id,
  ]);

  // console.log(result);
  if (result?.rowCount == 0) {
    return res.send({ msg: "Task not found to update status" });
  }
  res.send(result.rows);
});

app.delete("/taskDelete/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  const result = await pool.query("DELETE FROM tasklist WHERE id=$1", [id]);
  console.log("deletion taskkk", result);
  if (result?.rowCount == 0) {
    // console.log("not node");
    return res.send({ msg: "task deletion failed" });
  }
  res.send({ msg: "deleted" });
});

app.get("/getTaskForUpdate/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  // console.log(id);
  const result = await pool.query("SELECT * FROM tasklist WHERE id=$1", [id]);
  console.log("getdefault", result);

  if (result.rows.length == 0) {
    return res.send({});
  }
  res.send(result.rows[0]);
});

    app.put("/updateTasksData/:id", async (req, res) => {
      const id = parseInt(req.params.id);
      const data = req.body;
      // console.log("update datas list",data);
      const result = await pool.query(
        "UPDATE tasklist SET tasktitle = $1,deadline = $2,taskdescription = $3,priority = $4 WHERE id = $5",
        [data.tasktitle, data.deadline, data.taskdescription, data.priority, id]
      );
      // console.log("updated done",result);

      if(result.rowCount == 0){
        return res.send({msg: "Task Updating Failed"});
      }
      res.send({msg: "Done"});

      
    })
