import axios from 'axios';
import type { PostEntry } from '../types/post';

const BASE_URL = 'https://www.yuque.com/api/v2';

type TocItem = {
  uuid: string;
  title?: string;
  slug?: string;
  url?: string;
  doc_id?: string | number;
  parent_uuid?: string | null;
};

type DocInfo = {
  id: string | number;
  slug: string;
  title: string;
  public: number;
  created_at: string;
  updated_at?: string;
  published_at?: string | null;
  description?: string;
};

const sanitizePathSegment = (input: string) => String(input ?? '').replace(/\//g, '-').trim();

const processBody = (content: string) => {
  if (!content) return '';
  return content.replace(/\s+style="[^"]*color:[^"]*"/gi, '');
};

const dedupeById = (items: DocInfo[]) => {
  const map = new Map<string, DocInfo>();
  for (const item of items) map.set(String(item.id), item);
  return Array.from(map.values());
};

const buildPaths = (toc: TocItem[], docsList: DocInfo[]) => {
  const pathMap = new Map<string, string>();
  const nodes = new Map<string, TocItem>();
  const docTitles = new Map<string, string>();

  for (const doc of docsList) docTitles.set(String(doc.id), doc.title);
  for (const item of toc) nodes.set(item.uuid, item);

  const getPath = (uuid: string): string => {
    const cached = pathMap.get(uuid);
    if (cached) return cached;

    const node = nodes.get(uuid);
    if (!node) return '';

    let segment = node.title || '';
    if (!segment && node.doc_id !== undefined && node.doc_id !== null) {
      const t = docTitles.get(String(node.doc_id));
      if (t) segment = t;
    }
    if (!segment) segment = node.slug || node.uuid;
    segment = sanitizePathSegment(segment);

    let full = segment;
    if (node.parent_uuid && nodes.has(node.parent_uuid)) {
      const parentPath = getPath(node.parent_uuid);
      if (parentPath) full = `${parentPath}/${full}`;
    }

    pathMap.set(uuid, full);
    return full;
  };

  for (const item of toc) getPath(item.uuid);
  return pathMap;
};

let cached: { expiresAt: number; posts: PostEntry[] } | null = null;

export async function fetchYuquePostsRuntime(): Promise<PostEntry[]> {
  const now = Date.now();
  if (cached && cached.expiresAt > now) return cached.posts;

  const token = process.env.YUQUE_TOKEN;
  const login = process.env.YUQUE_LOGIN;
  const repo = process.env.YUQUE_REPO;
  const ttlMsRaw = process.env.YUQUE_CACHE_TTL_MS;
  const ttlMs = ttlMsRaw ? Number(ttlMsRaw) : 5 * 60 * 1000;

  if (!token || !login || !repo) return [];

  const namespace = `${login}/${repo}`;
  const headers = { 'X-Auth-Token': token };

  const tocResponse = await axios.get(`${BASE_URL}/repos/${namespace}/toc`, { headers });
  const toc = (tocResponse.data?.data ?? []) as TocItem[];

  const docsResponse = await axios.get(`${BASE_URL}/repos/${namespace}/docs`, { headers });
  const docsListRaw = (docsResponse.data?.data ?? []) as DocInfo[];
  const docsList = dedupeById(docsListRaw).filter((d) => !!d.published_at);

  const pathMap = buildPaths(toc, docsList);

  const posts: PostEntry[] = [];
  for (const docInfo of docsList) {
    const sortOrder = toc.findIndex((t) => String(t.doc_id) === String(docInfo.id) || t.url === docInfo.slug);
    const tocItem = toc.find((t) => String(t.doc_id) === String(docInfo.id) || t.url === docInfo.slug);

    let id = sanitizePathSegment(docInfo.title) || docInfo.slug;
    if (tocItem) {
      const full = pathMap.get(tocItem.uuid);
      if (full) id = full;
    }

    const detailResponse = await axios.get(`${BASE_URL}/repos/${namespace}/docs/${docInfo.slug}?raw=1`, { headers });
    const detail = detailResponse.data?.data ?? {};
    const updatedAt = docInfo.updated_at || detail.updated_at || docInfo.created_at;
    const body = processBody(String(detail.body ?? ''));

    posts.push({
      id,
      body,
      data: {
        title: docInfo.title,
        date: docInfo.created_at ? new Date(docInfo.created_at) : undefined,
        updated: updatedAt ? new Date(updatedAt) : undefined,
        description: docInfo.description,
        sort: sortOrder !== -1 ? sortOrder : 999999,
        locked: docInfo.public === 0,
      },
    });
  }

  cached = { expiresAt: now + (Number.isFinite(ttlMs) ? ttlMs : 5 * 60 * 1000), posts };
  return posts;
}

