import axios from 'axios';
import dotenv from 'dotenv';
import type { Loader } from 'astro/loaders';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

// Load environment variables
dotenv.config();

const { YUQUE_TOKEN, YUQUE_LOGIN, YUQUE_REPO } = process.env;
const BASE_URL = 'https://www.yuque.com/api/v2';
const ASSETS_DIR = path.join(process.cwd(), 'public/images/yuque');

// Ensure assets dir exists
async function ensureAssetsDir() {
  try {
    await fs.access(ASSETS_DIR);
  } catch {
    await fs.mkdir(ASSETS_DIR, { recursive: true });
  }
}

// Download image and return local path
async function downloadImage(url: string, logger: any): Promise<string> {
  try {
    // If it's already a relative path or not a yuque image, skip
    if (!url.startsWith('http')) return url;
    
    // Hash url to get unique filename
    const hash = crypto.createHash('md5').update(url).digest('hex');
    const ext = path.extname(url.split('?')[0]) || '.png';
    const filename = `${hash}${ext}`;
    const localPath = path.join(ASSETS_DIR, filename);
    const publicPath = `/images/yuque/${filename}`;

    // Check if file exists
    try {
      await fs.access(localPath);
      return publicPath;
    } catch {
      // Download
      // logger.info(`Downloading image: ${url}`);
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      await fs.writeFile(localPath, response.data);
      return publicPath;
    }
  } catch (e) {
    logger.warn(`Failed to download image: ${url}`);
    return url;
  }
}

// Process markdown content to replace images
async function processContent(content: string, logger: any): Promise<string> {
  if (!content) return '';
  // Regex to match markdown images: ![alt](url)
  const imgRegex = /!\[(.*?)\]\((.*?)\)/g;
  let newContent = content;
  
  const matches = [...content.matchAll(imgRegex)];
  
  for (const match of matches) {
    const [fullMatch, alt, url] = match;
    // Only process Yuque CDN images
    if (url.includes('yuque.com') || url.includes('larksuitecdn') || url.includes('nlark.com')) {
        const localUrl = await downloadImage(url, logger);
        newContent = newContent.replace(fullMatch, `![${alt}](${localUrl})`);
    }
  }
  
  // Also handle HTML <img> tags
  const htmlImgRegex = /<img[^>]+src="([^">]+)"/g;
  const htmlMatches = [...content.matchAll(htmlImgRegex)];
  
  for (const match of htmlMatches) {
    const [fullMatch, url] = match;
     if (url.includes('yuque.com') || url.includes('larksuitecdn') || url.includes('nlark.com')) {
        const localUrl = await downloadImage(url, logger);
        newContent = newContent.replace(url, localUrl);
    }
  }

  // Remove inline styles that set color (black text on black background)
  // Regex to match style="..." containing "color:" and remove the whole style attribute or just the color property?
  // Safest is to remove the whole style attribute if it contains color, as it's usually just color/font-size
  // which we want to override with our theme anyway.
  // Matches: style="...color:..." (case insensitive)
  newContent = newContent.replace(/\s+style="[^"]*color:[^"]*"/gi, '');

  return newContent;
}

