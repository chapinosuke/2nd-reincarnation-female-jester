import type { APIRoute } from 'astro';
import { NEWS, SITE_DESCRIPTION, SITE_TITLE } from '../lib/site';

export const prerender = true;

function xml(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
}

export const GET: APIRoute = ({ site }) => {
  const base = import.meta.env.BASE_URL;
  const origin = site ?? new URL('https://nidome-no-tensei.pages.dev');
  const siteUrl = new URL(base, origin).toString();
  const feedUrl = new URL(`${base}rss.xml`, origin).toString();
  const items = NEWS.map((item) => {
    const link = new URL(`${base}news/#${item.id}`, origin).toString();
    return `<item><title>${xml(item.title)}</title><link>${xml(link)}</link><guid>${xml(link)}</guid><pubDate>${new Date(`${item.date}T00:00:00+09:00`).toUTCString()}</pubDate><description>${xml(item.body)}</description></item>`;
  }).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>${xml(SITE_TITLE)}</title><link>${xml(siteUrl)}</link><description>${xml(SITE_DESCRIPTION)}</description><language>ja</language><atom:link xmlns:atom="http://www.w3.org/2005/Atom" href="${xml(feedUrl)}" rel="self" type="application/rss+xml"/>${items}</channel></rss>\n`, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
