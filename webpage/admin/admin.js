let timePaused = true;
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

// TODO queues and ordering don't load properly when the admin page is reloaded.

// If we accidentally close our browser and need to retrieve our data, we can do so here.
$(document).ready(() => {
    $.get("/data", (data) => {
        if (data.initialized) {
            $("#motion-title").text(data.motion);
            $("#speaker-name").text(data.speaker.name);
            $("#speaker-disposition").text(data.speaker.disposition);
            $("#speaker-time").text(data.speaker.timeRemaining);
            timePaused = data.speaker.timePaused;

            $("#speaker-number").text(data.speaker.number,);

            $("#aff-count").text(data.aff.totalSpeeches);
            $("#aff-last").text(
                data.aff.lastSpeaker +
                    " (" +
                    data.aff.speechTime +
                    ")",
            );
            $("aff-queue").empty();
            for (
                let i = 0;
                i < data.speakingOrder.queue.aff.length;
                i++
            ) {
                $("#aff-queue").append(
                    "<li>" + data.speakingOrder.queue.aff[i] + "</li>",
                );
            }

            $("#neg-count").text(data.neg.totalSpeeches);
            $("#neg-last").text(
                data.neg.lastSpeaker +
                    " (" +
                    data.neg.speechTime +
                    ")",
            );
            $("neg-queue").empty();
            for (
                let i = 0;
                i < data.speakingOrder.queue.neg.length;
                i++
            ) {
                $("#neg-queue").append(
                    "<li>" + data.speakingOrder.queue.neg[i] + "</li>",
                );
            }

            $("#question-count").text(data.question.totalQuestions);
            $("#question-last").text(data.question.lastQuestioner);
            $("question-queue").empty();
            for (let i = 0; i < data.questionOrder.queue.length; i++) {
                $("#question-queue").append(
                    "<li>" + data.questionOrder.queue[i] + "</li>",
                );
            }

            $("#speaker-precedence").empty();
            for (
                let i = 0;
                i < data.speakingOrder.precedence.length;
                i++
            ) {
                $("#speaker-precedence").append(
                    "<li>" +
                        data.speakingOrder.precedence[i][0] +
                        " " +
                        data.speakingOrder.precedence[i][1] +
                        "</li>",
                );
            }

            $("#speaker-recency").empty();
            for (
                let i = 0;
                i < data.speakingOrder.recency.length;
                i++
            ) {
                $("#speaker-recency").append(
                    "<li>" + data.speakingOrder.recency[i][0] + "</li>",
                );
            }

            $("#question-precedence").empty();
            for (
                let i = 0;
                i < data.questionOrder.precedence.length;
                i++
            ) {
                $("#question-precedence").append(
                    "<li>" +
                        data.questionOrder.precedence[i][0] +
                        " " +
                        data.questionOrder.precedence[i][1] +
                        "</li>",
                );
            }

            $("#question-recency").empty();
            for (
                let i = 0;
                i < data.questionOrder.recency.length;
                i++
            ) {
                $("#question-recency").append(
                    "<li>" + data.questionOrder.recency[i][0] + "</li>",
                );
            }
        }
    });
});

// The calibrate function takes the text on the dashboard, parses it, and stores it locally so it can be
// send to the server.
function calibrate() {
    timePaused = $("#pause-button").hasClass("selected");
    affTotalSpeeches = $("#aff-count").text();
    affLastSpeaker = $("#aff-last").text().split(" ")[0];
    affSpeechTime = $("#aff-last").text().split(" ")[1].slice(1, -1);
    negTotalSpeeches = $("#neg-count").text();
    negLastSpeaker = $("#neg-last").text().split(" ")[0];
    negSpeechTime = $("#neg-last").text().split(" ")[1].slice(1, -1);
    questionCount = $("#question-count").text();
    lastQuestioner = $("#question-last").text();

    affQueue = [];
    $("#aff-queue li").each((index, element) => {
        affQueue.push(element.innerText);
    });

    negQueue = [];
    $("#neg-queue li").each((index, element) => {
        negQueue.push(element.innerText);
    });

    questionQueue = [];
    $("#question-queue li").each((index, element) => {
        questionQueue.push(element.innerText);
    });

    speakerPrecedence = [];
    $("#speaker-precedence li").each((index, element) => {
        speakerPrecedence.push(element.innerText.split(" "));
    });

    speakerRecency = [];
    $("#speaker-recency li").each((index, element) => {
        speakerRecency.push(element.innerText);
    });

    questionPrecedence = [];
    $("#question-precedence li").each((index, element) => {
        questionPrecedence.push(element.innerText.split(" "));
    });

    questionRecency = [];
    $("#question-recency li").each((index, element) => {
        questionRecency.push(element.innerText);
    });
}

// The quintessential update function sends all of our data to the server.
function sendUpdate() {
    const data = {
        "motion" : $("#motion-title").text(),
        "speaker" : {
            "name" : $("#speaker-name strong").text(),
            "disposition": $("#speaker-disposition").text(),
            "timeRemaining": $("#speaker-time").text(),
            "number": $("#speaker-number").text(),
            "timePaused": timePaused 
        },
        "aff": {
            "totalSpeeches": affTotalSpeeches,
            "lastSpeaker": affLastSpeaker,
            "speechTime": affSpeechTime,
        },
        "neg": {
            "totalSpeeches": negTotalSpeeches,
            "lastSpeaker": negLastSpeaker,
                "speechTime": negSpeechTime,
        },
        "question": {
            "totalQuestions": questionCount,
            "lastQuestioner": lastQuestioner,
        },
        "speakingOrder": {
            "precedence": speakerPrecedence,
            "recency": speakerRecency,
            "queue": {
                "aff": affQueue,
                "neg": negQueue,
            },
        },
        "questionOrder": {
            "precedence": questionPrecedence,
            "recency": questionRecency,
            "queue": questionQueue,
        },
    };
    console.log(data);
    $.post("/update", data);
}

// When I press ctrl + u, I want to call the calibrate() and then sendUpdate() functions.
$("#update-motion-button").click(() => {
    calibrate();
    sendUpdate();
});
