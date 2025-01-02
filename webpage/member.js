//#region ----- QUEUE BUTTONS -----
const buttons = [
    ["#aff-button", "aff"],
    ["#neg-button", "neg"],
    ["#question-button", "question"],
];

buttons.forEach((element) => {
    $(element[0]).click(() => {
        console.log(element[1]);
        // If button is not already selected
        if (!$(element[0]).hasClass("selected")) {
            // Add 'selected class
            $(element[0]).addClass("selected");
            // Change text
            $(element[0]).text("Unqueue");

            // Send POST request to server
            $.post("/queue/" + getCookie("sessionID"), {
                name: getCookie("name"),
                type: element[1],
            });
        } else {
            // Remove 'selected' class
            $(element[0]).removeClass("selected");
            // Change text
            $(element[0]).text("Queue for " + element[1]);

            // Send POST request to server
            $.post("/unqueue/" + getCookie("sessionID"), {
                name: getCookie("name"),
                type: element[1],
            });
        }
    });
});
//#endregion

//#region ----- LIVE POLLING -----

// Function to constantly update the dashboard
function update() {
    $.get("/session/" + getCookie("sessionID"), (session) => {
        console.log(session);
    // Update all the elements on the page
        $("#current-motion-text").text(session.currentMotion)
        $("#speaker-name").text(session.currentSpeaker.name);
        $("#disposition-text").text(session.currentSpeaker.disposition);
        $("#time-text").text(timeToString(session.currentSpeaker.time));
        if (session.currentSpeaker.disposition != "Question") {
            $("#number-text").text("Speaker " + session.currentSpeaker.number);
        } else {
            $("#number-text").empty();
        }
        // aff card
        $("#aff-count").text(session.total.aff);
        $("#aff-last").text(session.last.aff.speaker);
        $("#aff-time").text(timeToString(session.last.aff.time));

        $("#aff-queue").empty();
        try {
            for (let i = 0; i < session.speaking.queue.aff.length; i++) {
                if (session.speaking.queue.aff[i] != "None") {
                    $("#aff-queue").append("<li>" + session.speaking.queue.aff[i] + "</li>");
                }
            }
        } catch (err) {}

        // neg card
        $("#neg-count").text(session.total.neg);
        $("#neg-last").text(session.last.neg.speaker);
        $("#neg-time").text(timeToString(session.last.neg.time));

        $("#neg-queue").empty();
        try {
            for (let i = 0; i < data.speakingOrder.queue.neg.length; i++) {
                if (data.speakingOrder.queue.neg[i] != "None") {
                    $("#neg-queue").append("<li>" + data.speakingOrder.queue.neg[i] + "</li>");
                }
            }
        } catch (err) {}

        // question card
        $("#question-count").text(session.total.questions);
        $("#question-last").text(session.last.questioner);

        $("#question-queue").empty();
        
        try {
            for (let i = 0; i < data.questionOrder.queue.length; i++) {
                if (data.questionOrder.queue[i] != "None") {
                    $("#question-queue").append("<li>" + data.questionOrder.queue[i] + "</li>");
                }
            }
        } catch (err) {}

        // Speaking order, precedence, and recency
        $("#speaking-order").empty();
        for (let i = 0; i < session.speaking.order.length; i++) {
            $("#speaking-order").append("<li>" + session.speaking.order[i] + "</li>");
        }

        $("#speaking-precedence").empty();
        for (let i = 0; i < session.speaking.precedence.length; i++) {
            $("#speaking-precedence").append("<li>" + session.speaking.precedence[i][0] + " " + session.speaking.precedence[i][1] + "</li>");
        }

        $("#speaking-recency").empty();
        for (let i = 0; i < session.speaking.recency.length; i++) {
            $("#speaking-recency").append("<li>" + session.speaking.recency[i] + "</li>");
        }

        // Question order, precedence, and recency
        $("#questioning-order").empty();
        for (let i = 0; i < session.questioning.order.length; i++) {
            $("#questioning-order").append("<li>" + session.questioning.order[i] + "</li>");
        }

        $("#questioning-precedence").empty();
        for (let i = 0; i < session.questioning.precedence.length; i++) {
            $("#questioning-precedence").append("<li>" + session.questioning.precedence[i][0] + " " + session.questioning.precedence[i][1] + "</li>");
        }

        $("#questioning-recency").empty();
        for (let i = 0; i < session.questioning.recency.length; i++) {
            $("#questioning-recency").append("<li>" + session.questioning.recency[i] + "</li>");
        }
    });
}

// Run the update function every 1,000 milliseconds
setInterval(update, 500);