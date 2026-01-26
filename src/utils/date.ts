import type { PostEntry } from '../types/post';

export function getPostDate(post: PostEntry): Date {
  return post.data.date ?? post.data.updated ?? new Date();
}
