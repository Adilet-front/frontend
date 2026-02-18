import type { UserProfileDto } from "./types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const profile: UserProfileDto = {
  id: "user-1",
  name: "Алина Серова",
  email: "alina@litres.local",
  bonusPoints: 120,
};

export const userApi = {
  getProfile: async (): Promise<UserProfileDto> => {
    await delay(300);
    return profile;
  },
};
