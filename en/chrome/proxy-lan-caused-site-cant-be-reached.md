---
title: 'Record: Local Network Access Failure Caused by Chrome Browser Proxy'
keywords: 'Chrome, Local Network, Proxy, Access Failure'
description: 'This is a blog post documenting the issue of intranet access failure caused by the Chrome browser proxy.'
changefreq: 'yearly'
---

Recently, my MacOS was upgraded to version 15.3.2, and I encountered an “Local network address cannot be accessed” issue.

I was using a `USB 10/100/1000 LAN` for a wired connection, and when accessing the `172.16.xx.xx` host, the browser threw an exception: **This site can't be reached**. However, when I used `ping `and `curl` in the terminal to request the resource, it worked fine.

Moreover, this issue only occurred in Chrome; Safari worked normally. So I reasonably suspected that certain settings in Chrome might be causing the problem.

After several hours of troubleshooting, I still couldn’t find the issue. Until, by accident, I modified this setting in the system proxy 👇🏻, and the issue was miraculously resolved:

![lan_proxy_setting](/en/chrome/assets/lan_proxy_setting.png)

In the image above, I removed `172.16.0.0/12`, meaning that the intranet IP also needs to pass through the `127.0.0.1:7898` proxy, and then it could be accessed normally.

The cause is unknown, but it is related to “scientific internet access.” I have a ClashX Pro client for network proxy settings, and when I turned it off, the local network (172.16.xx.xx) became inaccessible again 😂.

The reason this issue is hard to pinpoint is that **Safari can access it normally, but Chrome cannot**, yet the problem lies with the **system proxy**.

I’ll dig deeper into this when I have time later.

2025/04/03 Log: The issue was identified as being caused by ClashX Pro hijacking Chrome’s QUIC traffic. The solution is to set 'Experimental QUIC Protocol' to 'Disabled', Or Set Proxy Mode to "Direct" on ClashX.

See: chrome://flags/#enable-quic
