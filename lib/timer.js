const core = require('@actions/core');
const {GetGithubComment,DeleteGithubComment} = require('./github-comment');
const inputs = require('./inputs');
const CHECK_LIST_REGEX = require('./constants');

let completedTasksArr = [];

async function UpdateTaskListCompletion(commentId) {
    var commentBody = await GetGithubComment(commentId);

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

async function GetTaskListCount(commentId) {
    var count = 0;

    const commentBody = await GetGithubComment(commentId);

    while ((match = CHECK_LIST_REGEX.exec(commentBody)) !== null) {
        var isComplete = match[1] != " ";
        var itemText = match[2];

        count++;

        if(inputs.debugLogs) {
            if (isComplete || completedTasksArr.includes(itemText)) {
                console.log(`✅ ${itemText}`);
            } else {
                console.log(`❌ ${itemText}`);
            }
        }
    }

    return count;
}

async function RunTimer(commentId) {
    completedTasksArr = await UpdateTaskListCompletion(commentId);
    const count = await GetTaskListCount(commentId);

    console.log(`🏃 Found ${count} tasks to complete, starting the timer 🏃`);
    var sec = inputs.timeout;
    const givenTime = sec;

    var interval = setInterval(async function() {
        var unit = sec >= 60 ? "minutes" : "seconds";
        completedTasksArr = await UpdateTaskListCompletion(commentId);
    
        if(inputs.debugLogs) {
            console.log(`⌛ You have ${sec >= 60 ? sec/60 : sec} ${unit} and ${completedTasksArr.length} tasks completed`);
        }

        sec--;

        if (sec < 0 || completedTasksArr.length == count && count != 0) {
            if(completedTasksArr.length != count) {
                core.setFailed("⏰ The timer has ended and not all the tasks have been completed, failing the workflow...");
            }

            const finishedCount = sec;
            const completionTime = Math.abs((givenTime - finishedCount) >= 60 ? sec/60 : sec);
            unit = (givenTime - finishedCount) >= 60 ? "minutes" : "seconds";

            console.log(`🎉 You've succesfully completed all ${completedTasksArr.length} tasks in ${completionTime} ${unit} 🎉`);

            clearInterval(interval);
            return;
        }
    }, 1000);

    if(inputs.deleteCommentAfterCompletion) {
        await DeleteGithubComment(commentId);
    }
}

module.exports = {
    RunTimer,
    UpdateTaskListCompletion,
    GetTaskListCount
};