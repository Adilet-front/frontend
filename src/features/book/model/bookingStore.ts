import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Book } from "../../../entities/book/ui/BookCard";
import i18n from "../../../app/i18n";

type ReadingStatus = "WILL_READ" | "READING";

type Booking = {
  bookId: number;
  readingStatus: ReadingStatus;
  active: boolean;
  bookedAt?: number;
  reservedUntil?: number;
  borrowedAt?: number;
  expectedReturnAt?: number;
  returnedAt?: number;
  cancelledAt?: number;
  wasWishBeforeReserve?: boolean;
  reminders?: {
    twoWeeks?: boolean;
    fourWeeks?: boolean;
  };
  bookSnapshot: Book & { location?: string };
};

type Notification = {
  id: string;
  message: string;
  createdAt: number;
};

type BookingState = {
  bookings: Booking[];
  notifications: Notification[];
  getBooking: (bookId: number) => Booking | undefined;
  getBookStatus: (bookId: number) => "AVAILABLE" | "RESERVED" | "BORROWED";
  getWishlist: () => Booking[];
  addWish: (book: Book & { location?: string }) => void;
  removeWish: (bookId: number) => void;
  reserveBook: (book: Book & { location?: string }) => { ok: boolean; reason?: string };
  takeBook: (bookId: number) => { ok: boolean; reason?: string };
  returnBook: (bookId: number) => { ok: boolean; reason?: string };
  autoCancelExpired: (now?: number) => void;
  checkReadingReminders: (now?: number) => void;
  clearNotifications: () => void;
};

const addHours = (time: number, hours: number) => time + hours * 60 * 60 * 1000;
const addDays = (time: number, days: number) => time + days * 24 * 60 * 60 * 1000;
const daysBetween = (from: number, to: number) =>
  Math.floor((to - from) / (24 * 60 * 60 * 1000));

