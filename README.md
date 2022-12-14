# Bik Mall3 Web

> Bik Mall3 Web 前端项目

本项目使用的技术为：vue3(setup-script)+vite3+element-plus 新一代前端框架，It's fast!

使用 eslint+prettier 格式和校验代码,提高代码规范性和开发效率

使用先进的包管理工具 pnpm

Vite 需要 Node.js 的版本 14.18+。

## 说明

vue3 和 vue2 在性能上的对比

- 打包大小减少 41%

- 初次渲染快 55%, 更新渲染快 133%

- 内存减少 54%

- **使用 Proxy 代替 defineProperty 实现数据响应式**

- **重写虚拟 DOM 的实现和 Tree-Shaking**

## 构建步骤

```bash
# 克隆项目
git clone http://120.77.205.216:9981/bitkernal-se/mall3-web.git

# 进入项目目录
cd  mall3-web

# pnpm address https://pnpm.io/zh/motivation
# 安装依赖(建议用pnpm)
# 你可以使用 "npm -g i pnpm@6.32.3" 去安装pnpm
pnpm i

# 启动服务
pnpm run dev
```

浏览器访问 http://localhost:5001

## 发布

```bash
# 构建测试环境
pnpm run build-serve

# 构建生产环境
pnpm run build
```

## 其它

```bash
# 预览发布环境效果
pnpm run preview:build-serve

# 预览生产环境
pnpm run preview

# 代码格式检查并自动修复
pnpm run lint
```

## 浏览器支持

注意：vue3 不再支持 IE 浏览器
Modern browsers and Internet Explorer 11+.

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>IE / Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Safari |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Edge                                                                                                                                                                                                            | last 2 versions                                                                                                                                                                                                   | last 2 versions                                                                                                                                                                                               | last 2 versions                                                                                                                                                                                               |

## Copyright

Copyright (c) 2022-present BitKernal
