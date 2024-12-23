//#region ----- NAME INPUT -----
// On page load, check if the user has a name stored in local storage. Cookies wasn't working for some reason, and could be blocked, so local storage suffices.
$(document).ready(() => {
    let storedName = localStorage.getItem("name");
    if (storedName) {
        $("#name-input").val(storedName);
    }
});

// When the user types in their name at the top, store the name in local storage
$("#name-input").on("input", () => {
    // Store name in local storage
    localStorage.setItem("name", $("#name-input").val());
});
//#endregion

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
            $.post("/queue", {
                name: $("#name-input").val(),
                type: element[1],
            });
        } else {
            // Remove 'selected' class
            $(element[0]).removeClass("selected");
            // Change text
            $(element[0]).text("Queue for " + element[1]);

            // Send POST request to server
            $.post("/unqueue", {
                name: $("#name-input").val(),
                type: element[1],
            });
        }
    });
});
//#endregion

//#region ----- LIVE POLLING -----
/**
 * Function to update the dasboard. Data is in the following JSON format:
 * {
 *  speaker: {
 *      name: string,
 *      disposition: string,
 *      timeRemaining: string,
 *      number: number,
 *  },
 *  aff: {
 *     totalSpeeches: number,
 *     lastSpeaker: string,
 *     speechTime: number
 *  },
 *  neg: {
 *    totalSpeeches: number,
 *    lastSpeaker: string,
 *    speechTime: number,
 *  },
 *  question: {
 *      totalBlocks: number,
 *      lastQuestioner: string
 *  }
 *  speakingOrder: {
 *     precedent: string[],
 *     recency: string[],
 *     queue: {
 *        aff: string[],
 *       neg: string[],
 *     }
 *  },
 *  questionOrder: {
 *    precedent: string[],
 *   recency: string[],
 *  queue: string[]
 *  }
 * }
 */
// Function to constantly update the dashboard
function update() {
    $.get("/data", (data) => {
        console.log(data);
    // Update all the elements on the page
        $("#motion-title").text(data.motion)
        $("#current-speaker").text(data.speaker.name);
        $("#disposition").text(data.speaker.disposition);
        $("#time-remaining").text(timeToString(data.speaker.time));
        if (data.speaker.disposition != "Question") {
            $("#speaker-number").text("Speaker " + data.speaker.number);
        } else {
            $("#speaker-number").empty();
        }
        // aff card
        $("#aff-count").text(data.aff.totalSpeeches);
        $("#aff-last").text(data.aff.lastSpeaker);
        $("#aff-time").text(timeToString(data.aff.speechTime));

        $("#aff-queue").empty();
        for (let i = 0; i < data.speakingOrder.queue.aff.length; i++) {
            if (data.speakingOrder.queue.aff[i] != "None") {
                $("#aff-queue").append("<li>" + data.speakingOrder.queue.aff[i] + "</li>");
            }
        }

        // neg card
        $("#neg-count").text(data.neg.totalSpeeches);
        $("#neg-last").text(data.neg.lastSpeaker);
        $("#neg-time").text(timeToString(timeToString(data.neg.speechTime)));

        $("#neg-queue").empty();
        for (let i = 0; i < data.speakingOrder.queue.neg.length; i++) {
            if (data.speakingOrder.queue.neg[i] != "None") {
                $("#neg-queue").append("<li>" + data.speakingOrder.queue.neg[i] + "</li>");
            }
        }

        // question card
        $("#question-count").text(data.question.totalQuestions);
        $("#question-last").text(data.question.lastQuestioner);

        $("#question-queue").empty();
        for (let i = 0; i < data.questionOrder.queue.length; i++) {
            if (data.questionOrder.queue[i] != "None") {
                $("#question-queue").append("<li>" + data.questionOrder.queue[i] + "</li>");
            }
        }

        // Speaking order, precedence, and recency
        $("#speaking-overall").empty();
        for (let i = 0; i < data.speakingOrder.order.length; i++) {
            $("#speaking-overall").append("<li>" + data.speakingOrder.order[i] + "</li>");
        }

        $("#speaking-precedence").empty();
        for (let i = 0; i < data.speakingOrder.precedence.length; i++) {
            $("#speaking-precedence").append("<li>" + data.speakingOrder.precedence[i][0] + " " + data.speakingOrder.precedence[i][1] + "</li>");
        }

        $("#speaking-recency").empty();
        for (let i = 0; i < data.speakingOrder.recency.length; i++) {
            $("#speaking-recency").append("<li>" + data.speakingOrder.recency[i] + "</li>");
        }

        // Question order, precedence, and recency
        $("#question-overall").empty();
        for (let i = 0; i < data.questionOrder.order.length; i++) {
            $("#question-overall").append("<li>" + data.questionOrder.order[i] + "</li>");
        }

        $("#question-precedence").empty();
        for (let i = 0; i < data.questionOrder.precedence.length; i++) {
            $("#question-precedence").append("<li>" + data.questionOrder.precedence[i][0] + " " + data.questionOrder.precedence[i][1] + "</li>");
        }

        $("#question-recency").empty();
        for (let i = 0; i < data.questionOrder.recency.length; i++) {
            $("#question-recency").append("<li>" + data.questionOrder.recency[i] + "</li>");
        }
    });
}

// Run the update function every 1,000 milliseconds
setInterval(update, 500);






/**
 * Converts a number of seconds to a string in the format "m:ss".
 * The inverse function of this one is {@link timeToSeconds()}.
 * 
 * @param {number} time the time in seconds to convert.
 * 
 * @returns a string in the format "m:ss"
 */
function timeToString (time) {
    time = parseInt(time);
    let minutes = Math.floor(time / 60);
    let seconds = time % 60;

    if (seconds < 10) {
        seconds = "0" + seconds;
    }

    return minutes + ":" + seconds;
}