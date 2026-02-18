/**
 * API для работы с бронированиями книг
 */
import type { AxiosResponse } from "axios";
import { apiClient } from "../../../shared/api/apiClient";
import type { ReservationResponse, BookHistoryEntry } from "../model/types";

/**
 * Забронировать книгу
 */
export const reserveBook = (bookId: number): Promise<AxiosResponse<ReservationResponse>> =>
  apiClient.post<ReservationResponse>(`/reservations/${bookId}`);

/**
 * Взять забронированную книгу (получить физически)
 */
export const takeReservedBook = (reservationId: number): Promise<AxiosResponse<void>> =>
  apiClient.post<void>(`/reservations/${reservationId}/take`);

/**
 * Вернуть книгу
 */
export const returnBook = (reservationId: number): Promise<AxiosResponse<void>> =>
  apiClient.post<void>(`/reservations/${reservationId}/return`);

/**
 * Отменить бронирование
 */
export const cancelReservation = (reservationId: number): Promise<AxiosResponse<void>> =>
  apiClient.delete<void>(`/reservations/${reservationId}`);

/**
 * Получить все мои бронирования
 */
export const getMyReservations = (): Promise<AxiosResponse<ReservationResponse[]>> =>
  apiClient.get<ReservationResponse[]>("/reservations/my");

/**
 * Получить активные бронирования (незавершенные)
 */
export const getMyActiveReservations = (): Promise<AxiosResponse<ReservationResponse[]>> =>
  apiClient.get<ReservationResponse[]>("/reservations/my/active");

/**
 * Получить список просроченных книг
 */
export const getOverdueReservations = (): Promise<AxiosResponse<ReservationResponse[]>> =>
  apiClient.get<ReservationResponse[]>("/reservations/overdue");

/**
 * Получить историю книги (кто брал)
 */
export const getBookHistory = (bookId: number): Promise<AxiosResponse<BookHistoryEntry[]>> =>
  apiClient.get<BookHistoryEntry[]>(`/books/${bookId}/history`);
