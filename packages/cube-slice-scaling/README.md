# React

<img src="../_screenshots/webpack.png" width="400" />

Creates rectangles (same as the [Webpack sample plugin][webpack]).

This demonstrates:

- bundling plugin code using Webpack, and
- using React with TSX.

The main plugin code is in `src/code.ts`. The HTML for the UI is in
`src/ui.html`, while the embedded JavaScript is in `src/ui.tsx`.

These are compiled to files in `dist/`, which are what Figma will use to run
your plugin.

To build:

    $ npm install
    $ npx webpack

[webpack]: ../webpack/

# 2020/01/20

- 新增使用导出的图像数据裁切
- 增加"useShowSizeSlice"属性标记是否使用 figma 中显示的尺寸来裁切，为假的话就使用图像原始尺寸裁切
- 新增输入后按回车失去焦点
- 生成组件后删除原来的节点
- 生成组件后把位置和大小设成原来节点的数据
- 生成组件后折叠起来，并且锁定子节点
- 移除"figma.viewport.scrollAndZoomIntoView"
