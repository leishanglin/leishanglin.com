# JavaScript 中遍历器（Iterator）的作用和用法

“集合”是一种数据结构，用于存储一组带有关联性的值，在 JavaScript 中，共有**四种**数据集合：Array、Object、Set 和 Map，遍历 Array 和 Object 有很多方法，下面演示 for 和 for ... in：

```ts
const a = [1, 2, 3];
for (let i = 0; i < a.length; i++) {
  console.log(a[i]);
}
// 1,2,3

const b = { a: 1, b: 2, c: 3 };
for (const key in b) {
  console.log(b[key as keyof typeof b]);
}
// 1,2,3
```

那么，应该怎样遍历 Set 和 Map 呢？
