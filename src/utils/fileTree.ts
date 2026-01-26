import type { PostEntry } from '../types/post';

export interface TreeNode {
  name: string;
  type: 'file' | 'directory';
  slug?: string;
  title?: string; // Add title for display
  sort?: number; // Add sort for ordering
  children: TreeNode[];
  path: string;
}

export function buildFileTree(posts: PostEntry[]): TreeNode[] {
  const root: TreeNode[] = [];

  posts.forEach((post) => {
    // Astro 5 Content Loader uses 'id' for the unique identifier/path
    // Legacy content collections used 'slug', but custom loaders set 'id'
    // @ts-ignore
    const pathId = post.id || post.slug; 
    
    if (!pathId) {
        console.warn('Post missing id/slug:', post);
        return;
    }

    const parts = pathId.split('/');
    let currentLevel = root;
    let currentPath = '';

    parts.forEach((part: string, index: number) => {
      // Skip empty parts or parts that are just whitespace/special chars that shouldn't be there
      // Also filter out any parts that might be just '#' if that's what's causing issues
      if (!part || part.trim() === '' || part === '#') return;

      const isLast = index === parts.length - 1;
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      // Use post title for file name display if it's a file node
      // Ensure we don't display undefined.md
      const safeTitle = post.data.title || 'Untitled';
      const displayName = isLast ? `${safeTitle}` : part;

      // Try to find existing node matching either the exact part name or the file name (part + .md)
      // This allows merging a directory "Folder" with a file "Folder.md" into a single node
      let existingNode = currentLevel.find((node) => 
          node.name === displayName || 
          node.name === part || 
          node.name === `${part}`
      );

      if (!existingNode) {
        existingNode = {
          name: displayName,
          type: isLast ? 'file' : 'directory',
          children: [],
          path: currentPath,
          ...(isLast ? { slug: post.id, title: safeTitle, sort: post.data.sort } : {}), // Use id as slug for routing
        };
        currentLevel.push(existingNode);
      } else {
        // If merging a file into an existing directory node, or vice versa
        if (isLast) {
            // We found a directory that matches this file. Update it to be a file-with-children?
            // Actually, keep it as 'directory' but add slug/title so it can be linked.
            // Or keep as 'file' but it has children?
            // Let's ensure it has the slug/title info.
            existingNode.slug = post.id;
            existingNode.title = safeTitle;
            if (post.data.sort !== undefined) existingNode.sort = post.data.sort;
            // Update name to include .md if it was just a directory before?
            // If we want it to look like a file, yes.
            if (!existingNode.name.endsWith('.md')) {
                existingNode.name = `${existingNode.name}`;
            }
        }
      }

      if (!isLast) {
        currentLevel = existingNode.children;
      }
    });
  });

  // Sort: directories first, then files, alphabetically
  // But merged nodes might be 'directory' with a name ending in .md
  // Updated: Sort by 'sort' field if available, then by type, then by name
  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      // Primary sort: explicit sort order (from Yuque TOC)
      if (a.sort !== undefined && b.sort !== undefined) {
          return a.sort - b.sort;
      }
      // If one has sort and other doesn't? Put sorted ones first? Or last?
      // Usually TOC items all have an index if we process them right.
      // But pure folders created implicitly might not have one.
      // Let's assume nodes with explicit sort come first.
      if (a.sort !== undefined) return -1;
      if (b.sort !== undefined) return 1;

      // Secondary sort: Type (Folders first)
      const aIsDir = a.children.length > 0 || a.type === 'directory';
      const bIsDir = b.children.length > 0 || b.type === 'directory';

      if (aIsDir === bIsDir) {
        return a.name.localeCompare(b.name);
      }
      return aIsDir ? -1 : 1;
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
