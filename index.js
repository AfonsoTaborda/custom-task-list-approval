const core = require('@actions/core');
const {createGithubComment, listGithubComments, initializeComment, getSimilarGithubCommentId} = require('./lib/github-comment');
const CHECK_LIST_REGEX = require('./lib/constants');
const inputs = require('./lib/inputs');
const runTimer = require('./lib/timer');

async function run() {
    try {
        var [resultComment] = await initializeComment();

        var pullRequestComments = await listGithubComments();

        // Check if there are similar comments already posted
        // Otherwise `similarCommentId` will be `undefined`
        var similarCommentId = getSimilarGithubCommentId(pullRequestComments);

        if (typeof similarCommentId === "undefined") {
            var comment = await createGithubComment(resultComment);
            similarCommentId = comment.id;
        }

        if(typeof inputs.timeout !== "undefined") {
          runTimer(similarCommentId);
        } else {
          completedTasksArr = await updateTaskListCompletion(similarCommentId);

          if(completedTasksArr.length == count && count != 0) {
              console.log(`All ${count} tasks have been successfully completed!`);
              await deleteGithubComment(commentId);
          } else {
              core.setFailed(`Not all tasks have been completed, only ${completedTasksArr.length} out of ${count} have been completed.\n Re-run this job once the task list has been completed.`);
          }
        }
      } catch (error) {
        core.setFailed(error);
      }
}

run();