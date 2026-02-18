/**
 * API бронирований: создать, взять, вернуть, отменить; список своих и активных.
 */
import { apiClient } from "../../../shared/api/apiClient";
import type { Reservation } from "../model/types";

export type ReserveResponse = Reservation;

export const reserveBook = (bookId: number) =>
  apiClient.post<ReserveResponse>(`/reservations/${bookId}`);

export const takeReservation = (id: number) =>
  apiClient.post<void>(`/reservations/${id}/take`);

export const returnReservation = (id: number) =>
  apiClient.post<void>(`/reservations/${id}/return`);

export const cancelReservation = (id: number) =>
  apiClient.delete<void>(`/reservations/${id}`);

export type GetUserReservationsResponse = Reservation[];

export const getUserReservations = () =>
  apiClient.get<GetUserReservationsResponse>("/reservations/my");

export const getUserActiveReservations = () =>
  apiClient.get<GetUserReservationsResponse>("/reservations/my/active");
