const { NONAME } = require('dns');
const express = require('express');
const path = require('path')
const app = express();
const port = 8000;

//#region ----- Webpage and static file requests -----
app.use(express.static(path.join(__dirname, '/webpage/player')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/webpage/player/index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '/webpage/admin/index.html'));
});
//#endregion

//#region ----- SESSION VARIABLES AND FUNCTIONS -----
let currentMotion = "None";

let currentSpeaker = "None";
let disposition = "None";
let timeLeft = "0:00";
let timePaused = false;
let speakerCount = 0;

let affQueue = []
let affCount = 0;
let lastAffSpeaker = "None";
let lastAffTime = "0:00";

let negQueue = [];
let negCount = 0;
let lastNegSpeaker = "None";
let lastNegTime = "0:00";

let questionQueue = [];
let questionCount = 0;
let lastQuestioner = "None";

let speakerPrecedence = [];
let speakerRecency = [];

let questionPrecedence = [];
let questionRecency = [];

//#region ----- GET and POST Requests -----
// This is the primary update function for representatives' browsers that will be used for live polling
app.get('/data', (req, res) => {
  let data = {
    "currentMotion" : currentMotion,
    "speaker" : {
      "name" : currentSpeaker,
      "disposition" : disposition,
      "timeRemaining" : timeLeft,
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

  res.send(data);
});

// The admin page posts updates here
app.post('/update', (req, res) => {
  currentMotion = req.body.motion;
  currentSpeaker = req.body.speaker.name;
  disposition = req.body.speaker.disposition;
  timeLeft = req.body.speaker.timeRemaining;
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
  affQueue = req.body.speakingOrder.queue.aff;
  negQueue = req.body.speakingOrder.queue.neg;
  questionPrecedence = req.body.questionOrder.precedence;
  questionRecency = req.body.questionOrder.recency;
  questionQueue = req.body.questionOrder.queue;
  
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});