# 在 JavaScript 中获取 UTF-8 编码下的字符字节长度

在 utf-8 中，字符的编码长度是可变的，这对字符的持续收录有帮助，比如英文字母占 1 个字节，常用中文占 3 个字节，生僻汉字占 4 个字节等。

在 JavaScript 中，通过字符串的 `.length` 属性获取到的字符长度不是字符所占的字节数：

```ts
console.log("𠮷".length); // 1
console.log("吉".length); // 1
```

要想获取一个字符的真实字节数，需要使用一个**专门**的内置构造函数：`TextEncoder`：

```ts
const encoder = new TextEncoder();
const utf8Bytes1 = encoder.encode("𠮷");
console.log(utf8Bytes1.length); // 4

const utf8Bytes2 = encoder.encode("吉");
console.log(utf8Bytes2.length); // 3
```

在 Node 环境下，获取字符所占字节长度，可以用 Buffer 对象：

```ts
const str = "你好";
const byteLength = Buffer.byteLength(str, "utf-8");
console.log(byteLength); // 输出 6
```
