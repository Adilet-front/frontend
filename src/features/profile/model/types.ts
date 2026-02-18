import type { User } from "../../../entities/user/model/types";
import type { Reservation } from "../../../entities/booking/model/types";

export type ProfileViewModel = {
  user: User;
  bookings: Reservation[];
};
