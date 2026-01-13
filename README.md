# yuque-blog
一个基于Cloudflare Pages的博客，使用Astro框架，从Yuque知识库中获取文章内容。

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