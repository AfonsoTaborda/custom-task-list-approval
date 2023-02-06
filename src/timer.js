const core = require('@actions/core');
const {getGithubComment,deleteGithubComment} = require('./github-comment');

const CHECK_LIST_REGEX = /\[(x|X|\s)\](.*)/g;
let completedTasksArr = [];

async function updateTaskListCompletion(octokit, commentId) {
    var commentBody = await getGithubComment(octokit, commentId);

    while ((match = CHECK_LIST_REGEX.exec(commentBody)) !== null) {
        var isComplete = match[1] != " ";
        var itemText = match[2];

        if (isComplete && !completedTasksArr.includes(itemText)) {
            completedTasksArr.push(itemText);
        }

        if(!isComplete && completedTasksArr.includes(itemText)) {
            const index = completedTasksArr.indexOf(itemText);

            if (index > -1) {
                completedTasksArr.splice(index, 1);
            }
        }
    }

    return completedTasksArr;
}

async function getTaskListCount(completedTasksArr, octokit, commentId) {
    var count = 0;

    const commentBody = await getGithubComment(octokit, commentId);

    while ((match = CHECK_LIST_REGEX.exec(commentBody)) !== null) {
        var isComplete = match[1] != " ";
        var itemText = match[2];

        count++;

        if (isComplete && !completedTasksArr.includes(itemText)) {
            console.log(`${itemText} is complete ✅`);
        } else {
            console.log(`${itemText} has not been completed yet ❌`);
        }
    }

    return count;
}

async function runTimer(timeout, octokit, commentId) {
    const count = await getTaskListCount(completedTasksArr, octokit, commentId, CHECK_LIST_REGEX);
    var completedTasksArr = await updateTaskListCompletion(octokit, commentId, CHECK_LIST_REGEX);

    console.log(`Found ${count} tasks to complete, starting the timer...`);
    var sec = timeout * 60;
    var interval = setInterval(async function() {
        completedTasksArr = await updateTaskListCompletion(octokit, commentId, CHECK_LIST_REGEX);

        console.log(`You have ${sec} seconds and ${completedTasksArr.length} tasks completed`);

        sec--;

        if (sec < 0 || completedTasksArr.length == count && count != 0) {
            if(completedTasksArr.length != count) {
                core.setFailed("The timer has ended and not all the tasks have been completed, failing the workflow...");
            }

            console.log(`Clearing the timeout with sec = ${sec} and completedTasksArr.length = ${completedTasksArr.length}`);
            await deleteGithubComment(octokit, commentId);
            clearInterval(interval);
        }
    }, 1000);
}

module.exports = runTimer;