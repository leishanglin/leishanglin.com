# JavaScript 中的三种比较算法：严格相等比较、SameValue、SameValueZero 的区别

这三种比较算法都大同小异，它们“争论”的焦点是：

1. `+0` 是否等于 `-0`？
2. `NaN` 是否等于 `NaN`？

在严格相等比较算法（Strict Equality Comparison）中，`+0` 等于 `-0`，`NaN` 不等于 `NaN`，严格相等运算符 `===` 使用了这种算法：

```ts
0 === -0; // true
NaN === NaN; // false
```

在 SameValue 算法中，`+0` 不等于 `-0`，`NaN` 等于 `NaN`，`Object.is()` 内部使用了这种算法：

```ts
Object.is(0, -0); // false
Object.is(NaN, NaN); // true
```

在 SameValueZero 算法中，`+0` 等于 `-0`，`NaN` 等于 `NaN`，`Set`、`Map`、`Array.prototype.includes` 等使用了这种算法：

```ts
[NaN].includes(NaN); // true
[0].includes(-0); // true
```

这三种算法解决的问题不一样，使用场景下也就不一样，一般来说，如果不比较 NaN，那就用 `===`；如果要比较 NaN，就用 SameValueZero；如果要严格区分 `+0` 和 `-0`，就用 `SameValue`。
