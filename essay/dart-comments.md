# Dart 中的三种注释

Dart 中有三种注释写法：单行注释、多行注释、文档注释。

## 单行注释

以 `//` 开头，后续字符是注释，直到遇到换行符：

```dart
// Hello, World!
```

## 多行注释

包裹在 `/* ... */` 中的文本，可以换行，成为多行注释：

```dart
/*
 This is a
 multi-line comments
*/
```

## 文档注释

文档注释是单行注释和多行注释的变体，有两种写法：

```dart
// 写法1
/// Hello, World!

// 写法2
/** Hello, World! */
```

看起来跟单行注释和多行注释没有太大区别，但它有一个特殊作用：生成函数、类的文档，比如，搭配 [dart doc](https://dart.dev/tools/dart-doc) 使用，会将“文档注释”解析为 HTML 文本。

此外，文档注释中还有一个特殊的语法：`[]`，可以在解析成文档时生成类、方法、函数等的链接，在开发时可以通过这个语法进行跳转：

```dart
/// [name] is String type
void sayHello(String name) {
  print("Hello, $name.");
}

/// used in [sayHello]
String getName() {
  return 'Lilei';
}
```
