import hljs from 'highlight.js';
import { marked } from 'marked';

const decodeHtmlEntities = (input: string) =>
  input
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#([0-9]+);/g, (_, num) => String.fromCodePoint(parseInt(num, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

const highlightHtmlCodeBlocks = (html: string) =>
  html.replace(/<pre><code([^>]*)>([\s\S]*?)<\/code><\/pre>/g, (full, attrs, inner) => {
    const attrsStr = String(attrs || '');
    const classMatch = attrsStr.match(/\bclass="([^"]*)"/i);
    const className = classMatch?.[1] || '';
    if (/\bhljs\b/i.test(className)) return full;
    if (/<span\b/i.test(inner) || /\bhljs-/i.test(inner)) return full;

    const languageMatch = className.match(/\b(?:language|lang)-([a-zA-Z0-9_+-]+)\b/);
    const language = languageMatch?.[1]?.toLowerCase();
    const text = decodeHtmlEntities(inner);
    const hasLanguage = !!language && !!hljs.getLanguage(language);
    const result = hasLanguage
      ? hljs.highlight(text, { language, ignoreIllegals: true }).value
      : hljs.highlightAuto(text).value;
    const languageClass = language ? ` language-${language}` : '';
    return `<pre><code class="hljs${languageClass}">${result}</code></pre>`;
  });

export function renderMarkdownToHtml(markdown: string): string {
  const renderer = new marked.Renderer();
  renderer.code = ({ text, lang }: any) => {
    const language = (lang || '').trim().split(/\s+/)[0];
    const hasLanguage = !!language && !!hljs.getLanguage(language);
    const result = hasLanguage
      ? hljs.highlight(text, { language, ignoreIllegals: true }).value
      : hljs.highlightAuto(text).value;
    const languageClass = language ? ` language-${language}` : '';
    return `<pre><code class="hljs${languageClass}">${result}</code></pre>`;
  };
  renderer.image = ({ href, title, text }: any) => {
    const escapeAttr = (v: string) =>
      String(v ?? '')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    const src = escapeAttr(href || '');
    const alt = escapeAttr(text || '');
    const t = title ? ` title="${escapeAttr(title)}"` : '';
    return `<img src="${src}" alt="${alt}" loading="lazy" decoding="async"${t} />`;
  };
  const html = marked.parse(markdown, { renderer, breaks: true, gfm: true }) as string;
  return highlightHtmlCodeBlocks(html);
}
