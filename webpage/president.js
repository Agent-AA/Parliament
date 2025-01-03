// This file contains all of the event triggers and such specfically for president.html.
// More generic functions are stored in utils.js.

let session;

getSession((serverSession) => {
    session = serverSession;
    session.currentSpeaker.timePaused = parseBool(session.currentSpeaker.timePaused);
    updateDashboard();
});


//#region Editing Events
// Motion title
$("#current-motion-text").focusout(() => {
    session.currentMotion = $("#current-motion-text").text();
    updateServer();
});

// Speaker name
$("#speaker-name").focusout(() => {
    session.currentSpeaker.name = $("#speaker-name").text();
    $("#speaker-header").text(session.currentSpeaker.name);
    updateServer();
});

// Disposition
$("#disposition-text").focusout(() => {
    session.currentSpeaker.disposition = $("#disposition-text").text();
    $("#disposition-header").text(session.currentSpeaker.disposition);
    updateServer();
});

// Speaker time
$("#time-text").focusout(() => {
    session.currentSpeaker.time = timeToSeconds($("#time-text").text());
    $("#time-header").text(timeToString(session.currentSpeaker.time));
    updateServer();
});

// Speaking precedence
$("#speaking-precedence").focusout(() => {
    session.speaking.precedence = parsePrecedence("#speaking-precedence");

    // compute new speaking order
    computeSpeakingOrder();
    putPrecedence("#speaking-precedence", session.speaking.precedence);
    
    updateServer();
});

// Speaking recency
$("#speaking-recency").focusout(() => {
    session.speaking.recency = parseRecency("#speaking-recency");
    // fill in the other orders if none given
    if (session.speaking.recency.length > 0 && session.speaking.precedence.length == 1) {
            
        session.speaking.precedence = session.speaking.recency.map((a) => [a, 0]);

        putPrecedence("#speaking-precedence", session.speaking.precedence);

        // questioning recency should be the reversed array of speaking recency
        session.questioning.recency = session.speaking.recency.slice().reverse();

        session.questioning.precedence = session.speaking.recency.map((a) => [a, 0]);

        session.questioning.order = computeQuestioningOrder();

        putRecency("#questioning-order", session.questioning.order);
        putPrecedence("#questioning-precedence", session.questioning.precedence);
        putRecency("#questioning-recency", session.questioning.recency);

    }
    
    computeSpeakingOrder();
    updateServer();
});

// Question precedence
$("#questioning-precedence").focusout(() => {
    session.questioning.precedence = parsePrecedence("#questioning-precedence");

        // compute new speaking order
        computeQuestioningOrder();
        putPrecedence("#questioning-precedence", session.questioning.precedence);

        updateServer();
    });

// Question recency
$("#questioning-recency").focusout(() => {
    session.questioning.recency = parseRecency("#questioning-recency");

    computeQuestioningOrder();
    
    updateServer();
});
//#endregion


//#region Button Events

// when the "start / stop time button" is clicked, pause or unpause the timer and update server
$("#time-button").click(() => {
    session.currentSpeaker.timePaused = !session.currentSpeaker.timePaused;
    updateServer();
});

// when the end button is pressed, end the current speaker and update server
$("#end-button").click(() => {
    concludeSpeaker();
    updateServer();
});

// when the "recognize Next Aff" button is pressed, add the top affirmation queue to the speaker card.
$("#aff-button").click(() => {
    session.currentSpeaker.name = session.speaking.queue.aff.shift();
    session.currentSpeaker.disposition = "Affirmative";
    session.currentSpeaker.time = 0;
    session.currentSpeaker.timePaused = true;
    updateDashboard();
    updateServer();
});

// when the "Recognize Next Neg" button is pressed, add the top negative queue to the speaker card.
$("#neg-button").click(() => {
    session.currentSpeaker.name = session.speaking.queue.neg.shift();
    session.currentSpeaker.disposition = "Negative";
    session.currentSpeaker.time = 0;
    session.currentSpeaker.timePaused = true;
    updateDashboard();
    updateServer();
});

