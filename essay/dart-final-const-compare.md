# Dart 中 final 和 const 的区别

在 Dart 中，声明一个常量，可以用 `final` 或 `const`：

```dart
void main() {
  const a = 'a';
  final b = 'b';
  a = 'A'; // 报错
  b = 'B'; // 报错
}
```

常量只能被赋值一次，也就是“初始化”那次，再次赋值会报错。事实上，`final` 和 `const` 只有这一点相同，其他都是不同。

## 初始化时机不同

`const` 在**编译时**初始化，`final` 在**运行时**初始化：

```dart
const double PI = 1 + 2.14; // 常量或常量表达式
const DateTime DATE = DateTime.now(); // 报错
```

例子中，`PI` 是一个常量表达式，可以在编译阶段确定它的值，所以可以赋给 `const` 常量 `PI`，而 `DateTime.now()` 是一个函数，在编译时无法确定它的值，所以会报错。

`final` 常量在运行时初始化，所以它可以接受任何值，事实上，`final` 是“只能赋值一次”的变量：

```dart
final DateTime DATE = DateTime.now(); // 正常
```

## 使用场景不同

在编译时就能确定的值，用 `const`，在运行时才能确定的值，用 `final`，此外，`const` 必须声明时就初始化，而 `final` 的“声明”和“初始化”可以分开：

```dart
void main() {
  const double PI; // 报错
  final e; // 正常
}
```

注意，“顶级 `final`” 需要加 `late` 修饰符：

```dart
late final double e;
void main() {/* ... */}
```

## 常量值的可变性不同

`const` 和 `final` 常量**都**只能赋值一次，所以它们都能保证“常量名”的引用不变，但 `const` 更严格，它不仅常量名的引用不能变，连常量值（对象）的引用、及其内部方法属性等都不可变，也就是说：`const` 常量是完全“静态”的：

```dart
void main() {
  const list1 = [1, 2, 3];
  list1.add(4); // 报错

  final list2 = [1, 2, 3];
  list2.add(4); // 正常
}
```

## 命名不同

顶级的 `const` 常量推荐用“全大写 + 下划线”命名，局部的 const 常量用小驼峰命名，`final` 常量推荐用小驼峰命名：

```dart
const PI_NUM = 3.14;
final appConfig = getAppConfig();

void main() {
  // 都用小驼峰
}
```
