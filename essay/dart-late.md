# `late` 修饰符的作用

在 Dart 中，访问或修改变量前，需要进行初始化赋值（initialization），否则会报错。

在进行变量声明时，可以在声明语句开头添加 `late` 修饰符，作用有两个：

1. 处理 Dart 变量初始化赋值检测“失效”的情况；
2. 惰性初始化；

## 处理“变量初始化检测”失效

先看个例子：

```dart
void main() {
  int a = 1;
  int b = 2;
  int c;
  if (a >= b) {
    c = 0;
  }
  if (a < b) {
    c = 1;
  }
  print(c); // Error:
  // The non-nullable local variable 'c' must be assigned before it can be used.
}
```

这里 `print(c)` 时会报错，原因是 Dart 没有成功检测到 c 的初始化赋值语句。虽然开发者可以肯定赋值语句一定会执行，但 Dart 不知道，上面这种情况，最简单的做法是用 if-else：

```dart
if (a >= b) {
  c = 0;
} else {
  c = 1;
}
```

if 和 else 块中都有 c 的赋值语句，Dart 进行静态代码分析时能够确定 c 会被正常赋值，后续使用 c 变量就不会报错。

但实际情况可能更复杂：

```dart
void main() {
  int c;
  void foo() {
    c = 3;
  }

  foo();
  print(c); // 报错
}
```

上面例子中，Dart 的“变量初始化检测” 就失效了，解决方法是：用 `late` 对变量进行“修饰”，它是一种将控制权交给开发者的操作，类似“断言”：

```dart
late int c;
// ...
print(c); // 不报错
```

`late` 来自单词 "later"，它告诉 Dart：“变量 c 在后续‘一定’会进行初始化赋值，如果你的检测失效了，那就默认它已经进行过赋值操作”。这种行为不是简单的“关闭”初始化检测，而是改变了检测的策略。下面例子中，打印变量 c 时仍旧会报错，因为在这种情况下，Dart “自信”它是对的：

```dart
void main() {
  late int c;
  print(c); // 报错
}
```

## 惰性初始化（Lazily initialized）

变量初始化是一个“昂贵”的操作，有时，初始化后的变量，并没有用上，就浪费了内存：

```dart
Object a = { /* 有很多属性的对象 */ };
if (1 + 1 > 2) {
  print(a);  // 并不会执行
}
```

在这种场景下，Dart 有优化措施，称为：“惰性初始化”：

```dart
int getA() {
  print('A');
  return 1;
}

void main() {
  late int a = getA();
  if (1 + 1 > 2) {
    print(a);
  }
}
```

运行上面例子，不会有任何返回值，原因是添加了 `late` 修饰符，变量 a 声明后并没有立刻赋值，此时对变量 `a` 的赋值就变成了“惰性”操作，赋值操作将会“延后”到第一次实际“观测（obverve）”时执行：

```dart
int getA() {
  print('A');
  return 1;
}

void main() {
  late int a = getA();
  if (1 + 1 == 2) {
    print(a); // 访问前会先进行初始化赋值
  }
}

// 'A'
// 1
```

惰性初始化是一个有效的优化技术，可以提高应用程序的性能和资源利用效率，减少应用初始化时的内存占用。
