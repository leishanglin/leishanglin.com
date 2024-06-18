# JavaScript 中 localStorage 存取是同步还是异步

硬盘是一个 IO 设备，操作系统级的 IO 操作，一般都是异步的，localStorage 中的数据是持久存储在硬盘中的，而不是内存，所以，按理来说，localStorage 存取数据也应该是异步操作。但事实并不完全如此：

```js
localStorage.foo = "foo";
console.log(localStorage.foo);
console.log("bar");

// 依次打印：
// 'foo'
// 'bar'
```

上面例子演示了一个 localStorage 的存和取的操作，没有回调函数，没有 async/await，很明显，localStorage 是同步操作。

之所以浏览器“敢”这么做，最主要的原因是 localStorage 在设计之初就决定了它不会存储特别大的数据，上限一般是 5M，否则在数据量太大时，会严重阻塞 JS 主线程。对开发者来讲，只需要将 localStorage 看成是一个可以进行同步 IO 操作的黑盒，至于不同浏览器的实现是怎样的、内部是否进行了异步 IO 以减少阻塞等，这些就不是应用开发层面需要关注的事情了。
