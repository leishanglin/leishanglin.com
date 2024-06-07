# Lodash 中 compact 函数的用法

```txt
_.compact(array)
```

使用 Lodash 中的 `compact` 函数，可以移除参数数组中所有 falsey 值，返回一个全是 truthy 值的数组：

```ts
import * as _ from "lodash";

const arr = [null, undefined, false, 0, -0, 0n, NaN, "", ``, Infinity];
console.log(_.compact(arr)); // [ Infinity ]
```

它等同于：`arr.filter((item) => item)`;
