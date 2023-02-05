const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
    try {
        // This should be a token with access to your repository scoped in as a secret.
        // The YML workflow will need to set myToken with the GitHub Secret Token
        // myToken: ${{ secrets.GITHUB_TOKEN }}
        // https://help.github.com/en/actions/automating-your-workflow-with-github-actions/authenticating-with-the-github_token#about-the-github_token-secret
        const myToken = core.getInput('token');
        const userChecklist = core.getInput('checklist-items');
        const title = core.getInput('comment-title');
        const header = core.getInput('comment-header');
        const body = core.getInput('comment-body');

        if(!typeof userChecklist === 'string') {
            core.setFailed("The body input is not of type 'string'!");
        }

        const octokit = github.getOctokit(myToken);
        var resultComment = "";

        if (title) {
            resultComment += "# " + title + "\n";
        }

        if (body) {
            resultComment += body + "\n";
        }

        const { data: pullRequestComments } = await octokit.rest.issues.listComments({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            issue_number: github.context.issue.number,
        });

        var similarCommentsCount = 0;
        if(pullRequestComments.length != 0) {
            for (let comment of pullRequestComments) {
                if(comment.body.includes(userChecklist)) {
                    similarCommentsCount++;
                }
            }
        }

        // Loop through the user added checklist items,
        // And append them into the resulting comment
        for (let item of userChecklist.split(";")) {
            resultComment += "- [ ] " + item + "\n";
        }

        if(resultComment === "") {
            throw "The comment to be added is empty!";
        }

        // If there are no similar comments, then post the comment
        if(similarCommentsCount === 0) {
            await octokit.rest.issues.createComment({
                owner: github.context.repo.owner,
                repo: github.context.repo.repo,
                issue_number: github.context.issue.number,
                body: resultComment,
            });
        }
      } catch (error) {
        core.setFailed(error);
      }
}

run();