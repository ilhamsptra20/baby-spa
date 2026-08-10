export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export type BookingType = "TREATMENT" | "PACKAGE";
export type AssignmentStatus = "ASSIGNED" | "CANCELLED" | "REASSIGNED" | "COMPLETED";
export type BabyGender = "FEMALE" | "MALE";
export type NotificationChannel = "whatsapp";

export interface Treatment {
  id: string;
  slug: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  image: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PackageItem {
  id: string;
  packageId: string;
  treatmentId: string;
  sequence: number;
  quantity: number;
}

export interface TreatmentPackage {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  image: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  items: PackageItem[];
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  createdAt: string;
}

export interface Baby {
  id: string;
  customerId: string;
  name: string;
  birthDate: string;
  gender: BabyGender;
  notes: string;
  medicalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Therapist {
  id: string;
  name: string;
  phone: string;
  photo: string;
  active: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface TherapistSchedule {
  id: string;
  therapistId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  active: boolean;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  customerId: string;
  babyId: string;
  bookingType: BookingType;
  treatmentId?: string;
  packageId?: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  status: BookingStatus;
  customerNotes: string;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingAssignment {
  id: string;
  bookingId: string;
  therapistId: string;
  status: AssignmentStatus;
  assignedBy: string;
  assignedAt: string;
  cancelledAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResult {
  success: boolean;
  channel: NotificationChannel;
  message: string;
}

export interface BookingDraft {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceType: BookingType;
  serviceId: string;
  babyName: string;
  babyBirthDate: string;
  babyNotes: string;
  bookingDate: string;
  startTime: string;
  customerNotes: string;
}

export interface TherapistAvailability {
  therapist: Therapist;
  available: boolean;
  workingWindow: string;
  reason?: string;
  conflictBookingNumber?: string;
  conflictWindow?: string;
}
