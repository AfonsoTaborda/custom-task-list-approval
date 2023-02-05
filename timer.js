const core = require('@actions/core');
const getGithubComment = require('./github-comment');

var isCompleteArr = [];
var count = 0;

function updateTaskListCompletion(isCompleteArr, octokit, resultComment, similarCommentId, TASK_LIST_ITEM) {
    const commentBody = getGithubComment(octokit, resultComment, similarCommentId);

    while ((match = TASK_LIST_ITEM.exec(commentBody)) !== null) {
        var isComplete = match[1] != " ";
        var itemText = match[2];

        count++;

        if (isComplete && !isCompleteArr.includes(itemText)) {
            isCompleteArr.push(itemText);
        }
    }
}

function printTaskListCompletionStatus(octokit, resultComment, similarCommentId, isCompleteArr, TASK_LIST_ITEM) {
    const commentBody = getGithubComment(octokit, resultComment, similarCommentId);

    while ((match = TASK_LIST_ITEM.exec(commentBody)) !== null) {
        var isComplete = match[1] != " ";
        var itemText = match[2];

        if (isComplete && !isCompleteArr.includes(itemText)) {
            console.log(`${itemText} is complete ✅`);
        } else {
            console.log(`${itemText} has not been completed yet ❌`);
        }
    }
}

async function timer(timeout, octokit, similarCommentId, resultComment, TASK_LIST_ITEM) {
    printTaskListCompletionStatus(octokit, resultComment, similarCommentId, isCompleteArr, TASK_LIST_ITEM);

    console.log("Starting the timer...");
    var sec = timeout * 60;
    var interval = setInterval(async function() {
        console.log(`You have ${sec} seconds left and ${isCompleteArr.length} tasks currently completed`);

        updateTaskListCompletion(isCompleteArr, octokit, resultComment, similarCommentId, TASK_LIST_ITEM);

        sec--;

        if (sec < 0 || isCompleteArr.length == count && count != 0) {
            console.log(`Clearing the timeout with sec = ${sec} and isCompleteArr.length = ${isCompleteArr.length}`);
            clearInterval(interval);
        }
    }, 1000);

    if(isCompleteArr.length != count) {
        core.setFailed("The timer has ended and not all the tasks have been completed, failing the workflow...");
    }
}

module.exports = timer;