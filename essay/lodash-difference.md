# Lodash 中 difference 函数的作用

```txt
_.difference(array, [values])
```

看个例子就明白了：

```ts
import { difference } from "lodash-es";

const arr = [1, 2, 3, 4, 5, 6];
const newArr = difference(arr, [2, 4, 6]);
console.log(newArr); // [1, 3, 5]
```

`difference` 函数会返回一个新的数组，这个数组是第一个参数数组的子集，其中排除了第二个参数数组中存在的项。

注意，这个函数在做相等判断时，使用的是 `SameValueZero` 算法。
