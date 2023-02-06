const core = require('@actions/core');
const runTimer = require('./src/timer');
const {createGithubComment, initializeComment} = require('./src/github-comment');

const CHECK_LIST_REGEX = /\[(x|X|\s)\](.*)/g;

async function run() {
    try {
        // This should be a token with access to your repository scoped in as a secret.
        // The YML workflow will need to set myToken with the GitHub Secret Token
        // myToken: ${{ secrets.GITHUB_TOKEN }}
        // https://help.github.com/en/actions/automating-your-workflow-with-github-actions/authenticating-with-the-github_token#about-the-github_token-secret
        var [octokit, timeout, pullRequestComments, resultComment, userChecklist, title, body] = await initializeComment();

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

        if (resultComment === "") {
            throw "The comment to be added is empty!";
        }

        if (typeof similarCommentId === "undefined") {
            var comment = await createGithubComment(octokit, resultComment);
            similarCommentId = comment.id;
        }

        runTimer(timeout, octokit, similarCommentId, CHECK_LIST_REGEX);
      } catch (error) {
        core.setFailed(error);
      }
}

run();