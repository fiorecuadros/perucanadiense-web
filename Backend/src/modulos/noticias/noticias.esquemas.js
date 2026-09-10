const { z } = require('zod');

const cuerpo = z.object({
  id: z.string().trim().max(160).optional(),
  title: z.string().trim().min(1, 'El título es obligatorio.').max(255),
  category: z.enum(['noticia', 'comunicado', 'evento']).default('noticia'),
  categoryLabel: z.string().trim().max(60).optional(),
  excerpt: z.string().trim().max(1000).optional().default(''),
  paragraphs: z.array(z.string()).default([]),
  image: z.string().trim().max(1000).optional().default(''),
  imageAlt: z.string().trim().max(255).optional().default(''),
  createdAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener formato AAAA-MM-DD.')
    .optional(),
  featured: z.boolean().optional().default(false),
  publicada: z.boolean().optional().default(true),
});

module.exports = { cuerpo };
