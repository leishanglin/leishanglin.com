# JavaScript 中 SameValueZero 比较算法的使用场景

**SameValueZero** 是一种用于比较两个值是否相等的算法，它类似严格相等：`===`，区别是：在 `SameValueZero` 算法中，`NaN` 和 `NaN` 是相等的：

```ts
function SameValueZero(x: unknown, y: unknown) {
  return x === y || (x !== x && y !== y);
}

SameValueZero(NaN, NaN); // true

NaN === NaN; // false
```

`SameValueZero` 算法的一些使用场景：

1. `Set` 对象中的值唯一性比较；
2. `Map` 对象中的键唯一性比较；
3. `Array.prototype.includes` 方法；
4. Lodash 中 `difference` 函数；

这种比较算法主要处理 `NaN !== NaN` 这种情况，上述使用场景如果不使用 `SameValueZero` 算法，在遇到 NaN 时就会出现问题。
