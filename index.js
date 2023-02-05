const core = require('@actions/core');
const github = require('@actions/github');
const timer = require('./timer');

async function run() {
    try {
        // This should be a token with access to your repository scoped in as a secret.
        // The YML workflow will need to set myToken with the GitHub Secret Token
        // myToken: ${{ secrets.GITHUB_TOKEN }}
        // https://help.github.com/en/actions/automating-your-workflow-with-github-actions/authenticating-with-the-github_token#about-the-github_token-secret
        const myToken = core.getInput('token');
        const userChecklist = core.getInput('checklist-items');
        const title = core.getInput('comment-title');
        const body = core.getInput('comment-body');
        const timeout = parseInt(core.getInput('completion-timeout'));

        const TASK_LIST_ITEM = /\[(x|X|\s)\](.*)/g;

        if (!typeof userChecklist === 'string') {
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

        // Check if there are similar comments already posted
        var similarCommentsCount = 0;
        var similarCommentId;
        if (pullRequestComments.length != 0) {
            for (let comment of pullRequestComments) {
                if(comment.body.includes(title) && comment.body.includes(body) || comment.body.includes(userChecklist.split(";"))) {
                    similarCommentsCount++;
                    similarCommentId = comment.id;
                    console.log(`A similar comment has been found with id: ${similarCommentId}`);
                }
            }
        }

        // Loop through the user added checklist items,
        // And append them into the resulting comment
        for (let item of userChecklist.split(";")) {
            if(item) {
                resultComment += "- [ ] " + item + "\n";
            }
        }

        if (resultComment === "") {
            throw "The comment to be added is empty!";
        }

        // If there are no similar comments, then post the comment
        if (similarCommentsCount === 0) {
            console.log("No similar comments found, creating the comment...");
            var { data: comment } = await octokit.rest.issues.createComment({
                owner: github.context.repo.owner,
                repo: github.context.repo.repo,
                issue_number: github.context.issue.number,
                body: resultComment,
            });

            console.log(`Created a new checklist comment ${comment.body}`);
        } else {
            var { data: comment } = await octokit.rest.issues.getComment({
                owner: github.context.repo.owner,
                repo: github.context.repo.repo,
                comment_id: similarCommentId,
            });

            console.log(`Fetched the existing comment ${comment.body}`);
        }

        timer(comment, timeout, TASK_LIST_ITEM);
      } catch (error) {
        core.setFailed(error);
      }
}

run();