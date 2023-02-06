const core = require('@actions/core');
const {getGithubComment,deleteGithubComment} = require('./github-comment');
const inputs = require('./inputs');
const CHECK_LIST_REGEX = require('./constants');

let completedTasksArr = [];

async function updateTaskListCompletion(commentId) {
    var commentBody = await getGithubComment(commentId);

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

async function getTaskListCount(completedTasksArr, commentId) {
    var count = 0;

    const commentBody = await getGithubComment(commentId);

    while ((match = CHECK_LIST_REGEX.exec(commentBody)) !== null) {
        var isComplete = match[1] != " ";
        var itemText = match[2];

        count++;

        if (isComplete && completedTasksArr.includes(itemText)) {
            console.log(`${itemText} is complete ✅`);
        } else {
            console.log(`${itemText} has not been completed yet ❌`);
        }
    }

    return count;
}

async function runTimer(commentId) {
    var completedTasksArr = await updateTaskListCompletion(commentId, CHECK_LIST_REGEX);
    const count = await getTaskListCount(completedTasksArr, commentId, CHECK_LIST_REGEX);

    console.log(`Found ${count} tasks to complete, starting the timer...`);
    var sec = inputs.timeout * 60;

    var interval = setInterval(async function() {
        completedTasksArr = await updateTaskListCompletion(commentId, CHECK_LIST_REGEX);
    
        if(inputs.debugLogs) {
            console.log(`You have ${sec} seconds and ${completedTasksArr.length} tasks completed`);
        }

        sec--;

        if (sec < 0 || completedTasksArr.length == count && count != 0) {
            if(completedTasksArr.length != count) {
                core.setFailed("The timer has ended and not all the tasks have been completed, failing the workflow...");
            }

            console.log(`Clearing the timeout with sec = ${sec} and completedTasksArr.length = ${completedTasksArr.length}`);
            await deleteGithubComment(commentId);
            clearInterval(interval);
            return;
        }
    }, 1000);
}

module.exports = runTimer;