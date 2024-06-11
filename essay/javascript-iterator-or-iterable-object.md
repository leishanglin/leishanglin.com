# JavaScript 中遍历器（Iterator）的作用和用法

“集合”是一类数据结构，用于存储一组带有关联性的键值对，这种数据结构，有的是有序的（Array），有的是无序的（Object、Set、Map），有的值是唯一的（Set），有的键可以是任意的（Map），但不管是什么类型的“集合”，他们都有一个相同点：**可以遍历**。

在 JavaScript 中，遍历 Array 有很多方法：for、while、do...while、Array.prototype.forEach 等；遍历 Object 也有很多方法：for...in、Object.keys、Object.entries 等，遍历 Set 或 Map 可以用它们自带的 `.forEach` 方法。

虽然各有各的遍历方法，但这些方法并不统一，如果后续还有增加新的集合类型，那就得为它单独实现遍历方法，这样显然不太合理。所以才有了：**遍历器**（Iterator）这样其实是不统一的，

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
