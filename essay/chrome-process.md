# Chrome 浏览器中的一些主要进程

1. 浏览器进程（Browser Process），主进程，负责管理窗口、标签页、地址栏、书签和浏览器其他核心功能，以及管理其他进程；
2. 渲染进程（Renderer Process），每个标签页一般对应一个独立的渲染进程，负责解析 HTML、CSS、JavaScript，构建 DOM 树和渲染页面；
3. 插件进程（Plugin Process），负责运行浏览器插件，隔离插件崩溃；
4. GPU 进程（GPU Process），负责处理跟 GPU 相关的任务，比如 3D 渲染和图形加速绘制和硬件加速等；
5. 扩展进程（Extension Process），负责运行扩展程序，保证扩展崩溃不会影响浏览器其他部分；
6. 网络进程（Network Process），负责处理所有网络通信，它会调用操作系统的相关 API，与远程服务器进行通信；
