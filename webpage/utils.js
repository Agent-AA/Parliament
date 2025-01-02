/**
 * Clears the speaker card and updates the speaking or questioning order.
 *
 * Won't update the speaking card if it is incorrectly configured. It determines this by whether the disposition is set to "None" or not.
 */
function concludeSpeaker() {

    // Pause time
    session.currentSpeaker.timePaused = true;
    
    // Update correct orders
    switch (session.currentSpeaker.disposition) {
        case "Affirmative": 
            session.last.aff.speaker = session.currentSpeaker.name;
            session.last.aff.time = session.currentSpeaker.time;
            session.total.aff++;
            session.currentSpeaker.number++;
            updateSpeakingOrder(session.currentSpeaker.name);
            break;
        
        case "Negative": 
            session.last.neg.speaker = session.currentSpeaker.name;
            session.last.neg.time = session.currentSpeaker.time;
            session.total.neg++;
            session.currentSpeaker.number++;
            updateSpeakingOrder(session.currentSpeaker.name);
            break;
            
        case "Question":
            session.last.questioner = session.currentSpeaker.name;
            session.total.questions++;
            updateQuestionOrder(session.currentSpeaker.name);
    }

    // Compute new overall orders
    session.speaking.order = computeSpeakingOrder();
    session.questioning.order = computeQuestioningOrder();

    putRecency("#speaking-order", session.speaking.order);
    putRecency("#question-order", session.questioning.order);

    // Clear speaker card
    session.currentSpeaker.name = "None";
    session.currentSpeaker.disposition = "None";
    session.currentSpeaker.time = 0;

    updateDashboard();
    updateServer();
}


/**
 * Retrieves the session ID from cookies. If the session ID does not exist,
 * it makes a request to the server to generate a new session ID, sets the cookie,
 * and returns the new session ID.
 *
 * @returns {string} The session ID.
 */
function getSession(callback) {
    
    let id = getCookie("sessionID");
    if (id != "") {
        $.get("/session/" + id, (data) => {
             callback(data);
        });
    } else {
        $.get("/newSession", (data) => {
            id = data.id
            setCookie("sessionID", id, 1);
            console.log(data);
            callback(data);
        });
    }
}

/**
 * Sets a cookie with the specified name, value, and expiration days.
 *
 * @param {string} name - The name of the cookie.
 * @param {string} value - The value of the cookie.
 * @param {number} days - The number of days until the cookie expires.
 */
function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

/**
 * Retrieves the value of a cookie with the specified name.
 *
 * @param {string} name The name of the cookie to retrieve.
 * 
 * @returns {string} The value of the cookie, or an empty string if the cookie does not exist.
 */
