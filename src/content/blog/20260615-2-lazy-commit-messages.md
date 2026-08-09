---
title: "Lazy commit messages"
slug: "20260615-2-lazy-commit-messages"
pubDate: 2026-06-15
description: "I wrote an agent skill to reduce hassle."
author: "Matt F"
tags: ["git", "llms", "programming", "projects", "skills", "tools"]
---

Writing git commit messages is an important and incredibly difficult aspect of programming. After making a large amount of changes, I don't always want to go back over everything I've reviewed. Naturally IDEs allow you to generate messages inline but even this is not perfect. They sparingly generate messages in the same format, and configuring agent instructions does not always work.

Good commit messages require context you lose the moment you move on to the next thing. You know why you made the change, the diff knows what changed, but translating that into a message that makes sense to someone else - or to you in three weeks - takes effort.

## A better way

I wanted something that could look at the staged changes and write a reasonable message automatically.

Enter the _commit_msg_ skill.

It reads `git diff --cached`, generates a [conventional commit](https://conventionalcommits.org/) message, and prints it. I still review it and hit enter. The agent just does the first pass I wasn't going to do myself.

The skill itself is a short markdown file with a clear pipeline:

```md
## Steps

1. Read staged diff
2. Write conventional commit message (see format below)
3. Execute `.git/hooks/commit-msg` against the message if the hook exists (read-only — safe to run)
4. Print it — don't stage, amend, or commit
```

No hidden complexity. The agent reads the diff, writes a message, checks it against your linting rules, and shows you. Step 4 is the important one - it doesn't commit for you.

On the topic of linting: step 3 will run your .git/hooks/commit-msg hook against the generated message if one exists. This is read-only; it doesn't modify anything. But it means if your project uses [commitlint](https://commitlint.js.org/) or a similar tool, the agent respects those rules.

## Check it out

It is a small tool that does one thing. It won't revolutionise your workflow, but if you've ever stared at a blank commit message box after a long session, it's worth a look. The source is on GitHub at [ma-tf/skills](https://github.com/ma-tf/skills), and you can install it with:

```sh
npx skills add ma-tf/skills
```
