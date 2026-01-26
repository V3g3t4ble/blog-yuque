import { defineCollection, z } from 'astro:content';
import { yuqueLoader } from '../loaders/yuque';
import type { Loader } from 'astro/loaders';

const renderMode = String((import.meta as any).env?.BLOG_RENDER_MODE ?? '').toLowerCase();
const emptyPostsLoader = (): Loader => ({
  name: 'empty-posts-loader',
  load: async ({ store }) => {
    store.clear();
  },
});

const posts = defineCollection({
  loader: renderMode === 'ssr' ? emptyPostsLoader() : yuqueLoader(),
  schema: z.object({
    title: z.string(),
    date: z.date().optional(),
    updated: z.date().optional(),
    description: z.string().optional(),
    sort: z.number().optional(), // Add sort field
    locked: z.boolean().optional(),
  }),
});

export const collections = {
  posts,
};
