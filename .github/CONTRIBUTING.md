# Contributing to [Drash](https://github.com/drashland/deno-drash/)

## Bug Reports

A bug is a *demonstrable problem* that is caused by the code in the repository. Good bug reports are extremely helpful, so thanks!
If you want to report a bug, click [here](https://github.com/drashland/deno-drash/issues/new?assignees=&labels=bug&template=bug_report.md&title=).

## Feature Requests
Feature requests are welcome. But take a moment to find out whether your idea fits with the scope and aims of the project. It's up to *you* to make a strong case to convince the project developer of the merits of this feature. Please provide as much detail and context as possible. If you want to request a feature, click [here](https://github.com/drashland/deno-drash/issues/new?assignees=&labels=enhancement&template=feature_request.md&title=).

## Pull Requests

Please **ask first** before embarking on any significant pull request (e.g. implementing features, refactoring code), otherwise you risk spending a lot of time working on something that the project's developers might not want to merge into the project.

1. [Fork](https://help.github.com/articles/fork-a-repo/) the project, clone your fork, and configure the remotes:
    ```bash
    # Clone your fork of the repo into the current directory
    git clone https://github.com/<your-username>/deno-drash.git
    # Navigate to the newly cloned directory
    cd deno-drash
    # Assign the original repo to a remote called "upstream"
    git remote add upstream https://github.com/drashland/deno-drash.git
    ```
2. If you cloned a while ago, get the latest changes from upstream:
    ```bash
    git checkout master
    git pull upstream master
    ```
3. Create a new topic branch (off the main project development branch) to contain your feature, change, or fix:
    ```bash
    git checkout -b <topic-branch-name>
    ```
4. Push your topic branch up to your fork:
    ```bash
    git push origin <topic-branch-name>
    ```
5. [Open a Pull Request](https://help.github.com/articles/about-pull-requests/) with a clear title and description against the `master` branch.

***Note:*** It is recommended that you *"clean up"* your commits before opening a pull request. Maybe take a look at `git rebase --interactive` to do this.

## Code Guidelines
- Code should follow [Deno Style Guide](https://deno.land/std/style_guide.md).

- As a rule of thumb, always format your code using `deno fmt` cli before opening your pull request. If you forgot to corectly format it, just add a commit with the message *deno fmt* (`git commit -m "deno fmt"`).

## License
By submitting a patch, you agree to allow the project owners to license your work under the terms of the [MIT License](../LICENSE).

