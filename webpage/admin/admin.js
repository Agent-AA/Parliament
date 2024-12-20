let timePaused = false;
let affTotalSpeeches = 0;
let affLastSpeaker = "None";
let affSpeechTime = "0:00";
let negTotalSpeeches = 0;
let negLastSpeaker = "None";
let negSpeechTime = "0:00";
let questionCount = 0;
let lastQuestioner = "None";
let speakerPrecedence = [];
let speakerRecency = [];
let questionPrecedence = [];
let questionRecency = [];
let affQueue = [];
let negQueue = [];
let questionQueue = [];

// The quintessential update function that the admin page uses to control the server
function sendUpdate() {
    const data = {
        "motion" : $("#motion-title").val(),
        "speaker" : {
            "name" : $("#speaker-name").val(),
            "disposition" : $("#speaker-disposition").val(),
            "timeRemaining" : $("#speaker-time").val(),
            "number" : $("#speaker-number").val(),
            "timePaused" : timePaused,
            "aff" : {
                "totalSpeeches" : affTotalSpeeches,
                "lastSpeaker" : affLastSpeaker,
                "speechTime" : affSpeechTime
            },
            "neg" : {
                "totalSpeeches" : negTotalSpeeches,
                "lastSpeaker" : negLastSpeaker,
                "speechTime" : negSpeechTime
            },
            "question" : {
                "totalQuestions" : questionCount,
                "lastQuestioner" : lastQuestioner
            },
            "speakingOrder" : {
                "precedence" : speakerPrecedence,
                "recency" : speakerRecency,
                "queue": {
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
    }
}