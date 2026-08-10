import {
  assignments as initialAssignments,
  babies,
  customers,
  packages,
  therapistSchedules,
  therapists,
  treatments,
} from "@/modules/baby-spa/mock-data";
import type {
  Baby,
  Booking,
  BookingAssignment,
  BookingDraft,
  BookingStatus,
  Customer,
  NotificationResult,
  Therapist,
  TherapistAvailability,
  Treatment,
  TreatmentPackage,
} from "@/modules/baby-spa/types";

export const statusLabels: Record<BookingStatus, string> = {
  PENDING: "Menunggu Konfirmasi",
  CONFIRMED: "Dikonfirmasi",
  IN_PROGRESS: "Sedang Berlangsung",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
  NO_SHOW: "Tidak Hadir",
};

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value).replace(/\s/g, "");
}

export function formatDate(value: string, options?: Intl.DateTimeFormatOptions) {
  if (!value) {
    return "-";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...options,
  }).format(date);
}

export function formatTime(value: string) {
  return value.replace(":", ".");
}

export function addMinutes(time: string, minutes: number) {
  const [hour = "0", minute = "0"] = time.split(":");
  const total = Number(hour) * 60 + Number(minute) + minutes;
  const nextHour = Math.floor(total / 60).toString().padStart(2, "0");
  const nextMinute = (total % 60).toString().padStart(2, "0");
  return `${nextHour}:${nextMinute}`;
}

function toMinutes(time: string) {
  const [hour = "0", minute = "0"] = time.split(":");
  return Number(hour) * 60 + Number(minute);
}

export function overlaps(firstStart: string, firstEnd: string, secondStart: string, secondEnd: string) {
  return toMinutes(firstStart) < toMinutes(secondEnd) && toMinutes(firstEnd) > toMinutes(secondStart);
}

export function getTreatment(id: string): Treatment | undefined {
  return treatments.find((treatment) => treatment.id === id);
}

export function getPackage(id: string): TreatmentPackage | undefined {
  return packages.find((item) => item.id === id);
}

export function getCustomer(id: string): Customer | undefined {
  return customers.find((customer) => customer.id === id);
}

export function getBaby(id: string): Baby | undefined {
  return babies.find((baby) => baby.id === id);
}

export function getTherapist(id: string): Therapist | undefined {
  return therapists.find((therapist) => therapist.id === id);
}

export function getPackageTreatments(item: TreatmentPackage) {
  return [...item.items]
    .sort((left, right) => left.sequence - right.sequence)
    .map((packageItem) => ({
      packageItem,
      treatment: getTreatment(packageItem.treatmentId),
    }))
    .filter((entry): entry is { packageItem: typeof item.items[number]; treatment: Treatment } => Boolean(entry.treatment));
}

export function getPackageDuration(item: TreatmentPackage) {
  return getPackageTreatments(item).reduce(
    (total, entry) => total + entry.treatment.durationMinutes * entry.packageItem.quantity,
    0,
  );
}

export function getPackageOriginalValue(item: TreatmentPackage) {
  return getPackageTreatments(item).reduce(
    (total, entry) => total + entry.treatment.price * entry.packageItem.quantity,
    0,
  );
}

export function getBookingService(booking: Booking) {
  if (booking.bookingType === "PACKAGE" && booking.packageId) {
    return getPackage(booking.packageId);
  }

  if (booking.bookingType === "TREATMENT" && booking.treatmentId) {
    return getTreatment(booking.treatmentId);
  }

  return undefined;
}

export function getBookingServiceName(booking: Booking) {
  return getBookingService(booking)?.name ?? "Layanan tidak ditemukan";
}

export function getActiveAssignment(bookingId: string, assignmentList: BookingAssignment[]) {
  return assignmentList.find(
    (assignment) => assignment.bookingId === bookingId && assignment.status === "ASSIGNED",
  );
}

export function getTherapistNameForBooking(bookingId: string, assignmentList: BookingAssignment[]) {
  const assignment = getActiveAssignment(bookingId, assignmentList);
  return assignment ? getTherapist(assignment.therapistId)?.name ?? "-" : "-";
}

export function isCompletedOrActiveAssignment(assignment: BookingAssignment) {
  return assignment.status === "ASSIGNED" || assignment.status === "COMPLETED";
}

