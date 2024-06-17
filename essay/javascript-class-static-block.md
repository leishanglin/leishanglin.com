# JavaScript：“静态块”的作用

在大多数情况下，静态属性声明时就会初始化：

```js
class Counter {
  static VERSION = "1.0.0";
}
```

这不会有什么问题，但在某些情况下，静态属性可能需要某种“初始化”的逻辑，比如静态属性 b 的值依赖了静态属性 a，这时，b 的初始化代码可以写在 constructor 中，或 class 外面：

```js
class Counter {
  static VERSION = "1.0.0";
  static STEP;
  // constructor() {
  //   if (Counter.VERSION === "1.0.0") {
  //     Counter.STEP = 1;
  //   } else {
  //     Counter.STEP = 2;
  //   }
  // }
}

if (Counter.VERSION === "1.0.0") {
  Counter.STEP = 1;
} else {
  Counter.STEP = 2;
}
```

但是这两种方法都不太好，写在 constructor 中时，只有实例化后，静态属性才会进行初始化，并且每次都会执行；写在 class 外面时，逻辑就分散开了，不够内聚。

因此引入了“静态块”，主要作用就是可以在类的内部进行静态属性的初始化操作：

```js
class Counter {
  static VERSION = "1.0.0";
  static STEP;

  static {
    if (this.VERSION === "1.0.0") {
      this.STEP = 1;
    } else {
      this.STEP = 2;
    }
  }
}
```

在静态块中的代码，只会在类生成时执行一次，后续生成类实例时不再执行，子类继承它时也不会执行：

```js
class Counter {
  static {
    console.log("1");
  }
}

// '1'

class CounterV2 extends Counter {}
```

一般来说，很少会遇到静态属性需要初始化的情况，如果真的遇到了，静态块语法可以让静态属性的初始化更加“优雅”。

此外，静态块语法还有一个“冷门”用法：

```js
let getA;

class ClassFoo {
  #a = "Hello, World!";
  static {
    getA = (obj) => obj.#a;
  }
}

getA(new ClassFoo()); // 'Hello, World!'
```

这里 `#a` 是一个私有属性，外部无法获取，此前需要在 constructor 中编写相关的逻辑，现在可以用静态块处理。他像一个“生命周期函数”，只会在类生成时执行一次。
