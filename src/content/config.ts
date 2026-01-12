import { defineCollection, z } from 'astro:content';
import { yuqueLoader } from '../loaders/yuque';

const posts = defineCollection({
  loader: yuqueLoader(),
  schema: z.object({
    title: z.string(),
    date: z.date().optional(),
    description: z.string().optional(),
    sort: z.number().optional(), // Add sort field
  }),
});

export const collections = {
  posts,
};
