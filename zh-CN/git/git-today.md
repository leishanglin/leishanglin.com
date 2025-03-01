---
title: 'git-today: 一个辅助我填写日报的简单脚本'
keywords: 'git-today, git log, 日报, bash 脚本'
description: '这是一篇关于 git log 实际应用的文章'
changefreq: 'monthly'
---

## 背景

公司要求我们每天都要写日报，有时候，这是一件烦人的事，因为会忘记自己具体做了些什么。幸运的是，作为程序员，我们很自然地留下了工作的痕迹：通过 `git message`。所以我就想用 `git log` 实现一个 bash 脚本，来帮助我填写日报。

## 实现过程

### 创建脚本

我先暂时在一个 git 仓库下创建这个脚本，以方便测试：

```sh
cd ~/Project/local/vue-playground
touch ./git-today.sh
chmod +x ./git-today.sh
vim ./git-today.sh
```

然后通过 `git log --author="xxx"` 获取我的提交记录：

```sh
#!/bin/bash

USER=$(git config uesr.name)
git log --author="$USER"
```

这将会得到类似下面的输出：

```txt
bash-3.2$ ./git-today.sh
commit c5cb1523390b0339581ee31ade23d14650a80ec4 (HEAD -> main)
Author: leishanglin <reasonly8@sina.com>
Date:   Sat Mar 1 07:52:45 2025 +0800

    feat: 移除跟 @vitejs/plugin-vue 有关的代码

commit b52bc6c45d163fe5ecd4c93cb90d30cfd2c756e6
Author: leishanglin <reasonly8@sina.com>
Date:   Sat Mar 1 07:51:22 2025 +0800

    feat: 设置 vue 的解析别名, 使其指向支持模板编译器的构建版本

commit 2f56f4f160bde411551f210b0b96ee9ee8b84584
Author: leishanglin <reasonly8@sina.com>
Date:   Wed Feb 26 13:31:53 2025 +0800

    init
```

这样的输出是可以的，但还不够好，一是它输出了太多无用的信息，二是它没有限制“只列出今天的提交记录”。

### 精简和限制

针对上面说的两个问题，我对这个脚本做了改进：

```sh
#!/bin/bash

# 获取当前日期
TODAY=$(date +%Y-%m-%d)

# 获取当前用户的用户名
USER=$(git config user.name)

# 从git log中过滤出今日的提交记录
git log --author="$USER" --since="$TODAY 00:00" --until="$TODAY 23:59" --oneline
```

**说明**：

- `date +%Y-%m-%d` 是一条命令，用于获取系统的当前年月日，并按 `YYYY-MM-DD` 的格式输出，比如：`2025-03-01`；
- `git config user.name` 会得到我的 git 名，用于后面过滤日志；
- `--since` 和 `--until` 用于获取今天的记录，`--oneline` 让输出更精简；

当我执行这个脚本时，会得到类似下面的输出：

```txt
bash-3.2$ ./git-today.sh
c5cb152 (HEAD -> main) feat: 移除跟 @vitejs/plugin-vue 有关的代码
b52bc6c feat: 设置 vue 的解析别名, 使其指向支持模板编译器的构建版本
```

这是比较理想的输出，我们可以复制粘贴这些信息，用于填写日报。

### 创建软链接

这个脚本，目前还在一个特定的仓库（vue-playground）中，它还不够通用，所以还需要将它进行全局注册，以满足任意位置调用的需求。

```sh
sudo ln -s /Users/leishanglin/Projects/local/git-today/git-today.sh /usr/bin/gt
```

我创建了一个放置在 `/usr/bin/` 目录下的软链接 `gt`，这样就能任何地方执行 `gt` 命令达到同样的效果。

**注意**：

1. 上面隐含 `git-today` 被移动到了 `git-today` 目录下的操作；
2. 创建软链接时需要使用绝对路径；

我们最后再测试一下：

```txt
➜ gt
c5cb152 (HEAD -> main) feat: 移除跟 @vitejs/plugin-vue 有关的代码
b52bc6c feat: 设置 vue 的解析别名, 使其指向支持模板编译器的构建版本
```

嗯，基本实现了我想要的效果。
