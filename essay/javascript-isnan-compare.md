# JavaScript 中 isNaN 和 Number.isNaN 的区别

isNaN 和 Number.isNaN 都可以用来判断参数是否为 NaN，区别是 `isNaN()` 在判断前会先将参数转为数字，但 `Number.isNaN()` 不会，也就是说，isNaN 会进行“隐式类型转换”：

```ts
Number.isNaN(NaN); // true
isNaN(NaN); // true

isNaN(); // true
Number.isNaN(); // false

isNaN("NaN"); // true
Number.isNaN("NaN"); // false
```

在 JavaScript 中，“隐式类型转换”存在诸多弊端，所以推荐使用 `Number.isNaN`，不建议使用 `isNaN`。
