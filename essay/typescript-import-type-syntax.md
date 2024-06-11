# TypeScript 设置 import 类型时必须加 type 关键字

tsconfig.json

```json
{
  "compilerOptions": {
    "verbatimModuleSyntax": true
  }
}
```

启用后，导入类型时，就必须添加 `type` 关键字，否则就会报错：

```ts
// import { TypeA } from "./moduleA"; // 报错
import type { TypeA } from "./moduleA"; // 不报错
```

这种“强制措施”，可以帮助开发者区分导入的究竟是“模块”还是“类型”，建议启用。