export function getAvailableTherapists({
  booking,
  bookings,
  assignmentList,
}: {
  booking: Booking;
  bookings: Booking[];
  assignmentList: BookingAssignment[];
}): TherapistAvailability[] {
  return therapists.map((therapist) => {
    const schedule = therapistSchedules.find(
      (item) => item.therapistId === therapist.id && item.active,
    );

    if (!therapist.active) {
      return {
        therapist,
        available: false,
        workingWindow: "Tidak aktif",
        reason: "Terapis sedang tidak aktif",
      };
    }

    const workingWindow = schedule ? `${formatTime(schedule.startTime)} - ${formatTime(schedule.endTime)}` : "Simulasi shift";
    const conflictAssignment = assignmentList.find((assignment) => {
      if (assignment.therapistId !== therapist.id || !isCompletedOrActiveAssignment(assignment)) {
        return false;
      }

      const existingBooking = bookings.find((item) => item.id === assignment.bookingId);
      if (!existingBooking || existingBooking.id === booking.id || existingBooking.bookingDate !== booking.bookingDate) {
        return false;
      }

      if (existingBooking.status === "CANCELLED" || existingBooking.status === "NO_SHOW") {
        return false;
      }

      return overlaps(booking.startTime, booking.endTime, existingBooking.startTime, existingBooking.endTime);
    });

    if (conflictAssignment) {
      const conflictBooking = bookings.find((item) => item.id === conflictAssignment.bookingId);
      return {
        therapist,
        available: false,
        workingWindow,
        reason: "Bentrok dengan booking lain",
        conflictBookingNumber: conflictBooking?.bookingNumber,
        conflictWindow: conflictBooking ? `${formatTime(conflictBooking.startTime)} - ${formatTime(conflictBooking.endTime)}` : undefined,
      };
    }

    return {
      therapist,
      available: true,
      workingWindow,
    };
  });
}

export function sendTherapistAssignmentNotification(booking: Booking, therapist: Therapist): NotificationResult {
  return {
    success: true,
    channel: "whatsapp",
    message: `Notifikasi WhatsApp untuk ${therapist.name} terkirim: ${booking.bookingNumber}`,
  };
}

export function buildBookingFromDraft(draft: BookingDraft, sequence: number): Booking {
  const service =
    draft.serviceType === "PACKAGE" ? getPackage(draft.serviceId) : getTreatment(draft.serviceId);
  const duration =
    draft.serviceType === "PACKAGE" && service && "items" in service
      ? getPackageDuration(service)
      : service && "durationMinutes" in service
        ? service.durationMinutes
        : 45;

  const bookingDateToken = draft.bookingDate.replaceAll("-", "");
  const bookingNumber = `BS-${bookingDateToken}-${String(sequence).padStart(3, "0")}`;
  const now = new Date().toISOString();

  return {
    id: `booking-session-${sequence}`,
    bookingNumber,
    customerId: `customer-session-${sequence}`,
    babyId: `baby-session-${sequence}`,
    bookingType: draft.serviceType,
    treatmentId: draft.serviceType === "TREATMENT" ? draft.serviceId : undefined,
    packageId: draft.serviceType === "PACKAGE" ? draft.serviceId : undefined,
    bookingDate: draft.bookingDate,
    startTime: draft.startTime,
    endTime: addMinutes(draft.startTime, duration),
    durationMinutes: duration,
    status: "PENDING",
    customerNotes: draft.customerNotes,
    adminNotes: "",
    createdAt: now,
    updatedAt: now,
  };
}

export function buildCustomerFromDraft(draft: BookingDraft, sequence: number): Customer {
  const now = new Date().toISOString();

  return {
    id: `customer-session-${sequence}`,
    name: draft.customerName,
    phone: draft.customerPhone,
    email: draft.customerEmail,
    createdAt: now,
  };
}

export function buildBabyFromDraft(draft: BookingDraft, sequence: number): Baby {
  const now = new Date().toISOString();

  return {
    id: `baby-session-${sequence}`,
    customerId: `customer-session-${sequence}`,
    name: draft.babyName,
    birthDate: draft.babyBirthDate,
    gender: "FEMALE",
    notes: draft.babyNotes,
    createdAt: now,
    updatedAt: now,
  };
}

export function createAssignment(bookingId: string, therapistId: string): BookingAssignment {
  const now = new Date().toISOString();

  return {
    id: `assignment-${bookingId}-${therapistId}-${Date.now()}`,
    bookingId,
    therapistId,
    status: "ASSIGNED",
    assignedBy: "admin-demo",
    assignedAt: now,
    notes: "Assignment dibuat dari prototype admin.",
    createdAt: now,
    updatedAt: now,
  };
}

export function seedAssignments() {
  return [...initialAssignments];
}
