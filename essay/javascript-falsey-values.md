# JavaScript 中的 falsey 值

当一个值转为布尔值时，如果得到 `false`，就称这个值为 `falsey`，翻译成中文就是：假值。

JavaScript 中有这些 falsey 值：`null`、`undefined`、`false`、`0`、`-0`、`0n`、`NaN`、`''`、`""`、`\`\``。

判断一个值是否为 falsey 值很简单：

```ts
function isFalsey(value: unknown) {
  return !value;
}
```

一般会在面试时会问一下，平时不用特别注意，但是，为了代码更好理解，逻辑更加严谨，建议在做值的判断时，使用严格等于 `===` 进行比较。

TODO: 补充演示例子
