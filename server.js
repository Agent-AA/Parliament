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
let timer;
let timePaused = true;
let speakerCount = 0;

let affQueue = ['None'];
let affCount = 0;
let lastAffSpeaker = "None";
let lastAffTime = 0;

let negQueue = ['None'];
let negCount = 0;
let lastNegSpeaker = "None";
let lastNegTime = 0;

let questionQueue = ['None'];
let questionCount = 0;
let lastQuestioner = "None";

let speakerPrecedence = [['None', 0]];
let speakerRecency = ['None'];
let speakerOrder = ['None'];

let questionPrecedence = [['None', 0]];
let questionRecency = ['None'];
let questionOrder = ['None'];

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
      "timePaused" : timePaused,
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
  console.log(req.body);
  
  motion = req.body.motion;
  speaker = req.body.speaker.name;
  disposition = req.body.speaker.disposition;
  time = req.body.speaker.time;
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

  // deal with timer. Booleans turn into strings when JSONified, so that's how we have to do it here.
  console.log(timePaused)
  if (timePaused == 'false') {
    timer = setInterval(() => {
      time++
    }, 1000);
  } else if (timePaused == 'true') {
    clearInterval(timer);
  }
  
  // For some reason expressJS doesn't like empty arrays and won't render JSON fields with empty arrays, so we have to use try catch statements like this for arrays.
  try {
    speakerPrecedence = req.body.speakingOrder.precedence;
  } catch (err) {
    speakerPrecedence = [['None', 0]];
  }

  try {
    speakerRecency = req.body.speakingOrder.recency;
  } catch (err) {
    speakerRecency = ['None'];
  }

  try {
    speakerOrdering = req.body.speakingOrder.ordering;
  } catch (err) {
    speakerOrdering = ['None'];
  }

  try {
    affQueue = req.body.speakingOrder.queue.aff;
  } catch (err) {
    affQueue = ['None'];
  }

  try {
    negQueue = req.body.speakingOrder.queue.neg;
  } catch (err) {
    negQueue = ['None'];
  }

  try {
    questionPrecedence = req.body.questionOrder.precedence;
  } catch (err) {
    questionPrecedence = [['None', 0]];
  }

  try {
    questionRecency = req.body.questionOrder.recency;
  } catch (err) {
    questionRecency = ['None'];
  }

  try {
    questionOrdering = req.body.questionOrder.ordering;
  } catch (err) {
    questionOrdering = ['None'];
  }

  try {
    questionQueue = req.body.questionOrder.queue;
  } catch (err) {
    questionQueue = ['None'];
  }
    
  initialized = true;

  res.sendStatus(201)
});


app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});