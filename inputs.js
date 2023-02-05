const inputs = {
    myToken: core.getInput('token'),
    userChecklist: core.getInput('checklist-items'),
    title: core.getInput('comment-title'),
    body: core.getInput('comment-body'),
    timeout: parseInt(core.getInput('completion-timeout')),
}

module.exports = inputs;