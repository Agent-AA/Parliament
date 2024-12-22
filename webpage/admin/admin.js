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
let speakerOrdering = [];
let questionPrecedence = [];
/**
 * @type {Array<string>}
 * Items with an earlier index have the higher priority; i.e., they are the least recent.
 */
let questionRecency = [];
let questionOrdering = [];
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
    // Update global variables
    parseHTML();
    switch ($("#speaker-disposition").text()) {
        case "Affirmative" :
            affTotalSpeeches++;
            affLastSpeaker = $("#speaker-name").text();
            affSpeechTime = $("#speaker-time").text();
            updateOrdering($("#speaker-name").text(), "speaker");
            break;
        case "Negative" :
            negTotalSpeeches++;
            negLastSpeaker = $("#speaker-name").text();
            negSpeechTime = $("#speaker-time").text();
            updateOrdering($("#speaker-name").text(), "speaker");
            break;
        case "Question" :
            questionCount++;
            lastQuestioner = $("#speaker-name").text();
            updateOrdering($("#speaker-name").text(), "question");
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

    // Update HTML
    updateHTML();

    // Post an update to the server.
    postUpdate();
});
//#endregion





//#region ----- Main Functions -----
/**
* <p>In order to keep the admin dashboard intuitive and easy to use, elements are made
* contenteditable, there is not event listener on these objects. Thus, parsing is where 
* the data on the html page is parsed and stored in the javascript code, usually before being posted
* to a server update. This also reorganizes some other things like the queues if they happen to be out of
* order.</p>
*
* <p> Some items are not included in the global variables, and thus do not need to be dealt with in this
* function. These items include variables that can be pulled directly from the html page without
* parsing, like the motion title, speaker, speaker disposition, and speaker number (which can be calculated
* by from the number of previous speeches).</p>
*/
function parseHTML() {
    affTotalSpeeches = parseInt($("#aff-count").text());
    affLastSpeaker = $("#aff-last").text().split(" ")[0];
    affSpeechTime = $("#aff-last").text().split(" ")[1].slice(1, -1);
    negTotalSpeeches = parseInt($("#neg-count").text());
    negLastSpeaker = $("#neg-last").text().split(" ")[0];
    negSpeechTime = $("#neg-last").text().split(" ")[1].slice(1, -1);
    questionCount = parseInt($("#question-count").text());
    lastQuestioner = $("#question-last").text();

    affQueue = parseList("#aff-queue", "", "None");
    neqQueue = parseList("#neg-queue", "", "None");
    questionQueue = parseList("#question-queue", "", "None");

    speakerPrecedence = parseList("#speaker-precedence", " ", "None 0");
    speakerRecency = parseList("#speaker-recency", "", "None");

    questionPrecedence = parseList("#question-precedence", " ", "None 0");
    questionRecency = parseList("#question-recency", "", "None");

    // If speaking precedence, questioning precedence, and questioning recency are empty, fill them in.
    if (speakerPrecedence.length == 0) {
        // every speaker should be on the precedence list with a 0
        speakerRecency.forEach((speaker) => {
            speakerPrecedence.push([speaker, 0]);
        })

        // the questioning recency and precedence should be in the reverse order
        for (let i = speakerRecency.length - 1; i >= 0; i--) {
            questionRecency.push(speakerRecency[i]);
            questionPrecedence.push([speakerRecency[i], 0]);
        }
    }

    speakerOrdering = speakerPrecedence;
    // speakers who have lower numbers come before those with higher numbers
    // and order between speakers with the same number is determine by whoever is more recent (has a lower index on the speakerRecency)
    speakerOrdering.sort((a, b) => {
        let aNumber = parseInt(a[1]);
        let bNumber = parseInt(b[1]);
        if (aNumber != bNumber) {
            return aNumber - bNumber;
        } else {
            return speakerRecency.indexOf(a[0]) - speakerRecency.indexOf(b[0]);
        }
    });

    // same thing with questioning
    questionOrdering = questionPrecedence;
    questionOrdering.sort((a, b) => {
        let aNumber = parseInt(a[1]);
        let bNumber = parseInt(b[1]);
        if (aNumber != bNumber) {
            return aNumber - bNumber;
        } else {
            return questionRecency.indexOf(a[0]) - questionRecency.indexOf(b[0]);
        }
    });

    // Now let's sort affQueue, negQueue, and questionQueue based off of the speakerOrdering and questionOrdering
    affQueue.sort((a, b) => {
        return speakerOrdering.indexOf(a) - speakerOrdering.indexOf(b);
    });

    negQueue.sort((a, b) => {
        return speakerOrdering.indexOf(a) - speakerOrdering.indexOf(b);
    });

    questionQueue.sort((a, b) => {
        return questionOrdering.indexOf(a) - questionOrdering.indexOf(b);
    });
}

