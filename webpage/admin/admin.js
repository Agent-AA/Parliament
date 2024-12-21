//#region ----- Global Variables -----
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
/**
 * @type {Array<string>}
 * Items with an earlier index have the higher priority; i.e., they are the least recent.
 */
let speakerRecency = [];
let questionPrecedence = [];
/**
 * @type {Array<string>}
 * Items with an earlier index have the higher priority; i.e., they are the least recent.
 */
let questionRecency = [];
let affQueue = [];
let negQueue = [];
let questionQueue = [];
//#endregion






//#region ----- Events -----
// On document load, downloads data to t
$(document).ready(() => {
    $.get("/data", (data) => {
        if (data.initialized) {
            $("#motion-title").text(data.motion);
            $("#speaker-name").text(data.speaker.name);
            $("#speaker-disposition").text(data.speaker.disposition);
            $("#speaker-time").text(data.speaker.timeRemaining);
            timePaused = data.speaker.timePaused;

            $("#speaker-number").text(data.speaker.number,);

            affTotalSpeeches = data.aff.totalSpeeches;
            $("#aff-count").text(data.aff.totalSpeeches);
            affLastSpeaker = data.aff.lastSpeaker;
            $("#aff-last").text(
                data.aff.lastSpeaker +
                    " (" +
                    data.aff.speechTime +
                    ")",
            );

            affQueue = data.speakingOrder.queue.aff;
            $("#aff-queue").empty();
            for (
                let i = 0;
                i < data.speakingOrder.queue.aff.length;
                i++
            ) {
                $("#aff-queue").append(
                    "<li>" + data.speakingOrder.queue.aff[i] + "</li>",
                );
            }

            negTotalSpeeches = data.neg.totalSpeeches;
            $("#neg-count").text(data.neg.totalSpeeches);
            negLastSpeaker = data.neg.lastSpeaker;
            $("#neg-last").text(
                data.neg.lastSpeaker +
                    " (" +
                    data.neg.speechTime +
                    ")",
            );
            negQueue = data.speakingOrder.queue.neg;
            $("#neg-queue").empty();
            for (
                let i = 0;
                i < data.speakingOrder.queue.neg.length;
                i++
            ) {
                $("#neg-queue").append(
                    "<li>" + data.speakingOrder.queue.neg[i] + "</li>",
                );
            }

            questionCount = data.question.totalQuestions;
            $("#question-count").text(data.question.totalQuestions);
            lastQuestioner = data.question.lastQuestioner;
            $("#question-last").text(data.question.lastQuestioner);
            questionQueue = data.questionOrder.queue;
            $("#question-queue").empty();
            for (let i = 0; i < data.questionOrder.queue.length; i++) {
                $("#question-queue").append(
                    "<li>" + data.questionOrder.queue[i] + "</li>",
                );
            }

            speakerPrecedence = data.speakingOrder.precedence;
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

            speakerRecency = data.speakingOrder.recency;
            $("#speaker-recency").empty();
            for (
                let i = 0;
                i < data.speakingOrder.recency.length;
                i++
            ) {
                $("#speaker-recency").append(
                    "<li>" + data.speakingOrder.recency[i] + "</li>",
                );
            }

            questionPrecedence = data.questionOrder.precedence;
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

            questionRecency = data.questionOrder.recency;
            $("#question-recency").empty();
            for (
                let i = 0;
                i < data.questionOrder.recency.length;
                i++
            ) {
                $("#question-recency").append(
                    "<li>" + data.questionOrder.recency[i] + "</li>",
                );
            }
        }
    });
});

// when the "update" button at the top of the page is clicked, update the server
$("#update-motion-button").click(() => {
    calibrate();
    postUpdate();
});
//#endregion




/**
 * Parses all data from the html file and stores them in this file's global variables.
 */
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

    affQueue = parseList("#aff-queue", "", "None");
    neqQueue = parseList("#neg-queue", "", "None");
    questionQueue = parseList("#question-queue", "", "None");

    speakerPrecedence = parseList("#speaker-precedence", " ", "None 0");
    speakerRecency = parseList("#speaker-recency", "", "None");

    questionPrecedence = parseList("#question-precedence", " ", "None 0");
    questionRecency = parseList("#question-recency", "", "None");
}

/**
 * Posts all data to the server.
 */
function postUpdate() {
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





//#region ----- Helper Functions
/**
 * Parses an unordered list element and returns an array of the listed items.
 * 
 * @param {string} elementID the id attribute of the list element
 * @param {string} delimiter a delimiter to split the text of a list item, if necessary.
 * @param {string} placeholder a placeholder text list item to ignore. If no filler, pass "".
 * 
 * @returns {Array<string>} the list of items in the list element
 */
function parseList(elementID, delimiter, placeholder) {
    let list = [];
    $(elementID + " li").each((index, element) => {
        if (element.innerText != placeholder) {
            if (delimiter != "") {
                list.push(element.innerText.split(delimiter));
            } else {
                list.push(element.innerText);
            }
        }
    })

    return list;
}