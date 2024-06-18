# 解决 Swiper 插件中第一页和最后一页时切换按钮点击事件透传的问题

如果轮播图 item 有点击事件，并且可以左右点击切换轮播图，那此时，如果轮播图在第一页时，点击“往前”的按钮，会触发点击事件，这是有问题的，比如点击是跳转到外链时。

解决方法是：

```less
.swiper {
  .swiper-button-next,
  .swiper-button-prev {
    &.swiper-button-disabled {
      pointer-events: auto;
    }
  }
}
```