const createNotification = (message: string): Notification => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  message,
  createdAt: Date.now(),
});

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      bookings: [],
      notifications: [],
      getBooking: (bookId) => get().bookings.find((item) => item.bookId === bookId),
      getBookStatus: (bookId) => {
        const booking = get().bookings.find((item) => item.bookId === bookId);
        if (
          booking?.active &&
          booking.borrowedAt &&
          booking.readingStatus === "READING"
        ) {
          return "BORROWED";
        }
        if (
          booking?.active &&
          booking.bookedAt &&
          booking.reservedUntil &&
          booking.readingStatus === "WILL_READ" &&
          booking.reservedUntil > Date.now()
        ) {
          return "RESERVED";
        }
        return "AVAILABLE";
      },
      getWishlist: () =>
        get().bookings.filter(
          (item) => item.active && item.readingStatus === "WILL_READ",
        ),
      addWish: (book) =>
        set((state) => {
          const existing = state.bookings.find((item) => item.bookId === book.id);
          if (existing) {
            if (existing.active && existing.readingStatus === "WILL_READ") {
              return state;
            }
            return {
              bookings: state.bookings.map((item) =>
                item.bookId === book.id
                  ? {
                      ...item,
                      active: true,
                      readingStatus: "WILL_READ",
                      bookedAt: undefined,
                      reservedUntil: undefined,
                      borrowedAt: undefined,
                      expectedReturnAt: undefined,
                      returnedAt: undefined,
                      cancelledAt: undefined,
                      bookSnapshot: { ...item.bookSnapshot, ...book },
                    }
                  : item,
              ),
            };
          }
          return {
            bookings: [
              ...state.bookings,
              {
                bookId: book.id,
                readingStatus: "WILL_READ",
                active: true,
                bookSnapshot: book,
              },
            ],
          };
        }),
      removeWish: (bookId) =>
        set((state) => ({
          bookings: state.bookings.map((item) =>
            item.bookId === bookId && !item.bookedAt && !item.borrowedAt
              ? { ...item, active: false }
              : item,
          ),
        })),
      reserveBook: (book) => {
        const now = Date.now();
        const state = get();
        const booking = state.bookings.find((item) => item.bookId === book.id);
        const activeReserved = state.bookings.filter(
          (item) =>
            item.active &&
            item.bookedAt &&
            item.reservedUntil &&
            item.reservedUntil > now &&
            item.readingStatus === "WILL_READ",
        );
        if (activeReserved.length >= 3) {
          return { ok: false, reason: "limit" };
        }
        if (
          booking?.active &&
          ((booking.bookedAt && booking.reservedUntil && booking.reservedUntil > now) ||
            booking.borrowedAt)
        ) {
          return { ok: false, reason: "unavailable" };
        }

        const updated: Booking[] = booking
          ? state.bookings.map(
              (item): Booking =>
                item.bookId === book.id
                  ? {
                      ...item,
                      active: true,
                      readingStatus: "WILL_READ" as ReadingStatus,
                      bookedAt: now,
                      reservedUntil: addHours(now, 24),
                      cancelledAt: undefined,
                      wasWishBeforeReserve:
                        item.active &&
                        item.readingStatus === "WILL_READ" &&
                        !item.bookedAt,
                      bookSnapshot: { ...item.bookSnapshot, ...book },
                    }
                  : item,
            )
          : [
              ...state.bookings,
              {
                bookId: book.id,
                readingStatus: "WILL_READ" as ReadingStatus,
                active: true,
                bookedAt: now,
                reservedUntil: addHours(now, 24),
                wasWishBeforeReserve: false,
                bookSnapshot: book,
              },
            ];

        set(() => ({
          bookings: updated,
          notifications: [
            ...state.notifications,
            createNotification(
              i18n.t("bookingNotifications.reservePickup", {
                title: book.title,
                location: book.location ?? "—",
              }),
            ),
          ],
        }));
        return { ok: true };
      },
      takeBook: (bookId) => {
        const now = Date.now();
        const state = get();
        const booking = state.bookings.find((item) => item.bookId === bookId);
        if (!booking?.active || !booking.bookedAt || !booking.reservedUntil) {
          return { ok: false, reason: "no-reservation" };
        }
        if (booking.reservedUntil <= now) {
          return { ok: false, reason: "expired" };
        }
        const updated: Booking[] = state.bookings.map(
          (item): Booking =>
            item.bookId === bookId
              ? {
                  ...item,
                  readingStatus: "READING" as ReadingStatus,
                  borrowedAt: now,
                  expectedReturnAt: addDays(now, 28),
                }
              : item,
        );
        set(() => ({
          bookings: updated,
          notifications: [
            ...state.notifications,
            createNotification(
              i18n.t("bookingNotifications.takeSuccess", {
                title: booking.bookSnapshot.title,
                date: new Date(addDays(now, 28)).toLocaleDateString(i18n.language),
              }),
            ),
          ],
        }));
        return { ok: true };
      },
      returnBook: (bookId) => {
        const now = Date.now();
        const state = get();
        const booking = state.bookings.find((item) => item.bookId === bookId);
        if (!booking?.active || !booking.borrowedAt) {
          return { ok: false, reason: "no-borrow" };
        }
        const daysHeld = daysBetween(booking.borrowedAt, now);
        const updated: Booking[] = state.bookings.map(
          (item): Booking =>
            item.bookId === bookId
              ? {
                  ...item,
                  active: item.wasWishBeforeReserve ? true : false,
                  readingStatus: (item.wasWishBeforeReserve
                    ? "WILL_READ"
                    : "READING") as ReadingStatus,
                  bookedAt: undefined,
                  reservedUntil: undefined,
                  borrowedAt: undefined,
                  expectedReturnAt: undefined,
                  returnedAt: now,
                  cancelledAt: undefined,
                }
              : item,
        );
        set(() => ({
          bookings: updated,
          notifications: [
            ...state.notifications,
            createNotification(
              i18n.t("bookingNotifications.returnSuccess", {
                title: booking.bookSnapshot.title,
                days: daysHeld,
              }),
            ),
          ],
        }));
        return { ok: true };
      },
      autoCancelExpired: (now = Date.now()) =>
        set((state) => {
          let changed = false;
          const notifications: Notification[] = [];
          const updated: Booking[] = state.bookings.map((item): Booking => {
            if (
              item.active &&
              item.bookedAt &&
              item.reservedUntil &&
              item.reservedUntil < now &&
              item.readingStatus === "WILL_READ"
            ) {
              changed = true;
              const restoreWish = item.wasWishBeforeReserve;
              notifications.push(
                createNotification(
                  i18n.t("bookingNotifications.reservationExpired", {
                    title: item.bookSnapshot.title,
                  }),
                ),
              );
              return {
                ...item,
                active: restoreWish ? true : false,
                readingStatus: "WILL_READ" as ReadingStatus,
                bookedAt: undefined,
                reservedUntil: undefined,
                cancelledAt: now,
              };
            }
            return item;
          });
          if (!changed) return state;
          return {
            bookings: updated,
            notifications: [...state.notifications, ...notifications],
          };
        }),
      checkReadingReminders: (now = Date.now()) =>
        set((state) => {
          let changed = false;
          const notifications: Notification[] = [];
          const updated: Booking[] = state.bookings.map((item): Booking => {
            if (
              item.active &&
              item.readingStatus === "READING" &&
              item.borrowedAt
            ) {
              const days = daysBetween(item.borrowedAt, now);
              const reminders = { ...item.reminders };
              if (days >= 14 && !reminders.twoWeeks) {
                reminders.twoWeeks = true;
                notifications.push(
                  createNotification(
                    i18n.t("bookingNotifications.reminderTwoWeeks", {
                      title: item.bookSnapshot.title,
                    }),
                  ),
                );
                changed = true;
              }
              if (days >= 28 && !reminders.fourWeeks) {
                reminders.fourWeeks = true;
                notifications.push(
                  createNotification(
                    i18n.t("bookingNotifications.reminderFourWeeks", {
                      title: item.bookSnapshot.title,
                    }),
                  ),
                );
                changed = true;
              }
              if (changed) {
                return { ...item, reminders };
              }
            }
            return item;
          });
          if (!changed) return state;
          return {
            bookings: updated,
            notifications: [...state.notifications, ...notifications],
          };
        }),
      clearNotifications: () => set(() => ({ notifications: [] })),
    }),
    {
      name: "bookings",
      version: 1,
    },
  ),
);

export type { Booking, ReadingStatus };
