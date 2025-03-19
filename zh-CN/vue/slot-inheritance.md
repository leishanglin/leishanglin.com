---
title: 'Vue：用动态插槽名实现“插槽继承”'
keywords: '动态插槽名, 组件二次封装, 插槽继承, $slots, useSlots'
description: '这是一篇博客，笔者在文中提供了一种在 Vue 中进行插槽继承的方法，这在对组件进行二次封装时很有用'
changefreq: 'monthly'
---

## 背景

最近在基于 [Ant Design Vue](https://antdv.com/components/overview-cn) 做组件的二次封装，以便在表单设计器中使用。这些经过封装的组件长这样：

```html
<script setup>
import { Switch } from 'ant-design-vue'
import { switchProps } from 'ant-design-vue/es/switch'
import { omit } from 'lodash-es'

const props = defineProps(switchProps())

const value = defineModel('value', {
  type: [Boolean, Number, String],
})
</script>

<template>
  <Switch v-bind="omit(props, ['value'])" v-model:checked="value">
    <!-- ... -->
  </Switch>
</template>
```

在上面例子中，我将 `<Switch />` 组件进行了二次封装，目的是将原有的 `v-model:checked` 改成了 `v-model:value`，这在对表单进行动态渲染时会有用（因为统一了数据的双向绑定）。

但是，我不知道要怎样“继承” `<Switch />` 组件内置的插槽（Slots）。下面这种方式是我不能接受的（因为太麻烦）：

```html
<template>
  <Switch v-bind="omit(props, ['value'])" v-model:checked="value">
    <template #checkedChildren>
      <slot name="checkedChildren"></slot>
    </template>

    <template #unCheckedChildren>
      <slot name="unCheckedChildren"></slot>
    </template>

    <!-- 等等 ... -->
  </Switch>
</template>
```

## 解决

在阅读了 Vue 官方文档中关于[插槽](https://cn.vuejs.org/guide/components/slots.html#dynamic-slot-names)的章节后，我找到了一种能够“继承”组件内置插槽的方法，即：使用 `useSlots` 获取所有插槽，然后在组件内部使用 v-for 动态渲染：

```html
<script setup>
import { useSlots } from 'vue'

// ...

const slots = useSlots()
</script>

<template>
  <Switch v-bind="omit(props, ['value'])" v-model:checked="value">
    <template v-for="slotName in Object.keys(slots)" v-slot:[slotName]>
      <slot :name="slotName"></slot>
    </template>
  </Switch>
</template>
```

这样就可以“截获”外层使用的所有插槽，然后动态注册。此外，我们可以用 `$slots` 取代 `useSlots`，以下是完整代码：

```html
<script setup>
import { Switch } from 'ant-design-vue'
import { switchProps } from 'ant-design-vue/es/switch'
import { omit } from 'lodash-es'

const props = defineProps(switchProps())

const value = defineModel('value', {
  type: [Boolean, Number, String],
})
</script>

<template>
  <Switch v-bind="omit(props, ['value'])" v-model:checked="value">
    <template v-for="slotName in Object.keys($slots)" v-slot:[slotName]>
      <slot :name="slotName"></slot>
    </template>
  </Switch>
</template>
```

注意：`v-slot:[slotName]` 后面还可以接收作用域插槽传递的参数，比如：`v-slot:[slotName]="xxx"`。