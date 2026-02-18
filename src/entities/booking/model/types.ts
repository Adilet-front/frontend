/** Статус брони с бэкенда */
export type ReservationStatus =
  | "ACTIVE"
  | "COMPLETED"
  | "EXPIRED"
  | "CANCELLED"
  | "RETURNED";

/** Модель брони (ответ API reservations) */
export type Reservation = {
  id: number;
  bookId: number;
  bookTitle: string;
  reservedAt?: string;
  takenAt?: string;
  returnedAt?: string;
  status: ReservationStatus;
};
