const github = require('@actions/github');
const core = require('@actions/core');
const inputs = require('./inputs');
const octokit = require('./octokit-client');
const {CHECK_LIST_REGEX} = require('./constants');

var mapCommentSimilar = new Map();

async function InitializeComment() {
    if (!typeof inputs.commentTaskList === 'string') {
        core.setFailed("The body input is not of type 'string'!");
    }

    var resultComment = "";

    if (inputs.title) {
        resultComment += "# " + inputs.title + "\n";
    }

    if (inputs.body) {
        resultComment += inputs.body + "\n";
    }

    // Loop through the user added checklist items,
    // And append them into the resulting comment
    for (let item of inputs.commentTaskList.split(";")) {
        if(item) {
            item = item.trim();
            resultComment += "- [ ] " + item + "\n";
        }
    }

    if (resultComment === "") {
        core.setFailed("The comment to be added is empty!");
    }

    console.log("Finished initializing the comment ⚙️");

    return [resultComment];
}

async function CreateGithubComment(commentBody) {
    console.log("No similar comments found, creating the comment...");
    var { data: comment } = await octokit.rest.issues.createComment({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        issue_number: github.context.issue.number,
        body: commentBody,
    });

    return comment;
}

async function GetGithubComment(commentId) {
    // If there are no similar comments, then post the comment
    var { data: comment } = await octokit.rest.issues.getComment({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        comment_id: commentId,
    });
    
    if (!comment) {
        core.setFailed("The source comment could not be fetched");
    }
    
    return comment.body;
}

async function GetSimilarGithubCommentId(pullRequestComments) {
    // Check if there are similar comments already posted
    var similarCommentId;
    var similarComments = [];
    var similarCommentCount = 0;

    if (pullRequestComments.length != 0) {
        for (let comment of pullRequestComments) {
            var similarTaskCount = 0;
            for (task of inputs.commentTaskList.split(";")) {
                while ((match = CHECK_LIST_REGEX.exec(comment.body)) !== null) {
                    if(match[2].trim() === task.trim()) {
                        similarTaskCount++;
                    }
                }
            }
            if(similarTaskCount === inputs.commentTaskList.split(";").length - 1) {
                console.log();
                similarCommentId = comment.id;
                similarComments.push(comment.id);
                similarCommentCount++;
                mapCommentSimilar.set(comment.id, similarCommentCount);
                if(inputs.debugLogs) {
                    console.log(`A similar task list has been found from a comment with id: ${similarCommentId}`);
                }
            } else {
                similarCommentId = undefined;
            }
        }
    }

    if(similarComments.length > 0) {
        similarCommentId = undefined;
    } else {
        similarCommentId = similarComments.slice(-1)[0];
    }

    deletePreviousUnfinishedComments(similarCommentId);

    return similarCommentId;
}

async function ListGithubComments() {
    const { data: pullRequestComments } = await octokit.rest.issues.listComments({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        issue_number: github.context.issue.number,
    });

    return pullRequestComments;
}

async function DeleteGithubComment(commentId) {
        await octokit.rest.issues.deleteComment({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            comment_id: commentId,
        });
}

async function deletePreviousUnfinishedComments(similarCommentId) {
    for (let [key,value] of mapCommentSimilar) {
        if (value > 0 && key !== similarCommentId && inputs.deletePreviousComments) {
            console.log(`Deleting the comment with ID: ${key}`);
            await DeleteGithubComment(key);
        }
    }
}

module.exports = {
    InitializeComment,
    CreateGithubComment,
    GetGithubComment,
    GetSimilarGithubCommentId,
    ListGithubComments,
    DeleteGithubComment,
};
