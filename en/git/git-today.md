---
title: 'git-today: A Script to Help Me Fill Out Daily Report'
keywords: 'git-today, git log, daily report, bash script'
description: 'This is an article about the practical application of git log.'
changefreq: 'monthly'
---

## Background

Our company requires us to write a daily report every day. Sometimes, this becomes a tedious task because it’s easy to forget exactly what we’ve done. Fortunately, as developers, we naturally leave traces of our work: through git messages. So, I decided to write a bash script using `git log` to help me fill out my daily report.

## Implementation Process

### Creating the Script

First, I created the script in a git repository for testing purposes:

```sh
cd ~/Project/local/vue-playground
touch ./git-today.sh
chmod +x ./git-today.sh
vim ./git-today.sh
```

Then, I used `git log --author="xxx"` to get my commit history:

```sh
#!/bin/bash

USER=$(git config user.name)
git log --author="$USER"
```

This will output something like this:

```text
bash-3.2$ ./git-today.sh
commit c5cb1523390b0339581ee31ade23d14650a80ec4 (HEAD -> main)
Author: leishanglin <reasonly8@sina.com>
Date:   Sat Mar 1 07:52:45 2025 +0800

    feat: Remove code related to @vitejs/plugin-vue

commit b52bc6c45d163fe5ecd4c93cb90d30cfd2c756e6
Author: leishanglin <reasonly8@sina.com>
Date:   Sat Mar 1 07:51:22 2025 +0800

    feat: Set up vue alias for a build version that supports template compiler

commit 2f56f4f160bde411551f210b0b96ee9ee8b84584
Author: leishanglin <reasonly8@sina.com>
Date:   Wed Feb 26 13:31:53 2025 +0800

    init
```

The output is fine, but not quite optimal. First, it includes too much unnecessary information. Second, it doesn’t limit the results to “only today’s commits.”

### Streamlining and Filtering

To address these two issues, I made improvements to the script:

```sh
#!/bin/bash

# Get today's date
TODAY=$(date +%Y-%m-%d)

# Get the current user's name
USER=$(git config user.name)

# Filter git log to get today's commit records
git log --author="$USER" --since="$TODAY 00:00" --until="$TODAY 23:59" --oneline

```

**Explanation**:

- `date +%Y-%m-%d` is a command to get the current date in YYYY-MM-DD format, e.g., 2025-03-01.
- `git config user.name` retrieves my git username to filter the logs.
- `--since` and `--until` are used to get today’s records, and `--oneline` makes the output more concise.

When I run the script, I get output like this:

```text
bash-3.2$ ./git-today.sh
c5cb152 (HEAD -> main) feat: Remove code related to @vitejs/plugin-vue
b52bc6c feat: Set up vue alias for a build version that supports template compiler
```

This is the ideal output. We can copy and paste this information to fill out the daily report.

### Creating a Symlink

Currently, this script is only in a specific repository (vue-playground), and it’s not very portable. So, I need to register it globally so that I can call it from anywhere.

```sh
sudo ln -s /Users/leishanglin/Projects/local/git-today/git-today.sh /usr/bin/gt
```

I created a symlink `gt` in the `/usr/bin/` directory, so now I can execute the `gt` command from anywhere to achieve the same result.

**Note**:

1. The operation implicitly assumes that the git-today.sh script was moved to the `/git-today/` directory.
2. When creating the symlink, make sure to use the absolute path.

Finally, let’s test it:

```text
➜ gt
c5cb152 (HEAD -> main) feat: Remove code related to @vitejs/plugin-vue
b52bc6c feat: Set up vue alias for a build version that supports template compiler
```

Well, it basically achieves the effect I was looking for.
