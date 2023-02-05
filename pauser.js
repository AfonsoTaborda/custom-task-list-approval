function pause(ms) {
    console.log(`Pausing for ${ms*(1/1000)} seconds...`);
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = pause;