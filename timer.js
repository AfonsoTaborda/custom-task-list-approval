const core = require('@actions/core');

function printTaskListCompletionStatus(commentBody, count, isCompleteArr, TASK_LIST_ITEM) {
    while ((match = TASK_LIST_ITEM.exec(commentBody)) !== null) {
        var isComplete = match[1] != " ";
        var itemText = match[2];

        count++;

        if (isComplete && !isCompleteArr.includes(itemText)) {
            isCompleteArr.push(itemText);
            console.log(`${itemText} is complete ✅`);
        } else {
            console.log(`${itemText} has not been completed yet ❌`);
        }
    }
}

async function timer(comment, timeout, TASK_LIST_ITEM) {
    if (!comment) {
        throw "The source comment could not be fetched";
    }

    var isCompleteArr = [];
    var count = 0;
    printTaskListCompletionStatus(comment.body, count, isCompleteArr, TASK_LIST_ITEM);

    console.log("Starting the timer...");
    var interval = setInterval(async function() {
        var sec = timeout * 60;

        console.log(`You have ${sec} seconds left and ${isCompleteArr.length} tasks currently completed`);

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