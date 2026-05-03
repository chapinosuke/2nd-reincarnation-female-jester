import { getCollection, type CollectionEntry } from 'astro:content';

export type Chapter = CollectionEntry<'chapters'>;

const KANJI_DIGITS: Record<string, number> = {
  〇: 0, 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10,
};

function parseChapterNumber(idOrTitle: string): number {
  // 第01話, 第1話, 第十話, 第二話 などに対応
  const arabic = idOrTitle.match(/第\s*(\d+)\s*話/);
  if (arabic) return parseInt(arabic[1], 10);
  const kanji = idOrTitle.match(/第\s*([〇一二三四五六七八九十]+)\s*話/);
  if (kanji) {
    const k = kanji[1];
    if (k.length === 1) return KANJI_DIGITS[k] ?? 0;
    if (k === '十') return 10;
    if (k.startsWith('十')) return 10 + (KANJI_DIGITS[k[1]] ?? 0);
    if (k.endsWith('十')) return (KANJI_DIGITS[k[0]] ?? 1) * 10;
    if (k.includes('十')) {
      const [a, b] = k.split('十');
      return (KANJI_DIGITS[a] ?? 1) * 10 + (KANJI_DIGITS[b] ?? 0);
    }
  }
  return 0;
}

export interface ChapterMeta {
  entry: Chapter;
  number: number;
  slug: string;
  titleLine: string;
  subtitleLine: string;
}

export async function getChapters(): Promise<ChapterMeta[]> {
  const all = await getCollection('chapters');
  const metas = all.map((entry) => {
    const number = parseChapterNumber(entry.id) || parseChapterNumber(entry.body ?? '');
    const slug = String(number).padStart(2, '0');
    // first non-empty line as title
    const lines = (entry.body ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const titleLine = entry.data.title ?? lines[0] ?? entry.id;
    const subtitleLine = entry.data.subtitle ?? '';
    return { entry, number, slug, titleLine, subtitleLine };
  });
  return metas.sort((a, b) => a.number - b.number);
}

export function neighbors(chapters: ChapterMeta[], current: ChapterMeta) {
  const idx = chapters.findIndex((c) => c.slug === current.slug);
  return {
    prev: idx > 0 ? chapters[idx - 1] : null,
    next: idx >= 0 && idx < chapters.length - 1 ? chapters[idx + 1] : null,
  };
}
