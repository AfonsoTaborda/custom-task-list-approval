const core = require('@actions/core');
const runTimer = require('./src/timer');
const {createGithubComment, getGithubComment, listGithubComments, initializeComment, getSimilarGithubCommentId} = require('./src/github-comment');
const pause = require('./src/pauser');

async function run() {
    try {
        // This should be a token with access to your repository scoped in as a secret.
        // The YML workflow will need to set myToken with the GitHub Secret Token
        // myToken: ${{ secrets.GITHUB_TOKEN }}
        // https://help.github.com/en/actions/automating-your-workflow-with-github-actions/authenticating-with-the-github_token#about-the-github_token-secret
        var [octokit, timeout, resultComment, userChecklist, title, body] = await initializeComment();

        var pullRequestComments = await listGithubComments(octokit);

        // Check if there are similar comments already posted
        // Otherwise `similarCommentId` will be `undefined`
        var similarCommentId = getSimilarGithubCommentId(pullRequestComments, title, body, userChecklist);

        if (resultComment === "") {
            throw "The comment to be added is empty!";
        }

        if (typeof similarCommentId === "undefined") {
            var comment = await createGithubComment(octokit, resultComment);
            similarCommentId = comment.id;

            /*while(typeof similarCommentId === "undefined") {
                var pullRequestComments = await listGithubComments(octokit);
                var similarCommentId = getSimilarGithubCommentId(pullRequestComments, title, body, userChecklist);
                var comment = await getGithubComment(octokit, similarCommentId);
            }*/
        }

        runTimer(timeout, octokit, similarCommentId);
      } catch (error) {
        core.setFailed(error);
      }
}

run();