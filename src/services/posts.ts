import type { PostEntry } from '../types/post';
import { fetchYuquePostsRuntime } from './yuqueRuntime';

const getRenderMode = () => {
  const mode = (import.meta as any).env?.BLOG_RENDER_MODE ?? undefined;
  return String(mode ?? '').toLowerCase() || 'ssg';
};

export const isSSRMode = () => getRenderMode() === 'ssr';

export async function getAllPosts(): Promise<PostEntry[]> {
  if (isSSRMode()) return fetchYuquePostsRuntime();
  const { getCollection } = await import('astro:content');
  const posts = await getCollection('posts');
  return posts as unknown as PostEntry[];
}

export async function getPostById(id: string): Promise<PostEntry | null> {
  const posts = await getAllPosts();
  const normalized = String(id ?? '').replace(/^\/+|\/+$/g, '');
  return posts.find((p) => String(p.id) === normalized) ?? null;
}

