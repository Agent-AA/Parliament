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

    l = list.filter((a) => a != "None");

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

function computeSpeakingOrder() {
    let order = session.speaking.precedence.sort((a, b) => a[1] - b[1]).map((a) => a[0]);

    // Now sort speaking order by index in speaking recency
    order.sort((a, b) => {
        let aIndex = session.speaking.recency.indexOf(a);
        let bIndex = session.speaking.recency.indexOf(b);
        return aIndex - bIndex;
    });

    return order;
}

function computeQuestioningOrder() {
    let order = session.questioning.precedence.sort((a, b) => a[1] - b[1]).map((a) => a[0]);

    // Now sort speaking order by index in speaking recency
    order.sort((a, b) => {
        let aIndex = session.questioning.recency.indexOf(a);
        let bIndex = session.questioning.recency.indexOf(b);
        return aIndex - bIndex;
    });

    return order;
}

/**
 * Increments the number of times spoken for the specified speaker and moves them to the last index
 * of the speaking recency list.
 * 
 * @param {string} speaker the name of the speaker
 */
function updateSpeakingOrder(speaker) {
    let precedenceIndex = speakerPrecedence.findIndex((a) => a[0] == speaker);
    speakerPrecedence[precedenceIndex][1]++;
    speakerRecency.splice(speakerRecency.indexOf(speaker), 1);
    speakerRecency.push(speaker);
}

/**
 * Increments the number of questions asked for the specified questioner and moves them to the last
 * index of the questioning recency list.
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