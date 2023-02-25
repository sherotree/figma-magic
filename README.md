# Cube Design

> 魔方设计插件集合，包含 Cube Design、[Cube Translator](https://www.figma.com/community/plugin/1205127328344023071/Cube-Translator) 等

## 如何使用

TODO:

## 🚀 快速开始

### 环境依赖

- node@16+

### 本地开发

```bash
yarn | npm i | pnpm install // 安装依赖

```

```bash
# 打包所有子项目
yarn build
```

```bash
# 打包指定项目
cd packages/cube-design
yarn build
```

```bash
# Remove the node_modules directory from all packages
yarn clean
```

## 🏗️ 项目结构

```
└── 📁cube-design
    |
    ├── 📁packages
    |   |
    │   ├── 📁cube-design
    │   │
    │   ├── 📁cube-translator
    │   │
    │   ├── 📁cube-translator-core
    │   │
    │   └── 📁...
    |
    |
    ├── 📄 package.json
    └── 📄 lerna.json

```

## 难点

生成的文本的位置计算

### 人工翻译实现难点

1、需要提取 figma 画布上符合条件的节点，将这些节点转换成结构化的数据。
2、需要将选中的 Frame 转成 base64 添加到数据中

数据处理：由于翻译的文本可能无限大，因此要高效地处理大量的文本，并且保持高质量的数据；

翻译 API 的利用：包括支持的 API 数量和质量的研究，使得插件达到期望的语言和文本翻译准确度；

词语查找时的智能匹配，以达到最准确的结果；

扩展 API 的限制：由于 Figma 的 API 仅支持带注释的文档或可编辑文本，所以在翻译后要将更新记录到 Figma 中时可能会遇到一些困难。

提取文本：要想要实现自动翻译，必须首先从 Figma 文件中提取文本，这可能是非常复杂的。

利用外部文本解析器：由于 Figma 提供的文本提取工具非常有限，如果要实现提取更为复杂的文本，可能需要利用外部文本解析器来实现。

文件格式：对不同客户端的文件，插件要根据文件的格式宽容识别，并且支持不同的文件格式转换。

兼容不同语言：本文中所提到的 figma 翻译插件需要覆盖绝大多数语言，因此插件的开发需要考虑各种语言的兼容性，即翻译插件可以支持用户输入不同语言的内容，并能在短时间内把文本翻译成另一种语言，使翻译过程更加的顺利。

文本处理技术：如下所示，翻译过程中，文本需要经过词法分析、句法分析，以及句子归纳等一系列处理后，最终转换成另一语言才能翻译出完美的结果，所以开发 figma 翻译插件时需要考虑如何利用合适的文本处理技术处理用户输入的文本，以实现快速、准确的翻译效果。

机器翻译技术：翻译插件需要利用机器翻译技术来让计算机完成准确的文本翻译。因此开发 figma 翻译插件时，还需要考虑如何接入机器翻译系统，以便让文本可以实时翻译，且翻译的质量达到设定的要求。

---

Figma 人工翻译插件面临的技术难点主要包括：

---
