---
title: '代码编写注意事项'
keywords: '代码编写, 习惯, 最佳实践'
description: '这是一篇给自己看的代码编写注意事项'
changefreq: 'monthly'
---

- 在静态类型语言中，函数返回值类型需要显式定义，这样不易出错
- 在 Vue 的 template 中，调用的方法需要加小括号，比如：`<button @click="onClick()">click</button>`，这样可以防止因“参数误传”产生的问题
- UI 组件的结构保持是一棵“树”，不要简单地平铺到某个文件夹中（components/, widgets/...），这样在复制粘贴时会比较方便，阅读起来也更容易理解
- ES Module 中，尽量不要用 export default 默认导出
- JavaScript 中，尽量用 const 声明函数，保持“声明后才能使用”这一准则
