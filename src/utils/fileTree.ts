import type { CollectionEntry } from 'astro:content';

export interface TreeNode {
  name: string;
  type: 'file' | 'directory';
  slug?: string;
  children: TreeNode[];
  path: string;
}

export function buildFileTree(posts: CollectionEntry<'posts'>[]): TreeNode[] {
  const root: TreeNode[] = [];

  posts.forEach((post) => {
    const parts = post.slug.split('/');
    let currentLevel = root;
    let currentPath = '';

    parts.forEach((part, index) => {
      const isLast = index === parts.length - 1;
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      let existingNode = currentLevel.find((node) => node.name === part);

      if (!existingNode) {
        existingNode = {
          name: part,
          type: isLast ? 'file' : 'directory',
          children: [],
          path: currentPath,
          ...(isLast ? { slug: post.slug } : {}),
        };
        currentLevel.push(existingNode);
      }

      if (!isLast) {
        currentLevel = existingNode.children;
      }
    });
  });

  // Sort: directories first, then files, alphabetically
  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.type === b.type) {
        return a.name.localeCompare(b.name);
      }
      return a.type === 'directory' ? -1 : 1;
    });
    nodes.forEach((node) => {
      if (node.children.length > 0) {
        sortNodes(node.children);
      }
    });
  };

  sortNodes(root);
  return root;
}
