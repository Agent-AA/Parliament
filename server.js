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

app.head('/', (req, res) => {
  res.sendStatus(200);
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
      "order" : speakerOrder,
      "queue" : {
        "aff" : affQueue,
        "neg" : negQueue
      }
    },
    "questionOrder" : {
      "precedence" : questionPrecedence,
      "recency" : questionRecency,
      "order" : questionOrder,
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
    speakerOrder = req.body.speakingOrder.ordering;
  } catch (err) {
    speakerOrder = ['None'];
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
    questionOrder = req.body.questionOrder.ordering;
  } catch (err) {
    questionOrder = ['None'];
  }

  try {
    questionQueue = req.body.questionOrder.queue;
  } catch (err) {
    questionQueue = ['None'];
  }
    
  initialized = true;

  res.sendStatus(201)
});

app.post("/queue", (req, res) => {
  console.log(req.body);

  // Because of the server's errors with empty arrays,
  // we have to error check all the queues

  try {
    affQueue.includes(" ");
  } catch (err) {
    affQueue = ['None'];
  }

  try {
    negQueue.includes(" ");
  } catch (err) {
    negQueue = ['None'];
  }
  
  try {
    questionQueue.includes(" ");
  } catch (err) {
    questionQueue = ['None'];
  }

  
  switch (req.body.type) {
    case "aff":
      if (!affQueue.includes(req.body.name)) {
        affQueue.push(req.body.name);
      } break;
    case "neg":
      if (!negQueue.includes(req.body.name)) {
        negQueue.push(req.body.name);
      } break;
    case "question":
      if (!questionQueue.includes(req.body.name)) {
        questionQueue.push(req.body.name);
      }
  }
  res.sendStatus(201);
});

app.post("/unqueue", (req, res) => {
  console.log(req.body);

  // Because of the server's problems with empty array,
  // we have to error check all the queues
  try {
    affQueue.includes(" ");
  } catch (err) {
    affQueue = ['None'];
  }

  try {
    negQueue.includes(" ");
  } catch (err) {
    negQueue = ['None'];
  }

  try {
    questionQueue.includes(" ");
  } catch (err) {
    questionQueue = ['None'];
  }

  
  switch (req.body.type) {
    case "aff":
      if (affQueue.includes(req.body.name)) {
        affQueue.splice(affQueue.indexOf(req.body.name), 1);
      } break;
    case "neg":
      if (negQueue.includes(req.body.name)) {
        negQueue.splice(negQueue.indexOf(req.body.name), 1);
      } break;
    case "question":
      if (questionQueue.includes(req.body.name)) {
        questionQueue.splice(questionQueue.indexOf(req.body.name), 1);
      }
  }

  res.sendStatus(201);
});

setInterval(() => {
  if (timePaused == "false") {
    time++;
  }
}, 1000);


app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});