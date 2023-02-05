const github = require('@actions/github');

module.exports.timer = async function (timeout, similarCommentsCount, similarCommentId, resultComment, octokit, TASK_LIST_ITEM) {
    console.log("Starting the timer...");
    var sec = timeout * 60;

    // If there are no similar comments, then post the comment
    if (similarCommentsCount === 0) {
        console.log("No similar comments found, creating the comment...");
        var { data: comment } = await octokit.rest.issues.createComment({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            issue_number: github.context.issue.number,
            body: resultComment,
        });

        console.log(`Created a new checklist comment ${comment.body}`);
    } else {
        var { data: comment } = await octokit.rest.issues.getComment({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            comment_id: similarCommentId,
        });

        console.log(`Fetched the existing comment ${comment.body}`);
    }

    if (!comment) {
        throw "The source comment could not be fetched";
    }

    var isCompleteArr = [];
    let count = 0;
    while ((match = TASK_LIST_ITEM.exec(comment.body)) !== null) {
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

    sec--;

    if (sec < 0 || isCompleteArr.length == count && count != 0) {
        console.log(`Clearing the timeout with sec = ${sec} and isCompleteArr.length = ${isCompleteArr.length}`);
        clearInterval(timer);
    }
}