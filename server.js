const { NONAME } = require('dns');
const express = require('express');
const path = require('path')
const app = express();
const port = 8000;

app.use(express.urlencoded({ extended: true })); 

//#region ----- Webpage and static file requests -----
app.use(express.static(path.join(__dirname, '/webpage/player')));
app.use(express.static(path.join(__dirname, '/webpage/admin')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/webpage/player/index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '/webpage/admin/index.html'));
});
//#endregion

//#region ----- SESSION VARIABLES AND FUNCTIONS -----
let initialized = false;

let motion = "None";

let speaker = "None";
let disposition = "None";
let time = 0;
let timePaused = false;
let speakerCount = 0;

let affQueue = []
let affCount = 0;
let lastAffSpeaker = "None";
let lastAffTime = 0;

let negQueue = [];
let negCount = 0;
let lastNegSpeaker = "None";
let lastNegTime = 0;

let questionQueue = [];
let questionCount = 0;
let lastQuestioner = "None";

let speakerPrecedence = [];
let speakerRecency = [];
let speakerOrder = [];

let questionPrecedence = [];
let questionRecency = [];
let questionOrder = [];

//#region ----- GET and POST Requests -----
// This is the primary update function for representatives' browsers that will be used for live polling
app.get('/data', (req, res) => {
  let data = {
    "initialized" : initialized,
    "motion" : motion,
    "speaker" : {
      "name" : speaker,
      "disposition" : disposition,
      "time" : time,
      "number" : speakerCount,
    },
    "aff" : {
      "totalSpeeches" : affCount,
      "lastSpeaker" : lastAffSpeaker,
      "speechTime" : lastAffTime
    },
    "neg" : {
      "totalSpeeches" : negCount,
      "lastSpeaker" : lastNegSpeaker,
      "speechTime" : lastNegTime,
    },
    "question" : {
      "totalQuestions" : questionCount,
      "lastQuestioner" : lastQuestioner
    },
    "speakingOrder" : {
      "precedence" : speakerPrecedence,
      "recency" : speakerRecency,
      "queue" : {
        "aff" : affQueue,
        "neg" : negQueue
      }
    },
    "questionOrder" : {
      "precedence" : questionPrecedence,
      "recency" : questionRecency,
      "queue" : questionQueue
    }
  }
  console.log(data);
  res.send(data);
});

// The admin page posts updates here
app.post('/update', (req, res) => {
  console.log(req.body);
  motion = req.body.motion;
  speaker = req.body.speaker.name;
  disposition = req.body.speaker.disposition;
  timeLeft = req.body.speaker.time;
  speakerCount = req.body.speaker.number;
  timePaused = req.body.speaker.timePaused;
  affCount = req.body.aff.totalSpeeches;
  lastAffSpeaker = req.body.aff.lastSpeaker;
  lastAffTime = req.body.aff.speechTime;
  negCount = req.body.neg.totalSpeeches;
  lastNegSpeaker = req.body.neg.lastSpeaker;
  lastNegTime = req.body.neg.speechTime;
  questionCount = req.body.question.totalQuestions;
  lastQuestioner = req.body.question.lastQuestioner;
  speakerPrecedence = req.body.speakingOrder.precedence;
  speakerRecency = req.body.speakingOrder.recency;
  speakerOrdering = req.body.speakingOrder.ordering;
  affQueue = req.body.speakingOrder.queue.aff;
  negQueue = req.body.speakingOrder.queue.neg;
  questionPrecedence = req.body.questionOrder.precedence;
  questionRecency = req.body.questionOrder.recency;
  questionOrdering = req.body.questionOrder.ordering;
  questionQueue = req.body.questionOrder.queue;
  
  initialized = true;

  res.sendStatus(201)
});

// Stopwatch - if time is not paused, increment time every second
setInterval(() => {
  if (!timePaused) {
    time++;
  }
}, 1000);


app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});