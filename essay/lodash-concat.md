# Lodash 中 concat 函数的用法

```txt
_.concat(array, [values])
```

使用 Lodash 中的 `concat` 函数，可以将参数数组进行“拼接”，并返回一个新的数组：

```js
import * as _ from "lodash";

const arr = [1, 2, 3];
_.concat(arr, 4, [5], [[6]]); // [ 1, 2, 3, 4, 5, [ 6 ] ]
```

等同于：`arr.concat(4, [5], [[6]])`。

注意：示例中的 `[[6]]` 被拼接后，返回 `[6]`，说明拼接只会“解构”一层。
