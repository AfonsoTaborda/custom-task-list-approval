const github = require('@actions/github');

const octokit = github.getOctokit(inputs.myToken);

module.exports = octokit;