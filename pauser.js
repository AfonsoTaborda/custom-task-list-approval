function pause(ms) {
    const pauseInterval = setInterval(() => {
        console.log("Waiting for the comment to be initially created...");
    }, ms);

    setTimeout(() => {
        clearInterval(pauseInterval);
    }, ms);
}

module.exports = pause;