import type { APIRoute } from 'astro';
import { getChapters } from '../lib/chapters';

export const prerender = true;

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export const GET: APIRoute = async ({ site }) => {
  const base = import.meta.env.BASE_URL;
  const origin = site ?? new URL('https://chapinosuke.github.io');
  const chapters = await getChapters();
  const paths = [
    base,
    `${base}news/`,
    `${base}story/`,
    `${base}movie/`,
    `${base}characters/`,
    `${base}world/`,
    `${base}ledger/`,
    `${base}gallery/`,
    ...chapters.map((chapter) => `${base}chapter/${chapter.slug}/`),
  ];

  const urls = paths
    .map((path) => `  <url><loc>${escapeXml(new URL(path, origin).toString())}</loc></url>`)
    .join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
