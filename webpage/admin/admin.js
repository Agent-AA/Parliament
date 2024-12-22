//#region ----- Global Variables -----
let motion = "None";
let speaker = "None";
let disposition = "None";
let time = 0;
let number = 1;
let timePaused = true;
let affTotalSpeeches = 0;
let affLastSpeaker = "None";
let affSpeechTime = 0;
let negTotalSpeeches = 0;
let negLastSpeaker = "None";
let negSpeechTime = 0;
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
            motion = data.motion;
            speaker = data.speaker.name;
            disposition = data.speaker.disposition;
            time = data.speaker.time;
            timePaused = data.speaker.timePaused;

            number = data.speaker.number;

            affTotalSpeeches = data.aff.totalSpeeches;
            affLastSpeaker = data.aff.lastSpeaker;

            affQueue = data.speakingOrder.queue.aff;

            negTotalSpeeches = data.neg.totalSpeeches;
            negLastSpeaker = data.neg.lastSpeaker;

            negQueue = data.speakingOrder.queue.neg;

            questionCount = data.question.totalQuestions;
            lastQuestioner = data.question.lastQuestioner;
            questionQueue = data.questionOrder.queue;

            speakerPrecedence = data.speakingOrder.precedence;
            speakerRecency = data.speakingOrder.recency;
            questionPrecedence = data.questionOrder.precedence;


            questionRecency = data.questionOrder.recency;

            updateHTML();
        }
    });
});



//#region Editing Events
// Motion title
$("#motion-title").focusout(() => {
    motion = $("#motion-title").text();
    update();
});

// Speaker
$("#speaker-name").focusout(() => {
    speaker = $("#speaker-name").text();
    update();
});

// Speaker side
$("#speaker-disposition").focusout(() => {
    disposition = $("#speaker-disposition").text();
    update();
});

// Speaker time
$("#speaker-time").focusout(() => {
    time = timeToSeconds($("#speaker-time").text());
    update();
});

// Question count
$("#question-count").focusout(() => {
    questionCount = parseInt($("#question-count").text());
    update();
});

// Last questioner
$("#question-last").focusout(() => {
    lastQuestioner = $("#question-last").text();
    update();
});

// Affirmative speech count
$("#aff-count").focusout(() => {
    affTotalSpeeches = parseInt($("#aff-count").text());
    update();
});

// Affirmative last speaker and time
$("#aff-last").focusout(() => {
    let split = $("#aff-last").text().split(" ");
    affLastSpeaker = split[0];
    affSpeechTime = timeToSeconds(split[1]);
    update();
});

// Negative speech count
$("#neg-count").focusout(() => {
    negTotalSpeeches = parseInt($("#neg-count").text());
    update();
});

// Negative last speaker and time
$("#neg-last").focusout(() => {
    let split = $("#neg-last").text().split(" ");
    negLastSpeaker = split[0];
    negSpeechTime = timeToSeconds(split[1]);
    update();
});

// Speaking precedence
$("#speaker-precedence").focusout(() => {
    speakerPrecedence = parsePrecedence("#speaker-precedence");
    update();
});

// Speaking recency
$("#speaker-recency").focusout(() => {
    speakerRecency = parseRecency("#speaker-recency");
    update();
});

// Question precedence
$("#question-precedence").focusout(() => {
    questionPrecedence = parsePrecedence("#question-precedence");
    update();
});

// Question recency
$("#question-recency").focusout(() => {
    questionRecency = parseRecency("#question-recency");
    update();
});
//#endregion


//#region Button Events
// when the "start / stop time button" is clicked, pause or unpause the timer and update server
$("#pause-button").click(() => {
    timePaused = !timePaused;
    update();
});

$("#end-button").click(() => {
    concludeSpeaker();
    update();
});

$("#aff-button").click(() => {
    speaker = affQueue.shift();
    disposition = "Affirmative";
    time = 0;
    timePaused = true;
    update();
});

$("#neg-button").click(() => {
    speaker = negQueue.shift();
    disposition = "Negative";
    time = 0;
    timePaused = true;
    update();
});

$("#question-button").click(() => {
    speaker = questionQueue.shift();
    disposition = "Question";
    time = 0;
    timePaused = false;
    update();
});

// Shortcuts
// ctrl + space to pause / unpause
$(document).keydown((e) => {
    if (e.ctrlKey && e.key == " ") {
        timePaused = !timePaused;
        update();
    }
});

