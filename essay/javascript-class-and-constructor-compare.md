# JavaScript 中 class 写法和构造函数写法的异同

相同点：

1. 实例共享同一个原型对象

不同点：

1. class 必须要用 new，否则会报错
2. class 声明的属性、方法都是不可枚举的
3. class 中的方法默认定义在原型链上，除非显式定义在 this 上，比如 this.increment
