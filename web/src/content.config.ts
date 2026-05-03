import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const chapters = defineCollection({
  loader: glob({ pattern: '*.md', base: '../本編' }),
  schema: z
    .object({
      title: z.string().optional(),
      subtitle: z.string().optional(),
      cover: z.string().optional(),
    })
    .partial(),
});

export const collections = { chapters };
