const core = require('@actions/core');
const {createGithubComment, listGithubComments, initializeComment, getSimilarGithubCommentId} = require('./lib/github-comment');
const inputs = require('./lib/inputs');
const {runTimer, updateTaskListCompletion, getTaskListCount} = require('./lib/timer');

async function run() {
    try {
        var [resultComment] = await initializeComment();

        var pullRequestComments = await listGithubComments();

        // Check if there are similar comments already posted
        // Otherwise `commentID` will be `undefined`
        var commentID = getSimilarGithubCommentId(pullRequestComments);

        if (typeof commentID === "undefined") {
            var comment = await createGithubComment(resultComment);
            commentID = comment.id;
        }

        if(inputs.timeout) {
          runTimer(commentID);
        } else {
          const count = await getTaskListCount(commentID);
          completedTasksArr = await updateTaskListCompletion(commentID);

          if(completedTasksArr.length == count && count != 0) {
              console.log(`All ${count} tasks have been successfully completed!`);
              await deleteGithubComment(commentID);
          } else {
              core.setFailed(`Not all tasks have been completed, only ${completedTasksArr.length} out of ${count} have been completed.\n Re-run this job once the task list has been completed.`);
          }
        }
      } catch (error) {
        core.setFailed(error);
      }
}

run();