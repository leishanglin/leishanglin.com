---
title: '记录：因 Chrome 浏览器代理造成的内网无法访问'
keywords: 'Chrome, 内网, 代理, 无法访问'
description: '这是一篇博客，用于记录因 Chrome 浏览器代理造成的内网无法访问的问题'
changefreq: 'yearly'
---

最近，我的 MacOS 升级到了 15.3.2，然后出现了一个“内网地址无法访问”的问题。

我使用 `USB 10/100/1000 LAN` 进行有线连接，然后在访问 `172.16.xx.xx` 主机时，浏览器抛出异常：`This site can't be reached`，但是，我在终端使用 `ping` 和 `curl` 请求该资源时，又是正常的。

并且，这个问题只在 Chrome 中才会出现，Safari 中是正常的。所以我合理怀疑是 Chrome 的某些设置造成的。

经过数个小时的排查，我仍旧没有找到问题。直到我无意间修改了系统代理中的这个地方👇🏻，问题奇迹般地得到了解决：

![lan_proxy_setting](/zh-CN/chrome/assets/lan_proxy_setting.png)

上图中，我删除了 `172.16.0.0/12`，这意味着内网IP也要走 `127.0.0.1:7898` 这个代理，然后就可以正常访问了。

原因未知，但跟“科学上网”有关，我有一个 ClashX Pro 的客户端，用于设置网络代理，当我把它关掉后，局域网（172.16.xx.xx）就又无法访问了😂。

这个问题不好定位的原因在于：Safari 都可以正常访问，但 Chrome 不行，可问题却出在“系统代理”上。

Todo：后面有空了“深挖”一下。

2025/04/03 记录：定位到问题是由于 ClashX Pro 劫持了 Chrome 的 QUIC 流量造成的，解决方法是：将 Experimental QUIC Protocol 设为“禁用”。或者将 ClashX Pro 的 Proxy Mode 设为 "Direct"。

查看: chrome://flags/#enable-quic
