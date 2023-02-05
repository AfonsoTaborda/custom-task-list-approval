const core = require('@actions/core');
const getGithubComment = require('./github-comment');

const TASK_LIST_ITEM = /\[(x|X|\s)\](.*)/g;
var isCompleteArr = [];

async function updateTaskListCompletion(octokit, commentId) {
    const commentBody = await getGithubComment(octokit, commentId);

    while ((match = TASK_LIST_ITEM.exec(commentBody)) !== null) {
        var isComplete = match[1] != " ";
        var itemText = match[2];

        if (isComplete && !isCompleteArr.includes(itemText)) {
            isCompleteArr.push(itemText);
        }
    }
}

async function printTaskListCompletionStatus(octokit, commentId) {
    var count = 0;
    const commentBody = await getGithubComment(octokit, commentId);

    while ((match = TASK_LIST_ITEM.exec(commentBody)) !== null) {
        var isComplete = match[1] != " ";
        var itemText = match[2];

        count++;

        if (isComplete && !isCompleteArr.includes(itemText)) {
            console.log(`${itemText} is complete ✅`);
        } else {
            console.log(`${itemText} has not been completed yet ❌`);
        }
    }

    return count;
}

async function timer(timeout, octokit, commentId, resultComment) {
    const count = await printTaskListCompletionStatus(octokit, resultComment, commentId);

    console.log("Starting the timer...");
    var sec = timeout * 60;
    var interval = setInterval(async function() {
        console.log(`You have ${sec} seconds left and ${isCompleteArr.length} tasks currently completed`);

        await updateTaskListCompletion(octokit, resultComment, commentId);

        sec--;

        if (sec < 0 || isCompleteArr.length == count && count != 0) {
            if(isCompleteArr.length != count) {
                core.setFailed("The timer has ended and not all the tasks have been completed, failing the workflow...");
            }

            console.log(`Clearing the timeout with sec = ${sec} and isCompleteArr.length = ${isCompleteArr.length}`);
            clearInterval(interval);
        }
    }, 1000);
}

module.exports = timer;