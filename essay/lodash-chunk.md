# Lodash 中 chunk 函数的用法

```txt
_.chunk(array, [size=1])
```

`chunk` 可以将数组拆分成多个长度为 `size` 的区块，并返回一个二维数组，如果数组无法被等分，那剩余的项将成为一个新的区块。

```ts
import * as _ from "lodash";

const list = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const listGroups1 = _.chunk(list, 3);
console.log(listGroups1); // [ [ 1, 2, 3 ], [ 4, 5, 6 ], [ 7, 8, 9 ] ]

const listGroups2 = _.chunk(list, 4);
console.log(listGroups2); // [ [ 1, 2, 3, 4 ], [ 5, 6, 7, 8 ], [ 9 ] ]
```

也可以用原生方法实现：

```ts
const chunk = <T>(list: T[], size: number) => {
  const res: T[][] = [];
  const temp: T[] = [];

  for (let i = 0; i < list.length; i++) {
    if (temp.length === size) {
      res.push([...temp]);
      temp.length = 0;
    }

    temp.push(list[i]);

    // 处理最后一组
    if (i === list.length - 1) {
      res.push(temp);
    }
  }

  return res;
};
```
