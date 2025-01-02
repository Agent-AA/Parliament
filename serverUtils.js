/**
 * An object used to track speaking time.
 */
const clock = {
    list: [],
    add: sessionID => {
        if (!clock.list.includes(sessionID)) {
            clock.list.push(sessionID);
        }
    },
    remove: sessionID => {
        clock.list = clock.list.filter(a => a != sessionID);
    },
    tick: () => {
        for (let i = 0; i < clock.list.length; i++) {
            session = module.exports.read(clock.list[i]);
            session.currentSpeaker.time++;
            module.exports.save(session);
        }
    }
}

/**
 * Writes the specified session object to a file named
 * with the session's id, specifically in the format "{session-id}.json"
 *
 * @param {Object} session - The session object to save to a file.
 */
const save = session => {
  const fs = require('fs');
  const jsonData = JSON.stringify(session);
  fs.writeFileSync( "sessions/" + session.id + '.json', jsonData);
}

/**
 * Returns the session object with the specified id.
 *
 * @param {string} id - The id of the session object to read.
 */
const read = sessionID => {
  try {
    const fs = require('fs');
    const jsonData = fs.readFileSync("sessions/" + sessionID + '.json');
    return JSON.parse(jsonData);
  } catch (err) {
    return {
      "error": "No sesion found"
    };
  }
}

/**
 * Adds an item to an array in place, in the appropriate position, if that item is not already in the array.
 *
 * @param {string} type - Either "aff", "neg", or "question"
 * @param {string} item - The item to add to the queue
 */
const addToQueue = (type, item) => {
    
    // if speech
    if (type == "aff" || type == "neg") {
        
        // if item is not already in queue
        if (!session.speaking.queue[type].includes(item)) {
            // add to queue
            session.speaking.queue[type].push(item);
            // sort queue
            sortQueue(type);
        }
    // else if question
    } else if (type == "question") {

        // if item is not already in queue
        if (!session.questioning.queue.includes(item)) {
            // add to queue
            session.questioning.queue.push(item);
            // sort queue
            sortQueue("question");
        }
    }
}

/**
 * Sorts an array by the correct precedence and recency.
 *
 * @param {string} type - Either "aff", "neg", or "question"
 */
const sortQueue = (type) => {

    // if speech
    if (type == "aff" || type == "neg") {
        
        // sort by precedence
        session.speaking.queue[type] = session.speaking.precedence.filter(a => session.speaking.queue[type].includes(a[0]));
    
        // now sort by recency
        session.speaking.queue[type].sort((a, b) => {
            if (a[1] == b[1]) {
                let aIndex = session.speaking.recency.indexOf(a[0]);
                let bIndex = session.speaking.recency.indexOf(b[0]);
                return aIndex - bIndex;
            } else {
                return 1;
            }
        });

        // remove precedence number
        session.speaking.queue[type] = session.speaking.queue[type].map(a => a[0]);
        
  } else if (type == "question") {
    
      // sort by precedence
      session.questioning.queue = session.questioning.precedence.filter(a => session.questioning.queue.includes(a[0]));

        // Now sort by recency
        session.questioning.queue.sort((a, b) => {
            if (a[1] == b[1]) {
                let aIndex = session.questioning.recency.indexOf(a[0]);
                let bIndex = session.questioning.recency.indexOf(b[0]);
                return aIndex - bIndex;
            } else {
                return 1;
            }
        });

        // remove precedence number
        session.questioning.queue = session.questioning.queue.map(a => a[0]);
  }
}

/**
 * Removes `item` from the queue indicated by `type`, if it is in the queue. Does nothing otherwise.
 *
 * @param {string} type - Either "aff", "neg", or "question"
 * @param {string} item - The item to remove from the queue
 */
const removeFromQueue = (type, item) => {

    // if speech
    if (type == "aff" || type == "neg") {
        // remove item from queue
        session.speaking.queue[type] = session.speaking.queue[type].filter((a) => a != item);

        // if queue is now empty, it won't transmit over JSON, so we add a placeholder "None" value.
        if (session.speaking.queue[type].length == 0) {
            session.speaking.queue[type] = ["None"];
        }
    }
    // if question
    else if (type == "question") {
        // remove item from queue
        session.questioning.queue = session.questioning.queue.filter((a) => a != item);

        // if queue is now empty, it won't transmit over JSON, so we add a placeholder "None" value.
        if (session.questioning.queue.length == 0) {
            session.questioning.queue = ["None"];
        }
    }
}

module.exports = {
    clock,
    save,
    read,
    addToQueue,
    sortQueue,
    removeFromQueue,
}