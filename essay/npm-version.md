# npm version 命令使用详解

参考自：`npm help version`。

`npm version` 命令主要处理项目的“版本管理”问题，这里的“版本”不是指 `git`，而是 `package.json` 中的 `version`：

```json
{
  "name": "project-1",
  "version": "1.0.0"
}
```

如果你不知道这个命令，也没什么关系，因为它只是一组操作的封装，没有新的东西，它实际做了下面三件事情：

1. 更新 `package.json` 中的 `version` 字段；
2. 创建一个新的 git 提交，用于 commit 上一步的修改；
3. 创建一个 git 标签（tag），标签名默认就是上一步更新的 version；

下面演示具体用法，我们假设当前版本为 1.0.0：

```sh
# 常用
npm version patch   # 发布不定版本：版本号从 1.0.0 更新到 1.0.1
npm version minor   # 发布次版本：版本号从 1.0.0 更新到 1.1.0
npm version major   # 发布主版本：版本号从 1.0.0 更新到 2.0.0

# 偶尔会用
npm version prepatch # 预发布补丁版本：版本号从 1.0.0 更新到 1.0.1-0
npm version preminor # 预发布次版本：版本号从 1.0.0 更新到 1.1.0-0
npm version premajor # 预发布主版本：版本号从 1.0.0 更新到 2.0.0-0
```

> 注意：使用 `npm version` 前需要保证 git 工作区是干净的。

## TODO
