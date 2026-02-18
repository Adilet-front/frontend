export type CatalogBookDto = {
  id: string;
  title: string;
  author: string;
  price: number;
  label?: "hit" | "exclusive" | "new";
  genre: "fiction" | "business" | "fantasy" | "self" | "kids" | "sci";
  format: "ebook" | "audio";
  language: "ru" | "en" | "kg";
  rating: number;
  popularity: number;
};

export type UserProfileDto = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bonusPoints: number;
};
