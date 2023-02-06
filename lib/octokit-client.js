const github = require('@actions/github');
const inputs = require('./inputs');

const octokit = github.getOctokit(inputs.myToken);

module.exports = octokit;