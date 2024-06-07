# JavaScript 中 for、for ... in、for ... of 循环的区别

JavaScript 有三种 for 循环，for、for ... in 和 for ... of，它们很像，所以容易产生混淆，这里记录一下它们的相同点和不同点。

## 相同点

都能用 `break` 或 `continue` 中断循环。

## 不同点

for 循环用于遍历**带索引**的数据结构，比如 string、Array，Array-Like Object：

```ts
const arr1: number[] = [1, 2, 3, 4];
const arr2: ArrayLike<number> = { 0: 1, 1: 2, 2: 3, 3: 4, length: 4 };

for (let i = 0; i < arr1.length; i++) {
  console.log(arr1[i]);
}
// 输出：1,2,3,4

for (let i = 0; i < arr2.length; i++) {
  console.log(arr2[i]);
}
// 输出：1,2,3,4
```

for ... of 循环用于遍历“**可迭代对象**”，比如：字符串、arguments、数组、Set、Map 等：

```ts
const arr1: number[] = [1, 2, 3, 4];
const arr2: ArrayLike<number> = { 0: 1, 1: 2, 2: 3, 3: 4, length: 4 };

for (const item of arr1) {
  console.log(item);
}
// 输出 1,2,3,4

for (const item of arr2) {
  console.log(item);
}
// 报错，因为 arr2 不是可迭代对象
```

for ... in 循环用于遍历对象中的**可枚举属性**，包括它继承的可枚举属性：

```ts
const arr1: number[] = [1, 2, 3, 4];
const arr2: ArrayLike<number> = { 0: 1, 1: 2, 2: 3, 3: 4, length: 4 };

for (const item in arr1) {
  console.log(item);
}
// 输出 0,1,2,3

for (const item in arr2) {
  console.log(item);
}
// 输出 0,1,2,3,length
```

## 总结

一般来说，选择使用 for 循环，都是看中了它“可中断”的特性，其他的遍历方法，比如：forEach，map 不能用 `break` 或 `continue` 中断循环。

当确定要用 for 循环后，可以根据数据类型的不同，选择合适的 for 循环：

- 字符串：`for` 或 `for ... of`；
- 数组：`for` 或 `for ... of`；
- 可迭代对象（Iterator）：`for` 或 `for ... of`；
- 类数组对象（Array-Like Object）：`for` 或 `for ... in`；
- 普通对象：`for ... in`；
