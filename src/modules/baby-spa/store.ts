"use client";

import { create } from "zustand";

import { assignments as initialAssignments, babies as initialBabies, bookings as initialBookings, customers as initialCustomers } from "@/modules/baby-spa/mock-data";
import type { Baby, Booking, BookingAssignment, BookingDraft, BookingStatus, Customer, NotificationResult } from "@/modules/baby-spa/types";
import { buildBabyFromDraft, buildBookingFromDraft, buildCustomerFromDraft, createAssignment, getTherapist, sendTherapistAssignmentNotification } from "@/modules/baby-spa/utils";

interface BabySpaState {
  customers: Customer[];
  babies: Baby[];
  bookings: Booking[];
  assignments: BookingAssignment[];
  lastBookingId?: string;
  lastNotification?: NotificationResult;
  createBooking: (draft: BookingDraft) => Booking;
  assignTherapist: (bookingId: string, therapistId: string) => NotificationResult | undefined;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => void;
}

export const useBabySpaStore = create<BabySpaState>((set, get) => ({
  customers: initialCustomers,
  babies: initialBabies,
  bookings: initialBookings,
  assignments: initialAssignments,
  lastBookingId: undefined,
  lastNotification: undefined,
  createBooking: (draft) => {
    const sequence = get().bookings.length + 1;
    const customer = buildCustomerFromDraft(draft, sequence);
    const baby = buildBabyFromDraft(draft, sequence);
    const booking = buildBookingFromDraft(draft, sequence);
    set((state) => ({
      customers: [customer, ...state.customers],
      babies: [baby, ...state.babies],
      bookings: [booking, ...state.bookings],
      lastBookingId: booking.id,
    }));
    return booking;
  },
  assignTherapist: (bookingId, therapistId) => {
    const booking = get().bookings.find((item) => item.id === bookingId);
    const therapist = getTherapist(therapistId);

    if (!booking || !therapist) {
      return undefined;
    }

    const assignment = createAssignment(bookingId, therapistId);
    const notification = sendTherapistAssignmentNotification(booking, therapist);
    const now = new Date().toISOString();

    set((state) => ({
      bookings: state.bookings.map((item) =>
        item.id === bookingId
          ? { ...item, status: "CONFIRMED", updatedAt: now }
          : item,
      ),
      assignments: [
        assignment,
        ...state.assignments.map((item) =>
          item.bookingId === bookingId && item.status === "ASSIGNED"
            ? { ...item, status: "REASSIGNED" as const, cancelledAt: now, updatedAt: now }
            : item,
        ),
      ],
      lastNotification: notification,
    }));

    return notification;
  },
  updateBookingStatus: (bookingId, status) => {
    const now = new Date().toISOString();
    set((state) => ({
      bookings: state.bookings.map((item) =>
        item.id === bookingId ? { ...item, status, updatedAt: now } : item,
      ),
      assignments: state.assignments.map((item) =>
        item.bookingId === bookingId && item.status === "ASSIGNED" && status === "COMPLETED"
          ? { ...item, status: "COMPLETED", updatedAt: now }
          : item,
      ),
    }));
  },
}));
