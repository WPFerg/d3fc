---
layout: component
title: Container
component: tool/container.js
namespace: tool

example-code: |
  var tooltipContainer = fc.tool.container()
      .padding(5)
      .component(tooltip);

---

The container component is used to render a background behind another component, with an optional padding. It is often used to provide a background for tooltips or legends:

```js
{{{example-code}}}
```