function getCookie(name) {
    name += "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

/**
 * Parses a boolean from a string.
 *
 * When transmitted as json data across the internet, booleans are converted into
 * strings, and java has no built-in boolean parsing function.
 *
 * @param {string} boolStr - The string to parse.
 *
 * @returns {boolean} true, false, or NaN.
 */
function parseBool(boolStr) {
    if (boolStr == "true") {
        return true;
    } else if (boolStr == "false") {
        return false;
    } else {
        return NaN;
    }
}

/**
 * Parses an unstyled list element representing a recency order and returns an array of the listed items.
 * Only actual members are included in the list. "None" and empty elements ("" or "\n") are discarded.
 * 
 * @param {string} elementID the id attribute of the list element
 * 
 * @returns {Array<string>} the list of items in the list element
 */
function parseRecency(elementID) {
    let list = [];
    $(elementID + " li").each((index, element) => {
        if (element.innerText != "None" && element.innerText != "" && element.innerText != "\n") {
            list.push(element.innerText);
        }
        });
    return list;
}

/**
 * Accepts an element ID and recency list and updates the HTML accordingly. This
 * function can also be used to update the overall ordering.
 * 
 * If the list is empty, the function will append a list element with the text "None."
 * This preserves the user's direct editing ability by ensuring there is an editable list element.
 * Otherwise, new elements would appear as divs, which are not parsed.
 * 
 * @param {string} elementID the id attribute of the list element 
 * @param {Array<string>} list the array / list of items to put in the list element
 */
function putRecency(elementID, list) {
    $(elementID).empty();

    let l = [];
    
    try {
        l = list.filter((a) => a != "None");
    } catch (err) {}
    
    if (l.length != 0) {
        l.forEach((element) => {
            $(elementID).append("<li>" + element + "</li>");
        });
    } else {
        $(elementID).append("<li>None</li>");
    }
}

/**
 * Parses an unstyled list element representing a precedence order and returns an array of the listed items.
 * Only actual members are included in the list. "None" and empty elements ("" or "\n") are discarded.
 * 
 * @param {string} elementID the id attribute of the list element
 * 
 * @returns {Array<string>} the list of items in the list element, formatted as [{string} item, {number} precedence];
 */
function parsePrecedence(elementID) {
    let list = [];
    $(elementID + " li").each((index, element) => {
        let split = element.innerText.split(" ");
        if (split[0] != "None" && split[0] != "" && split[0] != "\n") {
            list.push([split[0], parseInt(split[1])]);
        }
    });

    return list;
}

/**
 * * Accepts an element ID and recency list and updates the HTML accordingly. This
 * function can also be used to update the overall ordering.
 * 
 * If the list is empty, the function will append a list element with the text "None."
 * This preserves the user's direct editing ability by ensuring there is an editable list element.
 * Otherwise, new elements would appear as divs, which are not parsed.
 * 
 * @param {string} elementID the id attribute of the list element 
 * @param {Array<string>} list the array / list of items to put in the list element
 */
function putPrecedence(elementID, list) {

    l = list.filter((a) => a[0] != "None");

    if (l.length != 0) {
        $(elementID).empty();
        for (let i = 0; i < list.length; i++) {
            $(elementID).append("<li>" + l[i][0] + " " + l[i][1] + "</li>");
        }
    } else {
        $(elementID).empty();
        $(elementID).append("<li>None 0</li>");
    }
}

/**
 * Computes the correct speaking order based off of `session.speaking.precedence` and `session.speaking.recency`.
 * and returns that order.
 *
 * @returns {array<string>} the computed speaking order
 */
function computeSpeakingOrder() {
    let order = session.speaking.precedence.sort((a, b) => a[1] - b[1]);
    
    // Now sort speaking order by index in speaking recency
    order.sort((a, b) => {
        if (a[1] == b[1]) {
            let aIndex = session.speaking.recency.indexOf(a[0]);
            let bIndex = session.speaking.recency.indexOf(b[0]);
            return aIndex - bIndex;
        } else {
            return 1;
        }
    });

    return order.map(a => a[0]);
}

/**
 * Computes the correct questioning order based off of `session.questioning.precedence` and `session.questioning.recency`.
 * and returns that order.
 *
 * @returns {array<string>} the computed questioning order
 */
function computeQuestioningOrder() {
    let order = session.questioning.precedence.sort((a, b) => a[1] - b[1]);

    // Now sort speaking order by index in speaking recency
    order.sort((a, b) => {
        if (a[1] == b[1]) {
            let aIndex = session.questioning.recency.indexOf(a[0]);
            let bIndex = session.questioning.recency.indexOf(b[0]);
            return aIndex - bIndex;
        } else {
            return 1;
        }
    });

    return order.map(a => a[0]);
}

/**
 * Increments the number of times spoken for the specified speaker on `session.speaking.precedence` and
 * moves them to the end of the `session.speaking.recency` array.
 * 
 * @param {string} speaker the name of the speaker
 */
function updateSpeakingOrder(speaker) {
    let precedenceIndex = session.speaking.precedence.findIndex((a) => a[0] == speaker);
    session.speaking.precedence[precedenceIndex][1]++;
    session.speaking.recency.splice(session.speaking.recency.indexOf(speaker), 1);
    session.speaking.recency.push(speaker);
}

/**
 * Increments the number of times spoken for the specified speaker on `session.questioning.precedence` and
 * moves them to the end of the `session.questioning.recency` array.
 * 
 * @param {string} questioner the name of the questioner
 */
function updateQuestionOrder(questioner) {
    let precedenceIndex = session.questioning.precedence.findIndex((a) => a[0] == questioner);
    session.questioning.precedence[precedenceIndex][1]++;
    session.questioning.recency.splice(session.questioning.recency.indexOf(questioner), 1);
    session.questioning.recency.push(questioner);
}

/**
 * Converts a number of seconds to a string in the format "m:ss".
 * The inverse function of this one is {@link timeToSeconds()}.
 * 
 * @param {number} time the time in seconds to convert.
 * 
 * @returns {string} a string in the format "m:ss"
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
 * @returns {number} a number of seconds
 */
function timeToSeconds (time) {
    let split = time.split(":");
    return parseInt(split[0]) * 60 + parseInt(split[1]);
}