# Custom Task List Approval Github Action
A Github action for posting review tasklists on issues/pull requests through comments built with Javascript.
![image](https://user-images.githubusercontent.com/10180317/217216561-74350607-4b99-4c05-9b89-eb5b9866bccd.png)

# Usage
There are several options to customize the behaviour of the Github Action on the creation as well as deletion of the task list once completed (by setting the `delete-comment-after-completion` input).

The level of logging on the job can also be set through the `debug-logs` input.
![image](https://user-images.githubusercontent.com/10180317/217272701-1d429cc4-b4a9-4ce3-a025-333cee01be6c.png)

A timer can also be set in cases where the task list is expected to be completed in a short amount of time. You can also set the timeout value (in minutes) which defaults to 1 hour if not set.

> **Disclaimer:** When using the timer, this will keep the job running until whether the task list items are all completed, or the timer reaches the timeout. This also has the potential or reaching the Github API limits.

``` yml
on:
  pull_request:
    types: [opened]

jobs:
  create-tasklist:
    runs-on: ubuntu-latest
    name: Create a Tasklist
    steps:
      - name: Custom Tasklist Approval
        uses: AfonsoTaborda/custom-task-list-approval@v1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          tasklist-items: | # Each task item is delimited by a ";" character
            TODO 1;
            TODO laundry;
            Clean the car;
          comment-title: "TODO List"
          comment-body: "Please finish the TODO list below before moving to the next step:"
          completion-timeout: 1 # Optional, if set it will run a timer until timing out
          delete-comment-after-completion: true # Optional
          debug-logs: true # Optional, control's the logging debug-logs setting for the timer (if enabled)
```

## Required Inputs
- `token`
- `tasklist-items`

# License
MIT
