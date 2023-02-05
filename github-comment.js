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

    return comment.body;
}

async function getGithubComment(octokit, commentId) {
    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
        try {
            if(retryCount > 0) {
                pause(2000);
            }

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
        } catch(error) {
            console.error(error);
        }
    }
}

async function deleteGithubComment(octokit, commentId) {
    const isToDeleteComment = core.getInput('delete-comment-after-completion');

    if(isToDeleteComment) {
        await octokit.rest.issues.deleteComment({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            comment_id: commentId,
        });
    }
}

module.exports = {
    getGithubComment,
    createGithubComment,
    deleteGithubComment,
};