// ctrl + enter to end speaker
$(document).keydown((e) => {
    if (e.ctrlKey && e.key == "Enter") {
        concludeSpeaker();
        update();
    }
});

// ctrl + q to start question
$(document).keydown((e) => {
    if (e.ctrlKey && e.key == "q") {
        speaker = questionQueue.shift();
        disposition = "Question";
        time = 0;
        timePaused = false;
        update();
    }
});

// ctrl + a to start affirmative
$(document).keydown((e) => {
    if (e.ctrlKey && e.key == "a") {
        speaker = affQueue.shift();
        disposition = "Affirmative";
        time = 0;
        timePaused = true;
        update();
    }
});

// ctrl + n to start negative
$(document).keydown((e) => {
    if (e.ctrlKey && e.key == "n") {
        speaker = negQueue.shift();
        disposition = "Negative";
        time = 0;
        timePaused = true;
        update();
    }
});

//#endregion





//#region ----- Main Functions -----

/*
* Wrapper function for updating data on both the webpage and server. It also
* sorts the queues and orders.
*/
function update() {

    number = affTotalSpeeches + negTotalSpeeches + 1;

    // If any of the ordering lists are blank, autofill them based off of speaker recency.
    if (speakerPrecedence.length == 0) {
        speakerPrecedence = speakerRecency.map((a) => [a, 0]);
    } if (questionRecency.length == 0) {
        speakerRecency.forEach((a) => {
            questionRecency.unshift(a);
        });
    } if (questionPrecedence.length == 0) {
        questionPrecedence = questionRecency.map((a) => [a, 0]);
    }

    // Then sort the lists. First the precence, then the ordering.
    // Recency will always already be sorted.
    speakerPrecedence.sort((a, b) => {
        if (a[1] == b[1]) {
            // sort alphabetically
            return a[0] > b[0] ? 1 : -1;
        } else {
            return a[1] - b[1];
        }
    });

    // Ordering is by precedence and then recency
    speakerOrdering = speakerPrecedence;
    speakerOrdering.sort((a, b) => {
        if (a[1] == b[1]) {
            return speakerRecency.indexOf(a[0]) - speakerRecency.indexOf(b[0]);
        }
    });
    // Remove the precedence value.
    speakerOrdering = speakerOrdering.map((a) => a[0]);

    questionPrecedence.sort((a, b) => {
        if (a[1] == b[1]) {
            // sort alphabetically
            return a[0] > b[0] ? 1 : -1;
        } else {
            return a[1] - b[1];
        }
    });

    questionOrdering = questionPrecedence;
    questionOrdering.sort((a, b) => {
        if (a[1] == b[1]) {
            return questionRecency.indexOf(a[0]) - questionRecency.indexOf(b[0]);
        }
    });
    questionOrdering = questionOrdering.map((a) => a[0]);

    affQueue.sort((a, b) => {
        return speakerOrdering.indexOf(a) - speakerOrdering.indexOf(b);
    });

    negQueue.sort((a, b) => {
        return speakerOrdering.indexOf(a) - speakerOrdering.indexOf(b);
    });

    questionQueue.sort((a, b) => {
        return questionOrdering.indexOf(a) - questionOrdering.indexOf(b);
    });

    // Finally, update the webpage and server.
    updateHTML();
    postUpdate();
}

/**
 * Updates the HTML on the admin page to reflect the current global variables.
 */
