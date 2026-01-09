import { execSync } from 'node:child_process';
import type { CollectionEntry } from 'astro:content';
import path from 'node:path';

export function getPostDate(post: CollectionEntry<'posts'>): Date {
  if (post.data.date) {
    return post.data.date;
  }

  try {
    const filePath = path.join(process.cwd(), 'src/content/posts', post.id);
    const gitDate = execSync(`git log -1 --format=%cI "${filePath}"`, {
      encoding: 'utf-8',
    }).trim();

    if (gitDate) {
      return new Date(gitDate);
    }
  } catch (e) {
    console.warn(`Failed to get git date for ${post.id}`, e);
  }

  return new Date(); // Fallback to now if everything fails
}
