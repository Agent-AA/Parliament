const { NONAME } = require("dns");
const express = require("express");
const path = require("path");
const app = express();
const utils = require("./serverUtils");
const port = 8000;

app.use(express.urlencoded({ extended: true }));

//#region ----- Webpage and static file requests -----
app.use(express.static(path.join(__dirname, "/webpage")));




app.head("/", (req, res) => {
  res.sendStatus(200);
});




app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/webpage/login.html"));
});




app.get("/member", (req, res) => {
  res.sendFile(path.join(__dirname, "/webpage/member.html"));
});




app.get("/president", (req, res) => {
  res.sendFile(path.join(__dirname, "/webpage/president.html"));
});




app.get("/newSession", (req, res) => {
  sessionID = Math.floor(Math.random() * 10000);
  // fill in zeros so 5 digits long
  sessionID = sessionID.toString().padStart(5, "0");

  // initialize the session
  session = {
    id: sessionID,
    createdAt: Date.now(),
    currentMotion: "None",
    currentSpeaker: {
      name: "None",
      disposition: "None",
      time: 0,
      timePaused: true,
      number: 1,
    },
    speaking: {
      queue: {
        aff: ["None"],
        neg: ["None"],
      },
      order: ["None"],
      precedence: [["None", 0]],
      recency: ["None"],
    },
    questioning: {
      queue: ["None"],
      order: ["None"],
      precedence: [["None", 0]],
      recency: ["None"],
    },
    last: {
      aff: {
        speaker: "None",
        time: 0,
      },
      neg: {
        speaker: "None",
        time: 0,
      },
      questioner: "None",
    },
    total: {
      aff: 0,
      neg: 0,
      questions: 0,
    },
  };

  utils.save(session);
  res.send(session);
});




app.get("/session/:sessionID", (req, res) => {
  session = utils.read(req.params.sessionID);
  console.log(session);
  res.send(session);
});




app.post("/update/:sessionID", (req, res) => {
  session = req.body;
  console.log(session);
  utils.save(session);
  res.sendStatus(201);
});




app.post("/queue/:sessionID", (req, res) => {
  session = utils.read(req.params.sessionID);
  switch (req.body.type) {
    case "aff":
      try {session.speaking.queue.aff.includes(req.body.name)} catch (err) {session.speaking.queue.aff = ["None"]}
      if (!session.speaking.queue.aff.includes(req.body.name)) {
        session.speaking.queue.aff.push(req.body.name);
      } 
      utils.sortQueue(session.speaking.queue.aff, "aff");
      break;
    case "neg":
      try {session.speaking.queue.neg.includes(req.body.name)} catch (err) {session.speaking.queue.neg = ["None"]}
      if (!session.speaking.queue.neg.includes(req.body.name)) {
        session.speaking.queue.neg.push(req.body.name);
      } 
      utils.sortQueue(session.speaking.queue.neg, "neg");
      break;
    case "question":
      try {session.questioning.queue.includes(req.body.name)} catch (err) {session.questioning.queue = ["None"]}
      if (!session.questioning.queue.includes(req.body.name)) {
        session.questioning.queue.push(req.body.name)
      } 
      utils.sortQueue(session.questioning.queue, "question");
      break;
  }

  utils.save(session);
  res.sendStatus(201);
});




app.post("/unqueue/:sessionID", (req, res) => {
  session = utils.read(req.params.sessionID);
  console.log(req.body.name);
  switch (req.body.type) {
    case "aff":
      try {session.speaking.queue.aff.includes(req.body.name)} catch (err) {session.speaking.queue.aff = ["None"]}
      session.speaking.queue.aff = session.speaking.queue.aff.filter((item) => item != req.body.name);
      break;
    case "neg":
      try {session.speaking.queue.neg.includes(req.body.name)} catch (err) {session.speaking.queue.neg = ["None"]}
      session.speaking.queue.neg = session.speaking.queue.neg.filter((item) => item != req.body.name);
      break;
    case "question":
      try {session.questioning.queue.includes(req.body.name)} catch (err) {session.questioning.queue = ["None"]}
      session.questioning.queue = session.questioning.queue.filter((item) => item != req.body.name);
      break;
  }

  utils.save(session);
  res.sendStatus(201);
});

//#endregion

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
