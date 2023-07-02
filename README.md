![Summora hero image](public/og-summora-230411.png)

# Summora

## Everything, in summary

Platform for user-generated articles on any topic.

https://www.summora.com

<a href="https://www.producthunt.com/posts/summora?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-summora" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=400850&theme=light" alt="Summora - Everything&#0044;&#0032;in&#0032;summary&#0044;&#0032;less&#0032;fluff&#0044;&#0032;more&#0032;facts | Product Hunt" style="width: 200px; height: 54px;" width="250" height="54" /></a>

### Built with

- Next.js
- tRPC
- Prisma
- AWS S3
- Tailwind CSS

### Code tour

Some interesting parts of the codebase:

- [APIs](https://github.com/bennettdams/summora/tree/main/src/server/routers)
- Image upload
  - [Server](https://github.com/bennettdams/summora/blob/main/src/server/cloud-storage.ts)
  - [Client](https://github.com/bennettdams/summora/blob/main/src/services/cloud-service.ts)
- [Form components](https://github.com/bennettdams/summora/blob/main/src/components/form.tsx)
- [Single post page](https://github.com/bennettdams/summora/blob/main/src/components/pages/post/PostPage.tsx)
- [Date formatting](https://github.com/bennettdams/summora/blob/main/src/util/date-time.ts)