function updateHTML() {

    $("#motion-title").text(motion);
    $("#speaker-name").text(speaker);
    $("#speaker-time").text(timeToString(time));
    $("#speaker-number").text(number);
    $("#speaker-disposition").text(disposition);
    if (disposition == "Question") {
        $("#speaker-number").text("");
    } else {
        $("#speaker-number").text("Speaker " + number);
    }

    $("#header-name").text(speaker);
    $("#header-time").text(timeToString(time));
    $("#header-disposition").text(disposition);

    $("#aff-count").text(affTotalSpeeches);
    $("#aff-last").text(affLastSpeaker + " " + timeToString(affSpeechTime));
    $("#neg-count").text(negTotalSpeeches);
    $("#neg-last").text(negLastSpeaker + " " + timeToString(negSpeechTime));
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
        $("#speaker-ordering").append("<li>" + speakerOrdering[i] + "</li>");
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
        $("#question-ordering").append("<li>" + questionOrdering[i] + "</li>");
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
 * Posts data to server
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

function getData() {
    $.get("/data", (data) => {
        console.log(data);
        
        // Update the time if it's not paused
        if (!timePaused) {
            time = data.speaker.time;
            $("#speaker-time").text(timeToString(time));
            $("#header-time").text(timeToString(time));
        }
        
        // Update the queues
        affQueue = data.speakingOrder.queue.aff;
        negQueue = data.speakingOrder.queue.neg;
        questionQueue = data.questionOrder.queue;

        // Sort queues
        affQueue.sort((a, b) => {
            return speakerOrdering.indexOf(a) - speakerOrdering.indexOf(b);
        });
    
        negQueue.sort((a, b) => {
            return speakerOrdering.indexOf(a) - speakerOrdering.indexOf(b);
        });
    
        questionQueue.sort((a, b) => {
            return questionOrdering.indexOf(a) - questionOrdering.indexOf(b);
        });

        // We don't want to call the update() function, because that would meaning constantly
        // overwriting the user's input. Instead, we just want to update the queues.
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
    });    
}

setInterval(getData(), 500);

/**
 * Concludes the current speaker listed on the speaker card and updates the other cards accordingly.
 */
function concludeSpeaker() {
    timePaused = true;
    // Update the appropriate action card.
    switch (disposition) {
        case "Affirmative":
            affTotalSpeeches++;
            affLastSpeaker = speaker;
            affSpeechTime = time;
            updateSpeakingOrder(speaker);
            break;
        case "Negative":
            negTotalSpeeches++;
            negLastSpeaker = speaker;
            negSpeechTime = time;
            updateSpeakingOrder(speaker);
            break;
        case "Question":
            questionCount++;
            lastQuestioner = speaker;
            updateQuestionOrder(speaker);
            break;
    }

    // Clear the speaker card
    speaker = "None";
    disposition = "None";
    time = 0;

    update();
}
//#endregion





//#region ----- Helper Functions
/**
 * Parses an unstyled list element representing a recency order and returns an array of the listed items.
 * 
 * @param {string} elementID the id attribute of the list element
 * 
 * @returns {Array<string>} the list of items in the list element
 */
function parseRecency(elementID) {
    let list = [];
    $(elementID + " li").each((index, element) => {
        if (element.innerText != "None") {
            list.push(element.innerText);
        }
        });

    return list;
}

/**
 * Parses an unstyled list element representing a precedence order and returns an array of the listed items.
 * 
 * @param {string} elementID the id attribute of the list element
 * 
 * @returns {Array<string>} the list of items in the list element, formatted as [{string} item, {number} precedence];
 */
function parsePrecedence(elementID) {
    let list = [];
    $(elementID + " li").each((index, element) => {
        let split = element.innerText.split(" ");
        list.push([split[0], parseInt(split[1])]);
    });

    return list;
}

/**
 * Updates the speaking order by incrementing the speaker's precedence and putting them at the
 * end of the recency list.
 * 
 * @param {*string} speaker the name of the speaker
 */
function updateSpeakingOrder(speaker) {
    let precedenceIndex = speakerPrecedence.findIndex((a) => a[0] == speaker);
    speakerPrecedence[precedenceIndex][1]++;
    speakerRecency.splice(speakerRecency.indexOf(speaker), 1);
    speakerRecency.push(speaker);
}

/**
 * Updates the question order by incrementing the questioner's precedence and putting them at the
 * end of the recency list.
 * 
 * @param {string} questioner the name of the questioner
 */
function updateQuestionOrder(questioner) {
    let precedenceIndex = questionPrecedence.findIndex((a) => a[0] == questioner);
    questionPrecedence[precedenceIndex][1]++;
    questionRecency.splice(questionRecency.indexOf(questioner), 1);
    questionRecency.push(questioner);
}

/**
 * Converts a number of seconds to a string in the format "m:ss".
 * The inverse function of this one is {@link timeToSeconds()}.
 * 
 * @param {number} time the time in seconds to convert.
 * 
 * @returns a string in the format "m:ss"
 */
function timeToString (time) {
    let minutes = Math.floor(time / 60);
    let seconds = time % 60;

    if (seconds < 10) {
        seconds = "0" + seconds;
    }

    return minutes + ":" + seconds;
}

/**
 * Converst a string in the format "m:ss" to a number of seconds
 * The inverse function of this one is {@link timeToString()}.
 * 
 * @param {string} time the time in the format "m:ss" to convert.
 * 
 * @returns a number of seconds
 */
function timeToSeconds (time) {
    let split = time.split(":");
    return parseInt(split[0]) * 60 + parseInt(split[1]);
}
//#endregion