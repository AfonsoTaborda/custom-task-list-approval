const github = require('@actions/github');
const core = require('@actions/core');
const inputs = require('./inputs');

async function initializeComment() {
    if (!typeof inputs.userChecklist === 'string') {
        core.setFailed("The body input is not of type 'string'!");
    }

    const octokit = github.getOctokit(inputs.myToken);

    var resultComment = "";

    if (inputs.title) {
        resultComment += "# " + inputs.title + "\n";
    }

    if (inputs.body) {
        resultComment += inputs.body + "\n";
    }

    // Loop through the user added checklist items,
    // And append them into the resulting comment
    for (let item of inputs.userChecklist.split(";")) {
        if(item) {
            resultComment += "- [ ] " + item + "\n";
        }
    }

    console.log("Finished initializing the comment variables");

    return [octokit, resultComment];
}

async function createGithubComment(octokit, commentBody) {
    console.log("No similar comments found, creating the comment...");
    var { data: comment } = await octokit.rest.issues.createComment({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        issue_number: github.context.issue.number,
        body: commentBody,
    });

    return comment;
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

function getSimilarGithubCommentId(pullRequestComments, title, body, userChecklist) {
    // Check if there are similar comments already posted
    var similarCommentId;
    if (pullRequestComments.length != 0) {
        for (let comment of pullRequestComments) {
            if(comment.body.includes(title) && comment.body.includes(body) || comment.body.includes(userChecklist.split(";"))) {
                similarCommentId = comment.id;
                console.log(`A similar comment has been found with id: ${similarCommentId}`);
            }
        }
    }

    return similarCommentId;
}

async function listGithubComments(octokit) {
    const { data: pullRequestComments } = await octokit.rest.issues.listComments({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        issue_number: github.context.issue.number,
    });

    return pullRequestComments;
}

async function deleteGithubComment(octokit, commentId) {
    if(inputs.deleteCommentAfterCompletion) {
        await octokit.rest.issues.deleteComment({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            comment_id: commentId,
        });
    }
}

module.exports = {
    initializeComment,
    createGithubComment,
    getGithubComment,
    getSimilarGithubCommentId,
    listGithubComments,
    deleteGithubComment,
};