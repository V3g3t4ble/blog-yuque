# yuque-blog
一个基于Cloudflare Pages的博客，使用Astro框架，从Yuque知识库中获取文章内容。

## Typora 风格主题
这里的“Typora 主题”指站点的 Typora 风格 UI（不是 Typora 客户端可导入的 `.theme/.user.css`）。
- 主入口：`src/layouts/TyporaLayout.astro`
- 相关组件：`src/themes/typora/`

主题核心通过 `body.theme-typora` 下的 CSS 变量控制，可重点调整：
`--lp-accent-1/--lp-accent-2`、`--lp-blur/--lp-saturate`、`--lp-glass*`、`--lp-shadow*`。

## 部署
Fork本项目，在Cloudflare Pages中部署，配置环境变量
- `BLOG_PASSWORD`：博客登录密码
- `YUQUE_TOKEN`：Yuque API Token
- `YUQUE_LOGIN`：Yuque用户登录名（或组织登录名）
- `YUQUE_REPO`：Yuque知识库（Repo）的Slug

并开启Deploy Hooks

在语雀中配置

![image-20260113115300312](https://blog-1258572842.cos.ap-nanjing.myqcloud.com/obsidian/20260113115300404.png)

![image-20260113115326324](https://blog-1258572842.cos.ap-nanjing.myqcloud.com/obsidian/20260113115326374.png)

![image-20260113120041663](https://blog-1258572842.cos.ap-nanjing.myqcloud.com/obsidian/20260113120041707.png)
