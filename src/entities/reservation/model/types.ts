/**
 * Типы для системы бронирования книг
 */

export type ReservationStatus = 
  | "ACTIVE" 
  | "COMPLETED" 
  | "EXPIRED" 
  | "CANCELLED" 
  | "RETURNED";

export interface ReservationResponse {
  id: number;
  bookId: number;
  bookTitle: string;
  reservedAt: string;
  takenAt?: string;
  returnedAt?: string;
  status: ReservationStatus;
}

export interface BookHistoryEntry {
  id: number;
  userId: number;
  userName: string;
  reservedAt: string;
  takenAt?: string;
  returnedAt?: string;
  status: ReservationStatus;
}
