const github = require('@actions/github');

async function getGithubComment(octokit, resultComment, similarCommentId) {
    // If there are no similar comments, then post the comment
    if (!similarCommentId) {
        console.log("No similar comments found, creating the comment...");
        var { data: comment } = await octokit.rest.issues.createComment({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            issue_number: github.context.issue.number,
            body: resultComment,
        });
    } else {
        var { data: comment } = await octokit.rest.issues.getComment({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            comment_id: similarCommentId,
        });
    }

    if (!comment) {
        throw "The source comment could not be fetched";
    }

    return comment;
}

module.exports = getGithubComment;