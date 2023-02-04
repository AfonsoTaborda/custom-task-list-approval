const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
    try {
        // This should be a token with access to your repository scoped in as a secret.
        // The YML workflow will need to set myToken with the GitHub Secret Token
        // myToken: ${{ secrets.GITHUB_TOKEN }}
        // https://help.github.com/en/actions/automating-your-workflow-with-github-actions/authenticating-with-the-github_token#about-the-github_token-secret
        const myToken = core.getInput('token');
        const userCommentBody = core.getInput('body');
        if(!typeof userCommentBody === 'string') [
            core.setFailed("The body input is not of type 'string'!")
        ]

        const octokit = github.getOctokit(myToken);

        const { data: pullRequestComments } = await octokit.rest.issues.listComments({
            owner: github.context.owner,
            repo: github.context.repo,
            issue_number: github.context.pull_number,
        });

        var similarCommentsCount = 0;

        if(pullRequestComments.length != 0) {
            for (let comment of pullRequestComments) {
                if(comment.body.includes(userCommentBody)) {
                    similarCommentsCount++;
                }
            }
        }

        if(similarCommentsCount === 0) {
            await octokit.rest.issues.createComment({
                owner: github.context.owner,
                repo: github.context.repo,
                issue_number: github.context.issue_number,
                body: userCommentBody,
            });
        }
      } catch (error) {
        console.log(error.data);
        core.setFailed(error.message);
      }
}

run();