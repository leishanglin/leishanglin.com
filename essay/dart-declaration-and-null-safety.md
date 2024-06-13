# Dart 变量声明与 Null-safety 检查

Dart 是静态类型语言，声明变量时需要指定类型：

```dart
String a
a = 'a';
```

在上面例子中，我们用类型 `String` 声明了一个字符串类型的变量 `a`。如果在声明时就对变量进行赋值，dart 会自动进行“类型推断”，此时可以用 `var` 声明变量：

```dart
var a = 'a'; // a 被推断为类型：String
```

`String a` 和 `var a` 都可以声明一个变量 `a`，区别是前者显式声明了类型，而后者借助了 dart 的类型推断机制，编码时，两种方式任选其一，不要受到 JavaScript/TypeScript 的影响，认为声明变量一定要用 var：

```dart
String var a = 'a'; // 报错，显式声明了类型时，不能再加 `var`
```

在 Dart 中，一切皆对象，例子中的变量 a 指向的内存地址，实际是一个 String 对象，这个 String 对象的 value 再指向内存中的字符串 'a' 的存储地址。所以，当两个字符串相同时，它们实际指向同一个内存地址，这对节省内存、优化性能有帮助：

```dart
void main() {
  var a1 = 'a';
  var a2 = a1;
  var a3 = 'a';
  print(identical('a', 'a')); // true
  print(identical('a', a1)); // true
  print(identical(a1, a2)); // true
  print(identical(a1, a3)); // true
}
```

Dart 没有提供直接获取对象内存地址的方法，但提供了用于比较两个对象的内存引用是否相同的函数 `identical(a, b)`。上面例子说明，无论代码中声明了多少个值为 `a` 的字符串，它们都指向同一个内存地址。

这种相同字符串共享同一个内存地址的机制，称为“驻留（interning）”，适用于布尔值（bool）、整数（int）、浮点数（double）和字符串（String）。

在 JavaScript 中，因为 null 或 undefined 引发的错误十分常见：

```js
const res = null;
res.data;
// Uncaught TypeError: Cannot read properties of null (reading 'data')
```

这被称为“空值解引用错误（null dereference error）”，当程序试图访问或操作对象的属性或方法时，如果这个对象为 null 或 undefined，就会发生这类错误，导致程序抛出一个运行时异常。

Dart 为了解决这类问题，选择用 null 同时表示“空的值”和“未定义的值”，而不专门引入 undefined。并引入更加严格的 null 检查机制（Null safety），用来处理对空值的非法访问或操作：

通过 Null-safety 机制，Dart 得以在编译时检查这类潜在的运行时问题，不过这个机制不是完全自动的，它需要开发者的“帮助”。

这个帮助，具体指的是：需要由开发者决定变量**是否可以**为 null，由此将变量分为了两类：可为 null 的变量和不可为 null 的变量。它们在声明和使用时会有一些区别：

```dart
void main() {
  int n; // n 不能为 null
  int? m; // m 可以为 null
  n = 1;
  print(n); // 1
  print(m); // null
}
```

Dart 默认启用了 Null-safety，在声明变量时，默认都是不能为 null 的变量，如果某个变量可能为 null，那就需要显式声明，做法是在类型末尾加：`?`，比如 `int?: m;`。

此外，可为 null 的变量，如果在声明时没有赋值，它将会**自动**赋予默认值：null，这也是上面例子中，变量 `m` 没有初始化赋值，却能直接使用的原因。至于 `int n;`，由于他不能为 null，所以在使用前必须进行一次**显式**的“初始化赋值”：`n = 1;`，否则就会报错。上面代码等同于：

```dart
void main() {
  int n = 1;
  int? m = null;
  print(n); // 1
  print(m); // null
}
```
