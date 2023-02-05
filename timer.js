const github = require('@actions/github');

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

async function timer(timeout, similarCommentsCount, similarCommentId, resultComment, octokit, TASK_LIST_ITEM) {
    // If there are no similar comments, then post the comment
    if (similarCommentsCount === 0) {
        console.log("No similar comments found, creating the comment...");
        const { data: comment } = await octokit.rest.issues.createComment({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            issue_number: github.context.issue.number,
            body: resultComment,
        });

        console.log(`Created a new checklist comment ${comment.body}`);
    } else {
        const { data: comment } = await octokit.rest.issues.getComment({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            comment_id: similarCommentId,
        });

        console.log(`Fetched the existing comment ${comment.body}`);
    }

    if (!comment) {
        throw "The source comment could not be fetched";
    }

    var interval = setInterval(async function() {
        console.log("Starting the timer...");
        var sec = timeout * 60;

        var isCompleteArr = [];
        let count = 0;
        printTaskListCompletionStatus(comment.body, count, isCompleteArr, TASK_LIST_ITEM);

        sec--;

        if (sec < 0 || isCompleteArr.length == count && count != 0) {
            console.log(`Clearing the timeout with sec = ${sec} and isCompleteArr.length = ${isCompleteArr.length}`);
            clearInterval(interval);
        }
    }, 1000);
}

module.exports = timer;