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
// On document load, downloads data to to the browser.
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
    postUpdate();
});

// when the "start / stop time button" is clicked, pause or unpause the timer and update server
$("#pause-button").click(() => {
    timePaused = !timePaused;
    postUpdate();
});

// when the "end speech button is clicked," perform some operations
// and then update the server.
$("#end-button").click(() => {
    // Update global variables and html elements
    switch ($("#speaker-disposition").text()) {
        case "Affirmative" :
            affTotalSpeeches++;
            $("#aff-count").text(affTotalSpeeches);
            affLastSpeaker = $("#speaker-name").text();
            affSpeechTime = $("#speaker-time").text();
            $("#aff-last").text(affLastSpeaker + " (" + $("#speaker-time").text() + ")");
            break;
        case "Negative" :
            negTotalSpeeches++;
            $("#neg-count").text(negTotalSpeeches);
            negLastSpeaker = $("#speaker-name").text();
            negSpeechTime = $("#speaker-time").text();
            $("#neg-last").text(negLastSpeaker + " (" + $("#speaker-time").text() + ")");
            break;
        case "Question" :
            questionCount++;
            $("#question-count").text(questionCount);
            lastQuestioner = $("#speaker-name").text();
            $("#question-last").text(lastQuestioner);
            break;
    }

    // Clear the speaker card
    $("#speaker-name").text("None");
    $("#speaker-disposition").text("None");
    $("#speaker-time").text("0:00");
    let nextSpeakerNumber = affTotalSpeeches + 1;
    nextSpeakerNumber += negTotalSpeeches;
    $("#speaker-number").text("Speaker " + nextSpeakerNumber);
    timePaused = true;

    // Post an update to the server.
    postUpdate();
});
//#endregion





//#region ----- Main Functions -----
/**
* <p>In order to keep the admin dashboard intuitive and easy to use, elements are made
* contenteditable, there is not event listener on these objects. Thus, calibration is where 
* the data on the html page is parsed and stored in the javascript code, usually before being posted
* to a server update. This also reorganizes some other things like the queues if they happen to be out of
* order.</p>
*
* <p> Some items are not included in the global variables, and thus do not need to be dealt with in this
* function. These items include variables that can be pulled directly from the html page without
* parsing, like the motion title, speaker, speaker disposition, and speaker number (which can be calculated
* by from the number of previous speeches).</p>
*/
function calibrate() {
    timePaused = $("#pause-button").hasClass("selected");
    affTotalSpeeches = $("#aff-count").text().parseInt();
    affLastSpeaker = $("#aff-last").text().split(" ")[0];
    affSpeechTime = $("#aff-last").text().split(" ")[1].slice(1, -1);
    negTotalSpeeches = $("#neg-count").text().parseInt();
    negLastSpeaker = $("#neg-last").text().split(" ")[0];
    negSpeechTime = $("#neg-last").text().split(" ")[1].slice(1, -1);
    questionCount = $("#question-count").text().parseInt();
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
 * Calibrates and then posts all data to the server.
 */
function postUpdate() {
    calibrate();
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
//#endregion





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