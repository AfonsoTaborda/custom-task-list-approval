const core = require('@actions/core');
const {CreateGithubComment, ListGithubComments, InitializeComment, GetSimilarGithubCommentId, DeleteGithubComment} = require('./lib/github-comment');
const inputs = require('./lib/inputs');
const {RunTimer, UpdateTaskListCompletion, GetTaskListCount} = require('./lib/timer');

async function run() {
    try {
        var [resultComment] = await InitializeComment();

        var pullRequestComments = await ListGithubComments();

        // Check if there are similar comments already posted
        // Otherwise `commentID` will be `undefined`
        var commentID = await GetSimilarGithubCommentId(pullRequestComments);

        if (typeof commentID === "undefined") {
            var comment = await CreateGithubComment(resultComment);
            commentID = comment.id;
        }

        if(inputs.timeout) {
          RunTimer(commentID);
        } else {
          const count = await GetTaskListCount(commentID);
          completedTasksArr = await UpdateTaskListCompletion(commentID);

          if(completedTasksArr.length == count && count != 0) {
              console.log(`All ${count} tasks have been successfully completed!`);
              if(inputs.deleteCommentAfterCompletion) {
                await DeleteGithubComment(commentID);
              }
          } else {
              core.setFailed(`Not all tasks have been completed, only ${completedTasksArr.length} out of ${count} have been completed.\n Re-run this job once the task list has been completed.`);
          }
        }
      } catch (error) {
        core.setFailed(error);
      }
}

run();