const core = require('@actions/core');
const runTimer = require('./src/timer');
const {createGithubComment, listGithubComments, initializeComment, getSimilarGithubCommentId} = require('./src/github-comment');
const inputs = require('./src/inputs');

async function run() {
    try {
        // This should be a token with access to your repository scoped in as a secret.
        // The YML workflow will need to set myToken with the GitHub Secret Token
        // myToken: ${{ secrets.GITHUB_TOKEN }}
        // https://help.github.com/en/actions/automating-your-workflow-with-github-actions/authenticating-with-the-github_token#about-the-github_token-secret
        var [octokit, resultComment] = await initializeComment();

        var pullRequestComments = await listGithubComments(octokit);

        // Check if there are similar comments already posted
        // Otherwise `similarCommentId` will be `undefined`
        var similarCommentId = getSimilarGithubCommentId(pullRequestComments);

        if (resultComment === "") {
            throw "The comment to be added is empty!";
        }

        if (typeof similarCommentId === "undefined") {
            var comment = await createGithubComment(octokit, resultComment);
            similarCommentId = comment.id;
        }

        runTimer(octokit, similarCommentId);
      } catch (error) {
        core.setFailed(error);
      }
}

run();