/**
 * This does the functional opposite of {@link parseHTML()}. It updates html elements
 * based on the global variables.
 */
function updateHTML() {
    $("#aff-count").text(affTotalSpeeches);
    $("#aff-last").text(affLastSpeaker + " (" + affSpeechTime + ")");
    $("#neg-count").text(negTotalSpeeches);
    $("#neg-last").text(negLastSpeaker + " (" + negSpeechTime + ")");
    $("#question-count").text(questionCount);
    $("#question-last").text(lastQuestioner);

    $("#aff-queue").empty();
    for (let i = 0; i < affQueue.length; i++) {
        $("#aff-queue").append("<li>" + affQueue[i] + "</li>");
    }

    $("#neg-queue").empty();
    for (let i = 0; i < negQueue.length; i++) {
        $("#neg-queue").append("<li>" + negQueue[i] + "</li>");
    }

    $("#question-queue").empty();
    for (let i = 0; i < questionQueue.length; i++) {
        $("#question-queue").append("<li>" + questionQueue[i] + "</li>");
    }

    $("#speaker-ordering").empty();
    for (let i = 0; i < speakerOrdering.length; i++) {
        $("#speaker-ordering").append("<li>" + speakerOrdering[i][0] + "</li>");
    }

    $("#speaker-precedence").empty();
    for (let i = 0; i < speakerPrecedence.length; i++) {
        $("#speaker-precedence").append("<li>" + speakerPrecedence[i][0] + " " + speakerPrecedence[i][1] + "</li>");
    }

    $("#speaker-recency").empty();
    for (let i = 0; i < speakerRecency.length; i++) {
        $("#speaker-recency").append("<li>" + speakerRecency[i] + "</li>");
    }

    $("#question-ordering").empty();
    for (let i = 0; i < questionOrdering.length; i++) {
        $("#question-ordering").append("<li>" + questionOrdering[i][0] + "</li>");
    }

    $("#question-precedence").empty();
    for (let i = 0; i < questionPrecedence.length; i++) {
        $("#question-precedence").append("<li>" + questionPrecedence[i][0] + " " + questionPrecedence[i][1] + "</li>");
    }

    $("#question-recency").empty();
    for (let i = 0; i < questionRecency.length; i++) {
        $("#question-recency").append("<li>" + questionRecency[i] + "</li>");
    }
}

/**
 * Calibrates and then posts all data to the server.
 */
function postUpdate() {
    parseHTML();
    updateHTML();
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

/**
 * Updates the overall ordering of speakers by adjusting precedence and recency.
 * 
 * @param {string} item the item to update ordering for.
 * @param {string} type the type of item to update. Should be either "speaker" or "question".
 */
function updateOrdering(item, type) {
   if (type == "speaker") {
        updateRecency(speakerRecency, item);
        updatePrecedence(speakerPrecedence, item);
    } else {
        updateRecency(questionRecency, item);
        updatePrecedence(questionPrecedence, item);
    }
}

/**
 * Updates a recency list by returning the
 * passed item to the end of the list.
 * 
 * @param {Array<string>} array the recency array to update. Should be either {@link speakerRecency} or {@link questionRecency}.
 * @param {string} item the item to update.
 */
function updateRecency(array, item) {
    let index = array.indexOf(item);
    if (index != -1) {
        array.splice(index, 1);
    }
    array.push(item);
}

/**
 * Updates a precedence list by incrementing the
 * second element of the passed item in the array
 * @param {Array<string>} array the precedence array to update. Should be either {@link speakerPrecedence} or {@link questionPrecedence}.
 * @param {string} item the item to update.
 */
function updatePrecedence(array, item) {
    console.log(array);
    console.log(item);

    // find the array whose first element is the item, and increment
    for (let i = 0; i < array.length; i++) {
        if (array[i][0] == item) {
            array[i][1]++;;
            break;
        }
    }

    // Sort the array by the second element
    array.sort((a, b) => {
        return a[1] - b[1];
    });
}
//#endregion