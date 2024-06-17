# JavaScript：静态属性和静态方法

直接通过“类”进行调用的属性或方法，称为“静态属性”或“静态方法”：

```ts
Math.abs(-1); // 1
Math.PI; // 3.141592653589793
```

上面例子中，Math 是一个类（构造函数），而类同时也是一个**对象**，所以可以直接在类上添加属性和方法，这是静态属性和静态方法可以实现的前提。

在 class 写法中，静态属性和静态方法用 `static` 修饰符定义：

```js
class Counter {
  count = 0;
  increment() {
    this.count++;
  }

  static version = "1.0.0";
  static getName() {
    return this.name;
  }
}

Counter.version; // '1.0.0'
Counter.getName(); // 'Counter'
```

如果不用 `static`，可以将它们写在外面，效果是一样的：

```js
function Counter() {
  this.count = 0;
  this.increment = function () {
    this.count++;
  };
}
Counter.version = "1.0.0";
Counter.getName = function () {
  return this.name;
};

Counter.version; // '1.0.0'
Counter.getName(); // 'Counter'
```

以下是静态属性和静态方法的一些特点。

## this 指向 class 本身

注意，如果一个静态方法中含有 `this` 关键字，那它指向的是这个类本身，而不是类的实例：

```js
class Counter {
  static getName() {}
}

Counter.getName = function () {
  return this.name;
};

Counter.getName(); // 'Counter'
```

## 不会被实例继承

静态属性和静态方法不会被实例继承，一般用来存储“常量”或跟类相关的工具方法：

```js
class Counter {
  count = 0;
  increment() {
    this.count++;
  }
}

Counter.getName = function () {
  return this.name;
};

Counter.getName(); // 'Counter'

const counter = new Counter();
counter.getName(); // Error: counter.getName is not a function
```

这里 `counter.getName()` 报错，说明直接定义在 Counter “对象”上的属性或方法不会被实例继承，因此不能被实例引用。

## 会被子类继承

虽然不能被实例继承，但静态方法和静态属性可以被子类“继承”：

```js
class CounterV2 extends Counter {}

console.log(CounterV2.version); // '1.0.0'
console.log(CounterV2.getName()); // 'CounterV2'
```

也可以被子类改写和新增：

```js
class CounterV2 extends Counter {
  static version = "2.0.0";

  static getName() {
    return super.getName().toUpperCase();
  }

  // 子类新增的静态属性
  static foo = "FOO";
}

CounterV2.version; // '2.0.0'
CounterV2.getName(); // 'COUNTERV2'
CounterV2.foo; // 'FOO'
```