/*
 * The questioning button is a little more complicated than the aff and neg buttons.
 * Because questioning happens quickly, the question button does two more things than the
 * aff or neg buttons. The questioning button:
 * (1) will conclude the speaker/questioner rather than just override them.
 * (2) will immediately start the time for questioning.
 */
$("#question-button").click(() => {
    if (session.currentSpeaker.disposition != "None") {
        concludeSpeaker();
    }

    session.currentSpeaker.name = session.questioning.queue.shift();
    session.currentSpeaker.disposition = "Question";
    session.currentSpeaker.time = 0;
    session.currentSpeaker.timePaused = false;

    updateDashboard();
    updateServer();
});

//#endregion





//#region ----- Main Functions -----

/**
 * Updates all elements on the dashboard based off of the session
 * object.
 */
function updateDashboard() {
    // Nav and motion header
    $("#speaker-header").text(session.currentSpeaker.name);
    $("#time-header").text(timeToString(session.currentSpeaker.time));
    $("#disposition-header").text(session.currentSpeaker.disposition);
    $("#session-id-header").text("Session ID: " + session.id);
    $("#current-motion-text").text(session.currentMotion);

    // Speaker card
    $("#speaker-name").text(session.currentSpeaker.name);
    $("#disposition-text").text(session.currentSpeaker.disposition);
    $("#time-text").text(timeToString(session.currentSpeaker.time));
    $("#number-text").text("Speaker " + session.currentSpeaker.number);

    // Aff card
    $("#aff-text").html(`
        There have been <strong>${session.total.aff}</strong> affirmative speeches. Rep. <strong>${session.last.aff.speaker}</strong> spoke last (<strong>${timeToString(session.last.aff.time)}</strong>).
    `)
    putRecency("#aff-queue", session.speaking.queue.aff);

    // Neg card
    $("#neg-text").html(`
        There have been <strong>${session.total.neg}</strong> negative speeches. Rep. <strong>${session.last.neg.speaker}</strong> spoke last (<strong>${timeToString(session.last.neg.time)}</strong>).
    `)
    putRecency("#neg-queue", session.speaking.queue.neg);

    // Question card
    $("#question-text").html(`
        There have been <strong>${session.total.questions}</strong> questioning blocks. Rep. <strong>${session.last.questioner}</strong> spoke last.
    `)
    putRecency("#aff-queue", session.questioning.queue);

    // Speaking lists
    computeSpeakingOrder();
    putPrecedence("#speaking-precedence", session.speaking.precedence);
    putRecency("#speaking-recency", session.speaking.recency);

    // Questioning lists
    computeQuestioningOrder();
    putPrecedence("#questioning-precedence", session.questioning.precedence);
    putRecency("#questioning-recency", session.questioning.recency);
}

function updateServer() {

    /* 
    * because JSON doesn't like empty arrays when transmitted
    * we have to do this stupid thing and put something in
    * empty arrays. Otherwise, the server will see the
    * property as undefined
    */
    if (session.speaking.queue.aff.length == 0) {
        session.speaking.queue.aff.push("None");
    }

    if (session.speaking.queue.neg.length == 0) {
        session.speaking.queue.neg.push("None");
    }

    if (session.questioning.queue.length == 0) {
        session.questioning.queue.push("None");
    }
    
    $.post("/update/" + session.id, session);
}

function updateQueueAndTime() {
    $.get("/session/" + session.id, (serverSession) => {

        // update select values
        session.currentSpeaker.time = serverSession.currentSpeaker.time;
        session.speaking.queue.aff = serverSession.speaking.queue.aff.filter(a => a != "None");
        session.speaking.queue.neg = serverSession.speaking.queue.neg.filter(a => a != "None");
        session.questioning.queue = serverSession.questioning.queue.filter(a => a != "None");

        // update the dashboard
        $("#time-text").text(timeToString(session.currentSpeaker.time));
        $("#time-header").text(timeToString(session.currentSpeaker.time));
        putRecency("#aff-queue", session.speaking.queue.aff);
        putRecency("#neg-queue", session.speaking.queue.neg);
        putRecency("#question-queue", session.questioning.queue);

    })
}

setInterval(updateQueueAndTime, 500);
//#endregion