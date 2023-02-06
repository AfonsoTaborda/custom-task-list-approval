const core = require('@actions/core');

const inputs = {
    myToken: core.getInput('token'),
    userChecklist: core.getInput('checklist-items'),
    title: core.getInput('comment-title'),
    body: core.getInput('comment-body'),
    runTimer: core.getInput('run-with-timer') == 'true',
    timeout: parseInt(core.getInput('completion-timeout')),
    deleteCommentAfterCompletion: core.getInput('delete-comment-after-completion')  == 'true',
    verbose: core.getInput('verbose') == 'true',
}

module.exports = inputs;