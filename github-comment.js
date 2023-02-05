const github = require('@actions/github');
const pause = require('./pauser');

async function createGithubComment(octokit, commentBody) {
    console.log("No similar comments found, creating the comment...");
    var { data: comment } = await octokit.rest.issues.createComment({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        issue_number: github.context.issue.number,
        body: commentBody,
    });

    pause(10000);

    return comment.body;
}

async function getGithubComment(octokit, commentId) {
    // If there are no similar comments, then post the comment
    var { data: comment } = await octokit.rest.issues.getComment({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        comment_id: commentId,
    });

    if (!comment) {
        throw "The source comment could not be fetched";
    }

    return comment.body;
}

async function deleteGithubComment(octokit, commentId) {
    await octokit.rest.issues.deleteComment({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        comment_id: commentId,
    });
}

module.exports = {
    getGithubComment,
    createGithubComment,
    deleteGithubComment,
};