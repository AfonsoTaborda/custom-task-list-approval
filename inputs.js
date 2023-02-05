const core = require('@actions/core');

const inputs = {
    myToken: core.getInput('token'),
    userChecklist: core.getInput('checklist-items'),
    title: core.getInput('comment-title'),
    body: core.getInput('comment-body'),
    timeout: parseInt(core.getInput('completion-timeout')),
    deleteCommentAfterCompletion: core.getInput('delete-comment-after-completion')  == 'true',
}

module.exports = inputs;