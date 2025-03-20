---
title: 'Vue: Implementing "Slot Inheritance" With Dynamic Slot Names'
keywords: 'dynamic slot names, Component Wrapping, slot inheritance, $slots, useSlots'
description: 'This is a blog post in which the author provides a method for slot inheritance in Vue, which is useful when re-packaging components.'
changefreq: 'monthly'
---

## Background

Recently, I’ve been re-packaging components based on [Ant Design Vue](https://antdv.com/components/overview) for use in a form designer. The re-packaged components look like this:

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

In the example above, I re-packaged the `<Switch />` component with the aim of changing the original v-model:checked to v-model:value. This is useful for dynamically rendering forms (because it standardizes the two-way data binding).

However, I wasn’t sure how to “inherit” the built-in slots of the `<Switch />` component. The following approach is something I can’t accept (because it’s too cumbersome):

```html
<template>
  <Switch v-bind="omit(props, ['value'])" v-model:checked="value">
    <template #checkedChildren>
      <slot name="checkedChildren"></slot>
    </template>

    <template #unCheckedChildren>
      <slot name="unCheckedChildren"></slot>
    </template>

    <!-- And more ... -->
  </Switch>
</template>
```

## Solution

After reading the section on [slots](https://vuejs.org/guide/components/slots.html#dynamic-slot-names) in the official Vue documentation, I found a way to "inherit" the built-in slots of a component. The method is: use `useSlots` to get all the slots and then dynamically render them inside the component using `v-for`:

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

This way, we can “intercept” all the slots used by the outer component and dynamically register them. Additionally, we can replace `useSlots` with `$slots`. Here is the complete code:

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

Note: After `v-slot:[slotName]`, you can also receive parameters passed from scoped slots, for example: `v-slot:[slotName]="xxx"`.