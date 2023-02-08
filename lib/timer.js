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

async function getTaskListCount(commentId) {
    var count = 0;

    const commentBody = await getGithubComment(commentId);

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

async function runTimer(commentId) {
    completedTasksArr = await updateTaskListCompletion(commentId);
    const count = await getTaskListCount(commentId);

    console.log(`🏃 Found ${count} tasks to complete, starting the timer 🏃`);
    var sec = inputs.timeout * 60;
    var givenTime = sec;

    var interval = setInterval(async function() {
        completedTasksArr = await updateTaskListCompletion(commentId);
    
        if(inputs.debugLogs) {
            console.log(`⌛ You have ${sec} seconds and ${completedTasksArr.length} tasks completed`);
        }

        sec--;

        if (sec < 0 || completedTasksArr.length == count && count != 0) {
            if(completedTasksArr.length != count) {
                core.setFailed("⏰ The timer has ended and not all the tasks have been completed, failing the workflow...");
            }

            const finishedCount = (sec > 60 ? sec/60 : sec);
            const unit = sec > 60 ? "minutes" : "seconds";
            givenTime = givenTime > 60 ? givenTime/60 : givenTime;
            const completionTime = givenTime - finishedCount;

            console.log(`🎉 You've succesfully completed all ${completedTasksArr.length} tasks in ${completionTime} ${unit} 🎉`);

            if(inputs.deleteCommentAfterCompletion) {
                await deleteGithubComment(commentId);
            }

            clearInterval(interval);
            return;
        }
    }, 1000);
}

module.exports = {
    runTimer,
    updateTaskListCompletion,
    getTaskListCount
};