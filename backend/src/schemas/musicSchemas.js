import { z } from "zod";

const sortableFields = ["createdAt", "title", "artist"];
const sortOrder = ["asc", "desc"];

const isValidDateString = (value) => !Number.isNaN(new Date(value).getTime());

export const createMusicBodySchema = z.object({
  title: z.string().trim().min(1, "Title não pode ser vazio"),
  artist: z.string().trim().min(1, "Artist não pode ser vazio"),
  url: z.string().trim().url("URL inválida").optional()
});

export const updateMusicBodySchema = z
  .object({
    title: z.string().trim().min(1, "Title não pode ser vazio").optional(),
    artist: z.string().trim().min(1, "Artist não pode ser vazio").optional(),
    url: z.string().trim().url("URL inválida").optional()
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Envie pelo menos um campo para atualizar"
  });

export const listMusicsQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    sortBy: z.enum(sortableFields).default("createdAt"),
    sortOrder: z.enum(sortOrder).default("desc"),
    title: z.string().trim().min(1, "Filtro 'title' não pode ser vazio").optional(),
    artist: z.string().trim().min(1, "Filtro 'artist' não pode ser vazio").optional(),
    userId: z.coerce.number().int().positive().optional(),
    createdFrom: z.string().optional(),
    createdTo: z.string().optional()
  })
  .refine((data) => !data.createdFrom || isValidDateString(data.createdFrom), {
    message: "Filtro 'createdFrom' inválido",
    path: ["createdFrom"]
  })
  .refine((data) => !data.createdTo || isValidDateString(data.createdTo), {
    message: "Filtro 'createdTo' inválido",
    path: ["createdTo"]
  })
  .refine(
    (data) => {
      if (!data.createdFrom || !data.createdTo) return true;
      return new Date(data.createdFrom) <= new Date(data.createdTo);
    },
    {
      message: "Filtro 'createdFrom' não pode ser maior que 'createdTo'",
      path: ["createdFrom"]
    }
  );

export const musicIdParamsSchema = z.object({
  id: z.coerce.number().int().positive()
});
