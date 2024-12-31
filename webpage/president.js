//#region ----- Global Variables -----
/**
 * 
 */
let session;

getSession((data) => {
    session = data;
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
    session.speaking.order = computeSpeakingOrder();
    putPrecedence("#speaking-precedence", session.speaking.precedence);
    putRecency("#speaking-order", session.speaking.order);
    
    updateServer();
});

// Speaking recency
$("#speaking-recency").focusout(() => {
    session.speaking.recency = parseRecency("#speaking-recency");
    // fill in the other orders if none given
    if (session.speaking.recency.length > 0 && session.speaking.precedence.length == 1) {
            
        session.speaking.precedence = session.speaking.recency.map((a) => [a, 0]);
        session.speaking.order = computeSpeakingOrder();

        putRecency("#speaking-order", session.speaking.order);
        putPrecedence("#speaking-precedence", session.speaking.precedence);

            // questioning recency should be the reversed array of speaking recency
        session.questioning.recency = session.speaking.recency.slice().reverse();

        session.questioning.precedence = session.speaking.recency.map((a) => [a, 0]);

        session.questioning.order = computeQuestioningOrder();

        putRecency("#questioning-order", session.questioning.order);
        putPrecedence("#questioning-precedence", session.questioning.precedence);
        putRecency("#questioning-recency", session.questioning.recency);

    } else {
        session.speaking.order = computeSpeakingOrder();
        putRecency("#speaking-order", session.speaking.order);
    }
    
    updateServer();
});

// Question precedence
$("#questioning-precedence").focusout(() => {
    session.questioning.precedence = parsePrecedence("#questioning-precedence");

        // compute new speaking order
        session.questioning.order = computeQuestioningOrder();
        putPrecedence("#questioning-precedence", session.questioning.precedence);
        putRecency("#questioning-order", session.questioning.order);

        updateServer();
    });

// Question recency
$("#questioning-recency").focusout(() => {
    session.questioning.recency = parseRecency("#questioning-recency");

    session.questioning.order = computeQuestioningOrder();
    putRecency("#questioning-order", session.questioning.order);
    
    updateServer();
});
//#endregion


//#region Button Events
// when the "start / stop time button" is clicked, pause or unpause the timer and update server
$("#time-button").click(() => {

});

$("#end-button").click(() => {

});

$("#aff-button").click(() => {

});

$("#neg-button").click(() => {

});

$("#question-button").click(() => {
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
    putRecency("#speaking-order", session.speaking.order);
    putPrecedence("#speaking-precedence", session.speaking.precedence);
    putRecency("#speaking-recency", session.speaking.recency);

    // Questioning lists
    putRecency("#questioning-order", session.questioning.order);
    putPrecedence("#questioning-precedence", session.questioning.precedence);
    putRecency("#questioning-recency", session.questioning.recency);
}

function updateServer() {
    $.post("/update/" + session.id, session);
}