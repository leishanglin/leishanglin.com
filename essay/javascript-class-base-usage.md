# JavaScript 中 class 的基础用法

## class 是构造函数的语法糖

在大多数面向对象的编程语言（Java、C++ 等）中，都引入了 Class 这个概念，跟传统的面向对象的编程语言不同，JavaScript 通过**构造函数**实现类似 Class 的功能，但这种写法对于具有传统面向编程语言背景的开发者来说，可能不容易理解，并且构造函数写法没有 Class 写法那么容易理解，所以 ES6 引入了 Class 写法，用于取代构造函数写法：

```ts
class Counter {
  value = 0;

  constructor(value: number = 0) {
    this.value = value;
  }

  increment() {
    this.value++;
  }
}

const counter = new Counter();
counter.increment();
console.log(counter.value); // 1
```

class 写法可以看作是构造函数写法的“语法糖”，它的绝大部分功能都可以通过构造函数写法实现，只是 class 写法更加清晰，更像面向对象编程的语法而已，上面代码等同于：

```js
function Counter(value = 0) {
  this.value = value;
}
Counter.prototype.increment = function () {
  this.value++;
};

const counter = new Counter();
counter.increment();
console.log(counter.value); // 1
```

和“构造函数写法”一样，class 的数据类型**也**是“函数”，并且它本身**也**指向原型链上的 constructor 函数：

```js
typeof Counter; // 'function'
Counter === Counter.prototype.constructor; // true
```

## 属性

## 属性表达式

## class 表达式

## 静态属性和静态方法

## 私有属性和私有方法

## 实例属性和实例方法

## setter 和 getter
