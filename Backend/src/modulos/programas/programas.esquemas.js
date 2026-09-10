const { z } = require('zod');

const cuerpo = z.object({
  id: z.string().trim().max(80).optional(),
  title: z.string().trim().min(1, 'El título es obligatorio.').max(200),
  level: z.enum(['FID', 'Técnica', 'Formación Continua']),
  category: z.string().trim().max(150).optional().default(''),
  duration: z.string().trim().max(120).optional().default(''),
  durationSemesters: z.number().int().min(0).max(40).optional().nullable(),
  degreeAwarded: z.string().trim().max(255).optional().default(''),
  normative: z.string().trim().max(150).optional().default(''),
  vacancies: z.coerce.number().int().min(0).max(9999).default(0),
  ageRange: z.string().trim().max(150).optional().nullable(),
  shifts: z.array(z.string()).default([]),
  description: z.string().optional().default(''),
  profile: z.string().optional().default(''),
  fieldOfWork: z.array(z.string()).default([]),
  image: z.string().trim().max(1000).optional().default(''),
  featured: z.boolean().optional().default(false),
});

module.exports = { cuerpo };
