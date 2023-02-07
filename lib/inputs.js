const core = require('@actions/core');

const inputs = {
    myToken: core.getInput('token'),
    commentTaskList: core.getInput('tasklist-items'),
    title: core.getInput('comment-title'),
    body: core.getInput('comment-body'),
    timeout: parseInt(core.getInput('completion-timeout')),
    deleteCommentAfterCompletion: core.getInput('delete-comment-after-completion')  == 'true',
    debugLogs: core.getInput('debug-logs') == 'true',
}

module.exports = inputs;