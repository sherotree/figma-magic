- [x] 支持拿到节点，修改节点内容
- [x] 支持拿到节点，复制节点生成新的内容
- [x] TEXT Copy
- [x] 多选时的位置
- [x] 自定义字体 https://forum.figma.com/t/how-to-get-list-of-system-fonts-while-developing-plugin/3603
- [x] new page 的时候重写 text
- [x] Selection 是否支持多选
- [x] 翻译的 loading 状态
- [x] 自定义 header 的 icon
      you can add a plugin icon only when publishing or updating the plugin. Once the plugin has been approved by the Figma team, your plugin will have a Community page where you can update any information, including the icon.
- [x] 默认设置添加到缓存
- [x] 一句话有多种字体
- [x] 带 \n 的翻译失败
- [x] Frame 不支持修改 fills
- [x] 多语言翻译
- [x] UI 中无法存储数据
- [x] 根据字体进行翻译
- [x] 剩下一个字体选项时不能删除
- [x] selection 元素改变时同步更新 source font
- [x] 目前只处理 Regular 的字体
- [x] page 创建后的顺序
- [x] Default Setting bug
- [x] png -> svg
- [x] upload 样式重写
- [x] figma.clientStorage.getAsync('msg')
- [x] 源字体无法读取时怎么处理
- [x] sourceFont or font not found
- [x] Mixed font

- [ ] 支持键盘搜索
- [ ] 字体设置重复冲突后的优先级处理，取最上面
- [ ] 同时翻译多种语言垂直摆放
- [ ] 页面中夹杂多种语言如何处理
- [ ] 统计人工翻译失败的数量
- [ ] 人工翻译的 loading
- [ ] 添加页面 loading
- [ ] async await
- [ ] debounce
- [ ] html 文件过大
- [ ] 移除 calc(100% - 32px)
- [ ] 设置的取消保存逻辑
- [ ] hooks 单独抽离
- [ ] loading 使用 Button 自带的
- [ ] settings 的值区分模式
- [ ] 监听 theme 的变化
- [ ] lang 使用 JSON
- [ ] x.type === NODE_TYPES.FRAME || x.type === NODE_TYPES.INSTANCE || x.type === NODE_TYPES.SECTION
- [ ] ui.html/ui.js 内容重复
- [-] 最近使用的语言
- [-] Frame 不支持 border
- [-] 传输的数据量过大会卡顿
- [-] Frame 模式中不能包含 Section

## 第一阶段先实现基础翻译功能

- [x] 支持对选中、当前页、整个文件进行翻译
- [x] 支持覆盖、旁边放置、选区放置和新页面放置
- [x] Cover
- [x] Side
- [x] Section
- [x] New Page
- [x] 支持基础的多语言翻译
- [x] 支持统一的翻译引擎切换，初定使用有道/DeepL，或其他好用的引擎也可推荐
- [x] 支持基础的默认翻译项设置（一个）

## 第二阶段实现多语言配置配置能力

- [x] 支持设置不同语言的 预配置方案，帮助用户快速选择
- [ ] 支持针对不同源语言的翻译引擎切换

## 第三阶段解决翻译后界面适配的问题

- [ ] 提供文本超框标注能力
- [ ] 提供文本超框后的解决方案选择能力
- [ ] 文本自适应换行
- [ ] 行末省略
- [ ] 缩进预留等

## 第四阶段着重实现实时翻译能力

- [ ] 支持对选中、当前页、整个文件之间的实时同步翻译
- [x] 支持双向实时翻译

- https://github.com/realvjy/uilogos-figma
- https://github.com/colebemis/figma-hosted-export
- https://github.com/aaroniker/figma-icns-ico-generator
- https://pavellaptev.github.io/JSON-from-Figma/
- https://github.com/yagudaev/figma-to-json
- https://github.com/yuanqing/create-figma-plugin
- https://github.com/figma-plugin-helper-functions/figma-plugin-helpers
- https://github.com/marcomontalbano/figma-export
- https://github.com/didoo/figma-api
- https://github.com/Ashung/mixfonts-figma
- https://github.com/sirpooya/Frame-It
- https://github.com/six7/figma-assets-generator
- https://github.com/kazuyaseki/figma-to-react
- https://github.com/tokens-studio/figma-plugin
- https://github.com/BuilderIO/figma-html
- https://github.com/react-figma/react-figma
- https://github.com/figma-tools/figma-transformer
- https://github.com/aaroniker/figma-remove-bg
- https://github.com/PavelLaptev/JSON-to-Figma
- https://github.com/NICEXAI/figma-i18n
- https://github.com/mtmeyer/create-react-figma-plugin
- https://github.com/phosphor-icons/figma
- https://github.com/JB1905/react-figma-ui
- https://github.com/kawamurakazushi/figma-map-maker
- https://github.com/colebemis/figjam-live-code-block
