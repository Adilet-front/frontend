import type { CatalogBookDto } from "./types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const books: CatalogBookDto[] = [
  {
    id: "c1",
    title: "Чистая архитектура",
    author: "Р. Мартин",
    price: 379,
    label: "hit",
    genre: "business",
    format: "ebook",
    language: "ru",
    rating: 4.7,
    popularity: 91,
  },
  {
    id: "c2",
    title: "Сквозь шторм",
    author: "Н. Гейман",
    price: 299,
    label: "new",
    genre: "fantasy",
    format: "audio",
    language: "ru",
    rating: 4.4,
    popularity: 72,
  },
  {
    id: "c3",
    title: "Тонкое искусство",
    author: "М. Мэнсон",
    price: 279,
    label: "hit",
    genre: "self",
    format: "ebook",
    language: "ru",
    rating: 4.5,
    popularity: 88,
  },
  {
    id: "c4",
    title: "Project Phoenix",
    author: "Gene Kim",
    price: 349,
    label: "exclusive",
    genre: "business",
    format: "ebook",
    language: "en",
    rating: 4.6,
    popularity: 83,
  },
  {
    id: "c5",
    title: "Dune",
    author: "F. Herbert",
    price: 329,
    label: "hit",
    genre: "sci",
    format: "audio",
    language: "en",
    rating: 4.8,
    popularity: 95,
  },
  {
    id: "c8",
    title: "Harry Potter",
    author: "J. Rowling",
    price: 399,
    label: "exclusive",
    genre: "fantasy",
    format: "ebook",
    language: "en",
    rating: 4.9,
    popularity: 99,
  },
  {
    id: "c11",
    title: "Atomic Habits",
    author: "J. Clear",
    price: 359,
    label: "hit",
    genre: "self",
    format: "ebook",
    language: "en",
    rating: 4.8,
    popularity: 96,
  },
  {
    id: "c13",
    title: "Китеп сүйүү",
    author: "А. Токтогул",
    price: 199,
    label: "new",
    genre: "fiction",
    format: "ebook",
    language: "kg",
    rating: 4.0,
    popularity: 58,
  },
];

export const catalogApi = {
  getPopular: async (): Promise<CatalogBookDto[]> => {
    await delay(400);
    return [...books].sort((a, b) => b.popularity - a.popularity).slice(0, 6);
  },
  getNew: async (): Promise<CatalogBookDto[]> => {
    await delay(450);
    return books.filter((book) => book.label === "new").slice(0, 6);
  },
  getById: async (id: string): Promise<CatalogBookDto | null> => {
    await delay(350);
    return books.find((book) => book.id === id) ?? null;
  },
};