// Helper to construct path from TOC tree
function buildPaths(toc: any[], docsList: any[], logger?: any) {
  const pathMap = new Map<string, string>(); // uuid -> fullPath
  const nodes = new Map<string, any>();
  
  // Create a map of doc_id -> doc_title for fallback
  // Ensure keys are strings for consistent lookup
  const docTitles = new Map<string, string>();
  docsList.forEach(doc => docTitles.set(String(doc.id), doc.title));
  
  // Initialize nodes
  toc.forEach(item => nodes.set(item.uuid, item));

  // Recursive function to build path
  function getPath(uuid: string): string {
    if (pathMap.has(uuid)) return pathMap.get(uuid)!;
    
    const node = nodes.get(uuid);
    if (!node) return '';

    // Use title for all path segments to ensure readability in file tree
    // Priority: node.title -> doc_title (via doc_id) -> slug -> uuid
    
    let segment = node.title;
    
    if (!segment && node.doc_id) {
        const docIdStr = String(node.doc_id);
        if (docTitles.has(docIdStr)) {
            segment = docTitles.get(docIdStr);
        }
    }
    
    if (!segment) {
        segment = node.slug || node.uuid;
    }
    
    // Sanitize segment to be path-safe (replace slashes with dashes)
    // segment = segment.replace(/\//g, '-');
    // Don't replace slashes! We need them for directory structure.
    // Only sanitize other invalid chars if needed? 
    // Yuque titles might contain slashes which are valid in titles but maybe tricky in paths if they aren't meant to be directories.
    // But here 'segment' is a single node title. If a title contains '/', Astro might treat it as a subdir.
    // Usually titles don't contain slashes. If they do, we probably should escape them or replace them.
    // But 'path' constructed below joins segments with '/'.
    // Wait, 'segment' is just ONE node's name.
    
    // If a node title is "A/B", and it's a leaf, path becomes ".../A/B". Astro sees directory "A" and file "B".
    // This might be unintended. We should replace '/' in *segments* but NOT in the full path construction.
    
    segment = segment.replace(/\//g, '-'); 

    let path = segment;
    
    // Check parent
    if (node.parent_uuid && nodes.has(node.parent_uuid)) {
      const parentPath = getPath(node.parent_uuid);
      if (parentPath) {
        path = `${parentPath}/${path}`;
      }
    }
    
    pathMap.set(uuid, path);
    return path;
  }

  // Build all paths
  toc.forEach(item => getPath(item.uuid));
  
  // Debug log sample paths
  if (logger) {
      logger.info(`Built ${pathMap.size} paths from TOC.`);
      // Log a few paths that have depth > 1 to verify structure
      const deepPaths = Array.from(pathMap.entries()).filter(([_, p]) => p.includes('/'));
      if (deepPaths.length > 0) {
          logger.info(`Sample deep paths: ${JSON.stringify(deepPaths.slice(0, 3))}`);
      } else {
          logger.warn('No deep paths found! All paths seem to be flat.');
          // Log raw TOC items with parent_uuid to debug
          const itemsWithParent = toc.filter(t => t.parent_uuid);
          logger.info(`Items with parent_uuid: ${itemsWithParent.length}`);
          if (itemsWithParent.length > 0) {
              logger.info(`Sample item with parent: ${JSON.stringify(itemsWithParent[0])}`);
          }
      }
  }
  
  return pathMap;
}

export function yuqueLoader(): Loader {
  return {
    name: 'yuque-loader',
    load: async ({ store, logger, parseData, generateDigest }) => {
      if (!YUQUE_TOKEN || !YUQUE_LOGIN || !YUQUE_REPO) {
        logger.warn('Missing Yuque configuration. Skipping loader.');
        return;
      }

      const namespace = `${YUQUE_LOGIN}/${YUQUE_REPO}`;
      logger.info(`Fetching data from Yuque: ${namespace}`);

      try {
        // Clear store to remove orphaned entries from previous builds
        // This is crucial when we change the ID generation strategy
        store.clear();

        await ensureAssetsDir();
        
        // 1. Fetch TOC to determine structure
        const tocResponse = await axios.get(`${BASE_URL}/repos/${namespace}/toc`, {
          headers: { 'X-Auth-Token': YUQUE_TOKEN }
        });
        const toc = tocResponse.data.data;

        // 2. Fetch Docs List
        const docsResponse = await axios.get(`${BASE_URL}/repos/${namespace}/docs`, {
            headers: { 'X-Auth-Token': YUQUE_TOKEN }
        });
        const rawDocsList = docsResponse.data.data;
        
        // Deduplicate docsList by id
        const docsList = Array.from(new Map(rawDocsList.map((item: any) => [item.id, item])).values());
        
        // Build paths using both TOC and Docs List (for title fallback)
        const pathMap = buildPaths(toc, docsList, logger);

        logger.info(`Found ${docsList.length} unique docs (from ${rawDocsList.length} total). Starting download...`);

        // 3. Process each doc
        let loadedCount = 0;
        for (const docInfo of docsList) {
          if (!docInfo.published_at) continue; // Skip unpublished

          // Fetch full content
          const detailResponse = await axios.get(`${BASE_URL}/repos/${namespace}/docs/${docInfo.slug}?raw=1`, {
            headers: { 'X-Auth-Token': YUQUE_TOKEN }
          });
          const detail = detailResponse.data.data;

          // Find path from TOC
          // Ensure loose comparison for ID (string vs number)
          const tocItem = toc.find((t: any) => String(t.doc_id) === String(docInfo.id) || t.url === docInfo.slug);
          
          // Get sort order from TOC (index in array effectively, but let's use explicit index if possible)
          // Yuque API TOC response is usually sorted. We can use the index in TOC array.
          const sortOrder = toc.findIndex((t: any) => String(t.doc_id) === String(docInfo.id) || t.url === docInfo.slug);
          
          let slug = docInfo.slug;
          if (tocItem) {
             const fullPath = pathMap.get(tocItem.uuid);
             if (fullPath) slug = fullPath;
          } else {
             // If not in TOC, use title as filename to avoid ugly slugs in file tree
             slug = docInfo.title;
          }
          
          // Sanitize slug
          // slug = slug.replace(/\//g, '-'); // DON'T DO THIS for the full path!
          // We want to preserve the slashes from 'fullPath' (which came from buildPaths)
          // buildPaths already joins segments with '/'.
          
          // If slug came from docInfo.title (fallback), we might want to sanitize it if it has slashes?
          // But usually we want to keep structure.
          
          // Use the slug as ID. This allows fileTree.ts to generate the sidebar structure
          // based on the directory-like path we constructed from TOC.
          
          const isLocked = docInfo.public === 0;
          
          const data = await parseData({
            id: slug,
            data: {
              title: docInfo.title,
              description: docInfo.description || '',
              date: new Date(docInfo.created_at),
              updated: new Date((docInfo as any).updated_at || (detail as any).updated_at || docInfo.created_at),
              sort: sortOrder !== -1 ? sortOrder : 999999, // Store sort order
              locked: isLocked,
            }
          });
          
          const processedBody = await processContent(detail.body, logger);
          const digest = generateDigest(processedBody);

          store.set({
            id: slug,
            data,
            body: processedBody,
            digest,
            rendered: {
                html: '', // Let Astro render markdown later if we don't provide HTML here? 
                          // Actually for 'content' loader, 'body' is raw content.
                          // Wait, Astro Loader API stores raw data. 
                          // If we want Markdown rendering, we should behave like a content loader.
                          // Astro 5 Content Loader puts body in the store.
            }
          });
          loadedCount += 1;
        }
        
        logger.info(`Successfully loaded ${loadedCount} docs from Yuque.`);

      } catch (error: any) {
        logger.error(`Yuque Loader Error: ${error.message}`);
        if (error.response) {
            logger.error(JSON.stringify(error.response.data));
        }
        throw error;
      }
    }
  };
}
