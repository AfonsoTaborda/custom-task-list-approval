function pause(ms) {
    const pause = setInterval(() => {
        console.log("Waiting for the comment to be initially created...");
    }, ms);

    setTimeout(() => {
        clearInterval(pause);
    }, ms);
}

module.exports = pause;