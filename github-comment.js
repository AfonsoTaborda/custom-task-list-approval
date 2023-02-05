const github = require('@actions/github');
const core = require('@actions/core');
const pause = require('./pauser');

const inputs = {
    myToken: core.getInput('token'),
    userChecklist: core.getInput('checklist-items'),
    title: core.getInput('comment-title'),
    body: core.getInput('comment-body'),
    timeout: parseInt(core.getInput('completion-timeout')),
}

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

    const { data: pullRequestComments } = await octokit.rest.issues.listComments({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        issue_number: github.context.issue.number,
    });

    // Loop through the user added checklist items,
    // And append them into the resulting comment
    for (let item of inputs.userChecklist.split(";")) {
        if(item) {
            resultComment += "- [ ] " + item + "\n";
        }
    }

    return octokit, inputs.timeout, pullRequestComments, resultComment, inputs.userChecklist, inputs.title, inputs.body;
}

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
                await pause(2000);
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
    initializeComment,
    getGithubComment,
    createGithubComment,
    deleteGithubComment,
};