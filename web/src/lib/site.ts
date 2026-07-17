export const SITE_TITLE = '2度目の転生は女遊び人でした';
export const SITE_DESCRIPTION =
  '戦えない。魔法も使えない。装備はバニーガール衣装のみ。灰鷲ギルドの昼の書類から、陽気な冒険者の夜の話を——異世界お色気コメディ、連載中。';
export const SITE_AUTHOR = 'chapinosuke';
export const REPOSITORY_URL = 'https://github.com/chapinosuke/2nd-reincarnation-female-jester';

export interface NewsItem {
  id: string;
  date: string;
  title: string;
  body: string;
}

export const NEWS: NewsItem[] = [
  {
    id: '2026-07-18-reader',
    date: '2026-07-18',
    title: '読書機能と検索・共有情報を改善しました',
    body: '読書進捗、続きから読む、スマホ用の前後話ナビ、各話の検索向け情報を追加しました。',
  },
  {
    id: '2026-07-12-volume-one',
    date: '2026-07-12',
    title: '第1巻・全20話を公開しました',
    body: 'ミアたち四人の出会いから峠越えまでを描く、第1巻相当の全20話をお読みいただけます。',
  },
  {
    id: '2026-07-06-open',
    date: '2026-07-06',
    title: '作品公式サイトを開設しました',
    body: '本編、人物、世界観、帳簿、画廊をまとめた「2度目の転生は女遊び人でした」公式WEBサイトです。',
  },
];

export function displayDate(date: string) {
  const [year, month, day] = date.split('-');
  return `${year}.${month}.${day}`;
}
