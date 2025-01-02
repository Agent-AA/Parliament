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
  res.send(session);
});

app.post("/update/:sessionID", (req, res) => {
  session = req.body;
  console.log(session);
  utils.save(session);
  res.sendStatus(201);
});

//#endregion

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
