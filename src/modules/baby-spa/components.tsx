"use client";

import {
  ArrowRightIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  HomeIcon,
  ListBulletIcon,
  SparklesIcon,
  UserGroupIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { packages, therapists, treatments } from "@/modules/baby-spa/mock-data";
import { useBabySpaStore } from "@/modules/baby-spa/store";
import type { Booking, BookingDraft, BookingStatus, BookingType, TherapistAvailability, Treatment, TreatmentPackage } from "@/modules/baby-spa/types";
import {
  formatCurrency,
  formatDate,
  formatTime,
  getActiveAssignment,
  getAvailableTherapists,
  getBaby,
  getBookingServiceName,
  getCustomer,
  getPackage,
  getPackageDuration,
  getPackageOriginalValue,
  getPackageTreatments,
  getTherapist,
  getTherapistNameForBooking,
  getTreatment,
  statusLabels,
} from "@/modules/baby-spa/utils";
import { Button, Card } from "@/ui/components/common";
import { DataTable, type DataTableColumn } from "@/ui/components/data-display";
import { Alert, EmptyState } from "@/ui/components/feedback";
import { Input, Select, Textarea } from "@/ui/components/form";
import { Modal } from "@/ui/components/overlay";
import { PageTitle } from "@/ui/components/typography";
import { cn } from "@/ui/utils/cn";

const publicNav = [
  { label: "Treatments", href: "/treatments" },
  { label: "Packages", href: "/packages" },
  { label: "Booking", href: "/booking" },
  { label: "Riwayat", href: "/bookings" },
  { label: "Admin", href: "/admin/dashboard" },
  { label: "Therapist", href: "/therapist/dashboard" },
];

const adminNav = [
  { label: "Dashboard", href: "/admin/dashboard", icon: HomeIcon },
  { label: "Bookings", href: "/admin/bookings", icon: ListBulletIcon },
  { label: "Calendar", href: "/admin/calendar", icon: CalendarDaysIcon },
  { label: "Customers", href: "/admin/customers", icon: UserGroupIcon },
  { label: "Therapists", href: "/admin/therapists", icon: UserIcon },
  { label: "Treatments", href: "/admin/treatments", icon: SparklesIcon },
  { label: "Packages", href: "/admin/packages", icon: CheckCircleIcon },
];

const therapistNav = [
  { label: "Dashboard", href: "/therapist/dashboard" },
  { label: "Schedule", href: "/therapist/schedule" },
  { label: "History", href: "/therapist/history" },
];

const bookingSteps = ["Layanan", "Kontak", "Anak", "Tanggal & Waktu", "Catatan", "Konfirmasi"];
const demoDate = "2026-08-12";
const demoTime = "10:00";
const timeSlots = ["09:00", "10:00", "11:00", "13:30", "15:00"];

function StatusBadge({ status }: { status: BookingStatus }) {
  const tone: Record<BookingStatus, string> = {
    PENDING: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30",
    CONFIRMED: "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-sky-500/30",
    IN_PROGRESS: "bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:ring-indigo-500/30",
    COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30",
    CANCELLED: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-500/30",
    NO_SHOW: "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700",
  };

  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1", tone[status])}>
      {statusLabels[status]}
    </span>
  );
}

function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f8faf6] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-teal-700 text-sm font-bold text-white">BS</span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">Baby Spa</span>
              <span className="block truncate text-xs text-slate-500 dark:text-slate-400">Calm care booking</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {publicNav.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900">
                {item.label}
              </Link>
            ))}
          </nav>
          <Link href="/booking" className="inline-flex h-10 items-center justify-center rounded-md bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800">
            Book Now
          </Link>
        </div>
        <div className="flex gap-2 overflow-x-auto px-4 pb-3 lg:hidden">
          {publicNav.map((item) => (
            <Link key={item.href} href={item.href} className="shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 dark:bg-slate-900 dark:text-slate-200">
              {item.label}
            </Link>
          ))}
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 text-sm text-slate-500 sm:px-6 md:grid-cols-3 lg:px-8">
          <p>Baby Spa Management System prototype untuk validasi workflow booking, admin, dan therapist.</p>
          <p>WhatsApp, autentikasi, pembayaran, dan backend masih disimulasikan.</p>
          <p className="md:text-right">Demo utama: Nadia, Aisyah, Happy Baby Package, 12 Agustus 2026 jam 10.00.</p>
        </div>
      </footer>
    </div>
  );
}

function AdminShell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white lg:block dark:border-slate-800 dark:bg-slate-950">
        <div className="border-b border-slate-200 px-5 py-5 dark:border-slate-800">
          <p className="text-base font-semibold">Baby Spa Admin</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Operational controller</p>
        </div>
        <nav className="space-y-1 p-3">
          {adminNav.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900">
                <Icon className="h-5 w-5 text-slate-400" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 lg:px-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-lg font-semibold">{title}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
            </div>
            <div className="flex gap-2 overflow-x-auto lg:hidden">
              {adminNav.map((item) => (
                <Link key={item.href} href={item.href} className="shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </header>
        <main className="p-4 lg:p-6">
          <div className="mx-auto max-w-7xl space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

function TherapistShell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/95 px-4 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold">{title}</h1>
            <p className="text-sm text-slate-400">{description}</p>
          </div>
          <nav className="flex gap-2 overflow-x-auto">
            {therapistNav.map((item) => (
              <Link key={item.href} href={item.href} className="shrink-0 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-100 transition hover:bg-white/15">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}

function ServiceImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div
      aria-label={alt}
      role="img"
      className="aspect-[4/3] overflow-hidden rounded-lg bg-slate-100 bg-cover bg-center dark:bg-slate-800"
      style={{ backgroundImage: `url(${src})` }}
    >
      <span className="sr-only">{alt}</span>
    </div>
  );
}

function NotFoundPanel({ title = "Data tidak ditemukan" }: { title?: string }) {
  return (
    <PublicShell>
      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <EmptyState title={title} description="Periksa kembali link atau pilih data lain dari daftar." />
      </section>
    </PublicShell>
  );
}

function ServiceCard({ service, type }: { service: Treatment | TreatmentPackage; type: BookingType }) {
  const duration = type === "PACKAGE" ? getPackageDuration(service as TreatmentPackage) : (service as Treatment).durationMinutes;
  const detailHref = type === "PACKAGE" ? `/packages/${service.slug}` : `/treatments/${service.slug}`;

  return (
    <Card className="h-full overflow-hidden" contentClassName="space-y-4">
      <ServiceImage src={service.image} alt={service.name} />
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{service.name}</h3>
          <span className="shrink-0 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 dark:bg-teal-500/15 dark:text-teal-300">{duration} menit</span>
        </div>
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{service.description}</p>
      </div>
      {"items" in service ? (
        <ol className="space-y-1 text-sm text-slate-500 dark:text-slate-400">
          {getPackageTreatments(service).map((entry) => (
            <li key={entry.packageItem.id}>{entry.packageItem.sequence}. {entry.treatment.name}</li>
          ))}
        </ol>
      ) : null}
      <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
        <p className="text-lg font-semibold">{formatCurrency(service.price)}</p>
        <div className="flex gap-2">
          <Link href={detailHref} className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
            Detail
          </Link>
          <Link href={`/booking?type=${type}&service=${service.id}`} className="inline-flex h-10 items-center justify-center rounded-md bg-teal-700 px-3 text-sm font-semibold text-white transition hover:bg-teal-800">
            Book
          </Link>
        </div>
      </div>
    </Card>
  );
}

function BookingSummary({ booking }: { booking: Booking }) {
  const sessionCustomers = useBabySpaStore((state) => state.customers);
  const sessionBabies = useBabySpaStore((state) => state.babies);
  const baby = sessionBabies.find((item) => item.id === booking.babyId) ?? getBaby(booking.babyId);
  const customer = sessionCustomers.find((item) => item.id === booking.customerId) ?? getCustomer(booking.customerId);
  const assignments = useBabySpaStore((state) => state.assignments);

  return (
    <Card title={booking.bookingNumber} headerAction={<StatusBadge status={booking.status} />}>
      <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-slate-500 dark:text-slate-400">Baby</dt>
          <dd className="mt-1 font-medium">{baby?.name ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-slate-500 dark:text-slate-400">Customer</dt>
          <dd className="mt-1 font-medium">{customer?.name ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-slate-500 dark:text-slate-400">Layanan</dt>
          <dd className="mt-1 font-medium">{getBookingServiceName(booking)}</dd>
        </div>
        <div>
          <dt className="text-slate-500 dark:text-slate-400">Jadwal</dt>
          <dd className="mt-1 font-medium">{formatDate(booking.bookingDate)} - {formatTime(booking.startTime)}</dd>
        </div>
        <div>
          <dt className="text-slate-500 dark:text-slate-400">Terapis</dt>
          <dd className="mt-1 font-medium">{getTherapistNameForBooking(booking.id, assignments)}</dd>
        </div>
        <div>
          <dt className="text-slate-500 dark:text-slate-400">Durasi</dt>
          <dd className="mt-1 font-medium">{booking.durationMinutes} menit</dd>
        </div>
      </dl>
    </Card>
  );
}

function BookingTimeline({ booking }: { booking: Booking }) {
  const activeIndex = booking.status === "COMPLETED" ? 4 : booking.status === "CONFIRMED" || booking.status === "IN_PROGRESS" ? 3 : 1;
  const items = ["Booking Dibuat", "Menunggu Konfirmasi", "Jadwal Dikonfirmasi", "Terapis Ditentukan", "Treatment Selesai"];

  return (
    <Card title="Timeline">
      <ol className="space-y-3">
        {items.map((item, index) => (
          <li key={item} className="flex items-center gap-3">
            <span className={cn("inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold", index <= activeIndex ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-400 dark:bg-slate-800")}>
              {index + 1}
            </span>
            <span className={cn("text-sm font-medium", index <= activeIndex ? "text-slate-900 dark:text-slate-100" : "text-slate-400")}>{item}</span>
          </li>
        ))}
      </ol>
    </Card>
  );
}

function bookingDateSortValue(booking: Booking) {
  return `${booking.bookingDate} ${booking.startTime}`;
}

export function HomePage() {
  return (
    <PublicShell>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-14">
        <div className="flex flex-col justify-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">Premium baby care</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">Baby Spa Management System</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
            Prototype booking baby spa yang menghubungkan customer, admin, dan therapist dalam satu workflow demonstrasi.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/packages/happy-baby-package" className="inline-flex h-11 items-center justify-center rounded-md bg-teal-700 px-5 text-sm font-semibold text-white transition hover:bg-teal-800">
              Lihat Happy Baby Package <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link href="/admin/bookings/booking-demo" className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 px-5 text-sm font-semibold text-slate-700 transition hover:bg-white dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">
              Demo Admin Assignment
            </Link>
          </div>
        </div>
        <div className="min-h-[360px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div
            role="img"
            aria-label="Baby spa care"
            className="h-full w-full bg-cover bg-center"
            style={{ backgroundImage: "url(https://images.unsplash.com/photo-1543342384-1f1350e27861?auto=format&fit=crop&w=1400&q=80)" }}
          />
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PageTitle title="Featured Packages" description="Paket dipisahkan dari treatment agar workflow booking dan assignment tetap jelas." />
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {packages.map((item) => <ServiceCard key={item.id} service={item} type="PACKAGE" />)}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PageTitle title="Featured Treatments" description="Treatment individual yang bisa dipesan langsung oleh customer." />
        <div className="mt-5 grid gap-5 md:grid-cols-3 xl:grid-cols-5">
          {treatments.map((item) => <ServiceCard key={item.id} service={item} type="TREATMENT" />)}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {["Customer booking tanpa pilih terapis", "Admin cek availability dan assign", "Therapist melihat jadwal sendiri"].map((item) => (
            <Card key={item}><p className="text-base font-semibold">{item}</p><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Alur sesuai PRD untuk validasi MVP.</p></Card>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}

export function TreatmentListPage() {
  return (
    <PublicShell>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PageTitle title="Treatments" description="Pilih treatment individual untuk bayi." />
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {treatments.map((item) => <ServiceCard key={item.id} service={item} type="TREATMENT" />)}
        </div>
      </section>
    </PublicShell>
  );
}

export function TreatmentDetailPage({ slug }: { slug: string }) {
  const treatment = treatments.find((item) => item.slug === slug);
  if (!treatment) return <NotFoundPanel title="Treatment tidak ditemukan" />;

  return (
    <PublicShell>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <ServiceImage src={treatment.image} alt={treatment.name} />
        <div className="space-y-5">
          <PageTitle title={treatment.name} description={treatment.description} />
          <div className="grid gap-3 sm:grid-cols-3">
            <Card><p className="text-sm text-slate-500">Durasi</p><p className="mt-1 text-lg font-semibold">{treatment.durationMinutes} menit</p></Card>
            <Card><p className="text-sm text-slate-500">Harga</p><p className="mt-1 text-lg font-semibold">{formatCurrency(treatment.price)}</p></Card>
            <Card><p className="text-sm text-slate-500">Status</p><p className="mt-1 text-lg font-semibold">Aktif</p></Card>
          </div>
          <Link href={`/booking?type=TREATMENT&service=${treatment.id}`} className="inline-flex h-11 items-center justify-center rounded-md bg-teal-700 px-5 text-sm font-semibold text-white transition hover:bg-teal-800">
            Book Treatment
          </Link>
        </div>
      </section>
    </PublicShell>
  );
}

export function PackageListPage() {
  return (
    <PublicShell>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PageTitle title="Packages" description="Paket single visit dengan urutan treatment yang jelas." />
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {packages.map((item) => <ServiceCard key={item.id} service={item} type="PACKAGE" />)}
        </div>
      </section>
    </PublicShell>
  );
}

export function PackageDetailPage({ slug }: { slug: string }) {
  const item = packages.find((pkg) => pkg.slug === slug);
  if (!item) return <NotFoundPanel title="Package tidak ditemukan" />;

  return (
    <PublicShell>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <ServiceImage src={item.image} alt={item.name} />
        <div className="space-y-5">
          <PageTitle title={item.name} description={item.description} />
          <Card title="Urutan Treatment">
            <ol className="space-y-3">
              {getPackageTreatments(item).map((entry) => (
                <li key={entry.packageItem.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800">
                  <span className="text-sm font-medium">{entry.packageItem.sequence}. {entry.treatment.name}</span>
                  <span className="text-sm text-slate-500">{entry.treatment.durationMinutes} menit</span>
                </li>
              ))}
            </ol>
          </Card>
          <div className="grid gap-3 sm:grid-cols-3">
            <Card><p className="text-sm text-slate-500">Total Durasi</p><p className="mt-1 text-lg font-semibold">{getPackageDuration(item)} menit</p></Card>
            <Card><p className="text-sm text-slate-500">Nilai Normal</p><p className="mt-1 text-lg font-semibold">{formatCurrency(getPackageOriginalValue(item))}</p></Card>
            <Card><p className="text-sm text-slate-500">Harga Paket</p><p className="mt-1 text-lg font-semibold">{formatCurrency(item.price)}</p></Card>
          </div>
          <Link href={`/booking?type=PACKAGE&service=${item.id}`} className="inline-flex h-11 items-center justify-center rounded-md bg-teal-700 px-5 text-sm font-semibold text-white transition hover:bg-teal-800">
            Book Package
          </Link>
        </div>
      </section>
    </PublicShell>
  );
}

export function BookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const createBooking = useBabySpaStore((state) => state.createBooking);
  const requestedType = searchParams.get("type") === "TREATMENT" ? "TREATMENT" : "PACKAGE";
  const requestedService = searchParams.get("service");
  const fallbackServiceId = requestedType === "PACKAGE" ? "package-happy-baby" : treatments[0]!.id;
  const initialServiceId =
    requestedType === "PACKAGE"
      ? packages.some((item) => item.id === requestedService)
        ? requestedService!
        : fallbackServiceId
      : treatments.some((item) => item.id === requestedService)
        ? requestedService!
        : fallbackServiceId;
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<BookingDraft>({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    serviceType: requestedType,
    serviceId: initialServiceId,
    babyName: "",
    babyBirthDate: "",
    babyNotes: "",
    bookingDate: demoDate,
    startTime: demoTime,
    customerNotes: "",
  });
  const [error, setError] = useState("");
  const selectedService = draft.serviceType === "PACKAGE" ? getPackage(draft.serviceId) : getTreatment(draft.serviceId);

  function goNext() {
    setError("");
    if (!draft.serviceId || !draft.customerName.trim() || !draft.customerPhone.trim() || !draft.babyName.trim() || !draft.babyBirthDate || !draft.bookingDate || !draft.startTime) {
      setError("Lengkapi data booking sebelum lanjut.");
      return;
    }
    setStep((current) => Math.min(current + 1, bookingSteps.length - 1));
  }

  function submitBooking() {
    const booking = createBooking(draft);
    router.push(`/booking/success?id=${booking.id}`);
  }

  return (
    <PublicShell>
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <PageTitle title="Buat Booking" description="Customer memilih layanan, baby, tanggal, waktu, dan catatan. Terapis ditentukan admin." />
        <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_320px]">
          <Card>
            <div className="mb-6 grid gap-2 sm:grid-cols-5">
              {bookingSteps.map((label, index) => (
                <button key={label} type="button" onClick={() => setStep(index)} className={cn("h-10 rounded-md text-xs font-semibold", index === step ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300")}>
                  {index + 1}. {label}
                </button>
              ))}
            </div>
            {step === 0 ? (
              <div className="space-y-4">
                <Select
                  label="Tipe Layanan"
                  value={draft.serviceType}
                  options={[{ label: "Package", value: "PACKAGE" }, { label: "Treatment", value: "TREATMENT" }]}
                  onChange={(value) => setDraft((current) => ({
                    ...current,
                    serviceType: value as BookingType,
                    serviceId: value === "PACKAGE" ? packages[0]!.id : treatments[0]!.id,
                  }))}
                />
                <Select
                  label="Layanan"
                  searchable
                  value={draft.serviceId}
                  options={(draft.serviceType === "PACKAGE" ? packages : treatments).map((item) => ({ label: item.name, value: item.id }))}
                  onChange={(value) => setDraft((current) => ({ ...current, serviceId: value }))}
                />
              </div>
            ) : null}
            {step === 1 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Nama Customer"
                  value={draft.customerName}
                  placeholder="Nadia Pratama"
                  onChange={(event) => setDraft((current) => ({ ...current, customerName: event.target.value }))}
                />
                <Input
                  label="Nomor WhatsApp"
                  value={draft.customerPhone}
                  placeholder="+628121110001"
                  onChange={(event) => setDraft((current) => ({ ...current, customerPhone: event.target.value }))}
                />
                <Input
                  containerClassName="sm:col-span-2"
                  label="Email"
                  type="email"
                  value={draft.customerEmail}
                  placeholder="nadia@example.com"
                  onChange={(event) => setDraft((current) => ({ ...current, customerEmail: event.target.value }))}
                />
              </div>
            ) : null}
            {step === 2 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Nama Anak"
                  value={draft.babyName}
                  placeholder="Aisyah"
                  onChange={(event) => setDraft((current) => ({ ...current, babyName: event.target.value }))}
                />
                <Input
                  label="Tanggal Lahir"
                  type="date"
                  value={draft.babyBirthDate}
                  onChange={(event) => setDraft((current) => ({ ...current, babyBirthDate: event.target.value }))}
                />
                <Textarea
                  containerClassName="sm:col-span-2"
                  label="Catatan Anak"
                  value={draft.babyNotes}
                  placeholder="Contoh: sensitif dengan air terlalu dingin."
                  onChange={(event) => setDraft((current) => ({ ...current, babyNotes: event.target.value }))}
                />
              </div>
            ) : null}
            {step === 3 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Tanggal" type="date" value={draft.bookingDate} onChange={(event) => setDraft((current) => ({ ...current, bookingDate: event.target.value }))} />
                <Select label="Jam" value={draft.startTime} options={timeSlots.map((slot) => ({ label: formatTime(slot), value: slot }))} onChange={(value) => setDraft((current) => ({ ...current, startTime: value }))} />
              </div>
            ) : null}
            {step === 4 ? (
              <Textarea label="Catatan untuk staff" value={draft.customerNotes} placeholder="Contoh: Aisyah agak sensitif dengan air terlalu dingin." onChange={(event) => setDraft((current) => ({ ...current, customerNotes: event.target.value }))} />
            ) : null}
            {step === 5 ? (
              <div className="space-y-4">
                <Alert tone="info" title="Review booking" description="Booking akan dibuat sebagai Menunggu Konfirmasi. Admin akan mengkonfirmasi jadwal dan menentukan terapis." />
                <BookingReview draft={draft} />
              </div>
            ) : null}
            {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => setStep((current) => Math.max(current - 1, 0))} disabled={step === 0}>Kembali</Button>
              {step < bookingSteps.length - 1 ? <Button color="emerald" onClick={goNext}>Lanjut</Button> : <Button color="emerald" onClick={submitBooking}>Submit Booking</Button>}
            </div>
          </Card>
          <Card title="Ringkasan">
            <div className="space-y-3 text-sm">
              <p><span className="text-slate-500">Customer:</span> {draft.customerName || "-"}</p>
              <p><span className="text-slate-500">WhatsApp:</span> {draft.customerPhone || "-"}</p>
              <p><span className="text-slate-500">Anak:</span> {draft.babyName || "-"}</p>
              <p><span className="text-slate-500">Layanan:</span> {selectedService?.name ?? "-"}</p>
              <p><span className="text-slate-500">Jadwal:</span> {formatDate(draft.bookingDate)} - {formatTime(draft.startTime)}</p>
              <p className="text-xs text-slate-500">Tidak ada pilihan terapis di customer flow.</p>
            </div>
          </Card>
        </div>
      </section>
    </PublicShell>
  );
}

function BookingReview({ draft }: { draft: BookingDraft }) {
  const service = draft.serviceType === "PACKAGE" ? getPackage(draft.serviceId) : getTreatment(draft.serviceId);
  return (
    <dl className="grid gap-4 text-sm sm:grid-cols-2">
      <div><dt className="text-slate-500">Customer</dt><dd className="mt-1 font-medium">{draft.customerName}</dd></div>
      <div><dt className="text-slate-500">WhatsApp</dt><dd className="mt-1 font-medium">{draft.customerPhone}</dd></div>
      <div><dt className="text-slate-500">Layanan</dt><dd className="mt-1 font-medium">{service?.name}</dd></div>
      <div><dt className="text-slate-500">Anak</dt><dd className="mt-1 font-medium">{draft.babyName}</dd></div>
      <div><dt className="text-slate-500">Tanggal Lahir</dt><dd className="mt-1 font-medium">{formatDate(draft.babyBirthDate)}</dd></div>
      <div><dt className="text-slate-500">Tanggal</dt><dd className="mt-1 font-medium">{formatDate(draft.bookingDate)}</dd></div>
      <div><dt className="text-slate-500">Jam</dt><dd className="mt-1 font-medium">{formatTime(draft.startTime)}</dd></div>
      <div className="sm:col-span-2"><dt className="text-slate-500">Catatan</dt><dd className="mt-1 font-medium">{draft.customerNotes || draft.babyNotes || "-"}</dd></div>
    </dl>
  );
}

export function BookingSuccessPage({ bookingId }: { bookingId?: string }) {
  const lastBookingId = useBabySpaStore((state) => state.lastBookingId);
  const bookings = useBabySpaStore((state) => state.bookings);
  const booking = bookings.find((item) => item.id === (bookingId ?? lastBookingId)) ?? bookings.find((item) => item.id === "booking-demo");

  if (!booking) return <NotFoundPanel title="Booking tidak ditemukan" />;

  return (
    <PublicShell>
      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <Alert tone="success" title="Booking berhasil dibuat." description="Admin akan mengkonfirmasi jadwal dan menentukan terapis." />
        <div className="mt-6 space-y-5">
          <BookingSummary booking={booking} />
          <div className="flex gap-3">
            <Link href={`/bookings/${booking.id}`} className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-white dark:border-slate-700 dark:text-slate-200">Detail Booking</Link>
            <Link href={`/admin/bookings/${booking.id}`} className="inline-flex h-10 items-center justify-center rounded-md bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800">Lanjut Admin</Link>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

export function CustomerBookingsPage() {
  const bookings = useBabySpaStore((state) => state.bookings);
  return (
    <PublicShell>
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <PageTitle title="Riwayat Booking" description="Prototype tanpa login menampilkan booking sesi dan contoh data." />
        <div className="mt-6 space-y-4">
          {bookings.map((booking) => (
            <Link key={booking.id} href={`/bookings/${booking.id}`} className="block">
              <BookingSummary booking={booking} />
            </Link>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}

export function CustomerBookingDetailPage({ id }: { id: string }) {
  const booking = useBabySpaStore((state) => state.bookings.find((item) => item.id === id));
  if (!booking) return <NotFoundPanel title="Booking tidak ditemukan" />;

  return (
    <PublicShell>
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <PageTitle title="Detail Booking" description="Customer melihat status booking tanpa kontrol assignment." />
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <BookingSummary booking={booking} />
          <BookingTimeline booking={booking} />
        </div>
      </section>
    </PublicShell>
  );
}

export function AdminDashboardPage() {
  const bookings = useBabySpaStore((state) => state.bookings);
  const assignments = useBabySpaStore((state) => state.assignments);
  const todayBookings = bookings.filter((item) => item.bookingDate === "2026-08-12");
  const pending = bookings.filter((item) => item.status === "PENDING");
  const completed = bookings.filter((item) => item.status === "COMPLETED");

  return (
    <AdminShell title="Admin Dashboard" description="Ringkasan operasional baby spa.">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Booking Hari Ini" value={String(todayBookings.length)} icon={CalendarDaysIcon} />
        <StatCard label="Menunggu Konfirmasi" value={String(pending.length)} icon={ClockIcon} />
        <StatCard label="Treatment Selesai" value={String(completed.length)} icon={CheckCircleIcon} />
        <StatCard label="Terapis Bertugas" value={String(new Set(assignments.map((item) => item.therapistId)).size)} icon={UserGroupIcon} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Pending Booking" description="Prioritas untuk admin review.">
          <div className="space-y-3">
            {pending.slice(0, 5).map((booking) => <AdminBookingRow key={booking.id} booking={booking} />)}
          </div>
        </Card>
        <Card title="Therapist Availability Summary" description="Status untuk demo 12 Agustus 2026 10.00.">
          <div className="space-y-3">
            {getAvailableTherapists({ booking: bookings.find((item) => item.id === "booking-demo") ?? bookings[0]!, bookings, assignmentList: assignments }).map((item) => (
              <TherapistAvailabilityRow key={item.therapist.id} availability={item} compact />
            ))}
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: typeof CalendarDaysIcon }) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold">{value}</p>
        </div>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300"><Icon className="h-5 w-5" /></span>
      </div>
    </Card>
  );
}

function AdminBookingRow({ booking }: { booking: Booking }) {
  return (
    <Link href={`/admin/bookings/${booking.id}`} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{booking.bookingNumber} - {getBookingServiceName(booking)}</p>
        <p className="text-xs text-slate-500">{getBaby(booking.babyId)?.name} - {formatDate(booking.bookingDate)} {formatTime(booking.startTime)}</p>
      </div>
      <StatusBadge status={booking.status} />
    </Link>
  );
}

export function AdminBookingsPage() {
  const bookings = useBabySpaStore((state) => state.bookings);
  const sessionCustomers = useBabySpaStore((state) => state.customers);
  const sessionBabies = useBabySpaStore((state) => state.babies);
  const assignments = useBabySpaStore((state) => state.assignments);
  type Row = Booking & { babyName: string; customerName: string; serviceName: string; therapistName: string };
  const rows: Row[] = bookings.map((booking) => ({
    ...booking,
    babyName: sessionBabies.find((baby) => baby.id === booking.babyId)?.name ?? getBaby(booking.babyId)?.name ?? "-",
    customerName: sessionCustomers.find((customer) => customer.id === booking.customerId)?.name ?? getCustomer(booking.customerId)?.name ?? "-",
    serviceName: getBookingServiceName(booking),
    therapistName: getTherapistNameForBooking(booking.id, assignments),
  }));
  const columns: DataTableColumn<Row>[] = [
    { key: "bookingNumber", header: "Booking", sortable: true, render: (row) => <Link className="font-semibold text-teal-700 dark:text-teal-300" href={`/admin/bookings/${row.id}`}>{row.bookingNumber}</Link> },
    { key: "babyName", header: "Baby", sortable: true },
    { key: "customerName", header: "Customer", sortable: true },
    { key: "serviceName", header: "Layanan", sortable: true },
    { key: "bookingDate", header: "Tanggal", sortable: true, render: (row) => formatDate(row.bookingDate, { day: "2-digit", month: "short", year: "numeric" }) },
    { key: "startTime", header: "Jam", sortable: true, render: (row) => formatTime(row.startTime) },
    { key: "therapistName", header: "Terapis", sortable: true },
    { key: "status", header: "Status", sortable: true, render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <AdminShell title="Bookings" description="Filter dan kelola semua reservasi.">
      <DataTable
        data={rows}
        columns={columns}
        searchable
        searchKeys={["bookingNumber", "babyName", "customerName", "serviceName", "therapistName"]}
        filters={[{ key: "status", label: "Status", options: Object.entries(statusLabels).map(([value, label]) => ({ value, label })) }]}
        paginated
        pageSize={8}
        rowActions={(row) => <Link href={`/admin/bookings/${row.id}`} className="text-sm font-semibold text-teal-700 dark:text-teal-300">Open</Link>}
      />
    </AdminShell>
  );
}

export function AdminBookingDetailPage({ id }: { id: string }) {
  const booking = useBabySpaStore((state) => state.bookings.find((item) => item.id === id));
  const bookings = useBabySpaStore((state) => state.bookings);
  const assignments = useBabySpaStore((state) => state.assignments);
  const assignTherapist = useBabySpaStore((state) => state.assignTherapist);
  const updateBookingStatus = useBabySpaStore((state) => state.updateBookingStatus);
  const notification = useBabySpaStore((state) => state.lastNotification);
  const [open, setOpen] = useState(false);
  const [selectedTherapistId, setSelectedTherapistId] = useState("therapist-siti");
  if (!booking) {
    return (
      <AdminShell title="Booking tidak ditemukan" description="Data booking tidak tersedia di mock state.">
        <EmptyState title="Booking tidak ditemukan" description="Kembali ke daftar booking untuk memilih data lain." />
      </AdminShell>
    );
  }

  const availability = getAvailableTherapists({ booking, bookings, assignmentList: assignments });
  const activeAssignment = getActiveAssignment(booking.id, assignments);
  const bookingId = booking.id;

  function handleAssign() {
    assignTherapist(bookingId, selectedTherapistId);
    setOpen(false);
  }

  return (
    <AdminShell title={booking.bookingNumber} description="Review booking, cek availability, assign terapis, dan update status.">
      {notification ? (
        <Alert tone="success" title="Terapis berhasil ditugaskan">
          <ul className="mt-2 space-y-1 text-sm">
            <li>✓ Therapist assigned</li>
            <li>✓ Booking dikonfirmasi</li>
            <li>✓ Notifikasi WhatsApp terkirim</li>
          </ul>
        </Alert>
      ) : null}
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <BookingSummary booking={booking} />
          <Card title="Customer Notes"><p className="text-sm text-slate-600 dark:text-slate-300">{booking.customerNotes || "-"}</p></Card>
          <BookingTimeline booking={booking} />
        </div>
        <div className="space-y-4">
          <Card title="Assigned Therapist">
            <p className="text-sm font-semibold">{activeAssignment ? getTherapist(activeAssignment.therapistId)?.name : "Belum ditentukan"}</p>
            <div className="mt-4 grid gap-2">
              <Button color="emerald" onClick={() => setOpen(true)}>{activeAssignment ? "Ganti Terapis" : "Assign Terapis"}</Button>
              <Button variant="outline" onClick={() => updateBookingStatus(booking.id, "IN_PROGRESS")} disabled={booking.status !== "CONFIRMED"}>Mulai Treatment</Button>
              <Button variant="outline" onClick={() => updateBookingStatus(booking.id, "COMPLETED")} disabled={booking.status === "COMPLETED"}>Selesaikan Treatment</Button>
              <Button variant="danger" onClick={() => updateBookingStatus(booking.id, "CANCELLED")} disabled={booking.status === "COMPLETED"}>Batalkan Booking</Button>
            </div>
          </Card>
          <Card title="Availability Preview">
            <div className="space-y-3">
              {availability.map((item) => <TherapistAvailabilityRow key={item.therapist.id} availability={item} compact />)}
            </div>
          </Card>
        </div>
      </div>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Assign Terapis"
        description={`${formatDate(booking.bookingDate)} ${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}`}
        footer={<div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setOpen(false)}>Batal</Button><Button color="emerald" onClick={handleAssign}>Assign Therapist</Button></div>}
      >
        <div className="space-y-3">
          {availability.map((item) => (
            <button
              key={item.therapist.id}
              type="button"
              disabled={!item.available}
              onClick={() => setSelectedTherapistId(item.therapist.id)}
              className={cn("w-full rounded-lg border p-3 text-left transition", item.available ? "border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800" : "cursor-not-allowed border-slate-200 bg-slate-50 opacity-60 dark:border-slate-800 dark:bg-slate-900", selectedTherapistId === item.therapist.id && item.available && "border-teal-600 bg-teal-50 dark:bg-teal-500/10")}
            >
              <TherapistAvailabilityRow availability={item} />
            </button>
          ))}
        </div>
      </Modal>
    </AdminShell>
  );
}

function TherapistAvailabilityRow({ availability, compact = false }: { availability: TherapistAvailability; compact?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{availability.therapist.name}</p>
        <p className="text-xs text-slate-500">{availability.workingWindow}</p>
        {!availability.available ? <p className="mt-1 text-xs text-rose-600">{availability.reason}{availability.conflictBookingNumber ? ` ${availability.conflictBookingNumber} (${availability.conflictWindow})` : ""}</p> : null}
      </div>
      <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold", availability.available ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" : "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300")}>
        {availability.available ? "Available" : compact ? "Conflict" : "Tidak tersedia"}
      </span>
    </div>
  );
}

export function AdminCalendarPage() {
  const bookings = useBabySpaStore((state) => state.bookings);
  const sessionBabies = useBabySpaStore((state) => state.babies);
  const assignments = useBabySpaStore((state) => state.assignments);
  const dayBookings = [...bookings].filter((item) => item.bookingDate === "2026-08-12").sort((left, right) => bookingDateSortValue(left).localeCompare(bookingDateSortValue(right)));
  return (
    <AdminShell title="Calendar" description="Operational day view untuk jadwal treatment.">
      <Card title="Rabu, 12 Agustus 2026">
        <div className="space-y-3">
          {dayBookings.map((booking) => (
            <div key={booking.id} className="grid gap-3 rounded-lg border border-slate-200 p-3 sm:grid-cols-[120px_1fr_180px_140px] dark:border-slate-800">
              <p className="font-semibold">{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</p>
              <p>{sessionBabies.find((baby) => baby.id === booking.babyId)?.name ?? getBaby(booking.babyId)?.name} - {getBookingServiceName(booking)}</p>
              <p className="text-sm text-slate-500">{getTherapistNameForBooking(booking.id, assignments)}</p>
              <StatusBadge status={booking.status} />
            </div>
          ))}
        </div>
      </Card>
    </AdminShell>
  );
}

export function AdminCustomersPage() {
  const sessionCustomers = useBabySpaStore((state) => state.customers);
  return <SimpleAdminList title="Customers" description="Data customer dibuat dari form booking customer, bukan dipilih dari daftar." items={sessionCustomers.map((item) => `${item.name} - ${item.phone}`)} />;
}

export function AdminBabiesPage() {
  const sessionBabies = useBabySpaStore((state) => state.babies);
  return <SimpleAdminList title="Data Anak" description="Data anak dibuat dari form booking customer, bukan master data admin." items={sessionBabies.map((item) => `${item.name} - ${getCustomer(item.customerId)?.name}`)} />;
}

export function AdminTherapistsPage() {
  const bookings = useBabySpaStore((state) => state.bookings);
  const assignments = useBabySpaStore((state) => state.assignments);
  return (
    <AdminShell title="Therapists" description="Profil, status aktif, jadwal, dan history dasar.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {therapists.map((therapist) => {
          const todayCount = assignments.filter((assignment) => assignment.therapistId === therapist.id && bookings.find((booking) => booking.id === assignment.bookingId)?.bookingDate === "2026-08-12").length;
          const completedCount = assignments.filter((assignment) => assignment.therapistId === therapist.id && assignment.status === "COMPLETED").length;
          return (
            <Card key={therapist.id} title={therapist.name} headerAction={<span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", therapist.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500")}>{therapist.active ? "Active" : "Inactive"}</span>}>
              <p className="text-sm text-slate-500">{therapist.notes}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800"><p className="text-slate-500">Hari ini</p><p className="font-semibold">{todayCount} booking</p></div>
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800"><p className="text-slate-500">History</p><p className="font-semibold">{completedCount} selesai</p></div>
              </div>
            </Card>
          );
        })}
      </div>
    </AdminShell>
  );
}

export function AdminTreatmentsPage() {
  return <ServiceAdminGrid title="Treatments" description="Prototype CRUD: create, edit, disable disimulasikan di UI." services={treatments} />;
}

export function AdminPackagesPage() {
  return <ServiceAdminGrid title="Packages" description="Kelola paket dan urutan item treatment." services={packages} />;
}

function SimpleAdminList({ title, description, items }: { title: string; description: string; items: string[] }) {
  return (
    <AdminShell title={title} description={description}>
      <Card>
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((item) => <div key={item} className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-800">{item}</div>)}
        </div>
      </Card>
    </AdminShell>
  );
}

function ServiceAdminGrid({ title, description, services }: { title: string; description: string; services: Array<Treatment | TreatmentPackage> }) {
  return (
    <AdminShell title={title} description={description}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {services.map((item) => (
          <Card key={item.id} title={item.name} headerAction={<span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Active</span>}>
            <p className="text-sm text-slate-500">{item.description}</p>
            <p className="mt-3 font-semibold">{formatCurrency(item.price)}</p>
            {"items" in item ? <p className="mt-1 text-sm text-slate-500">{getPackageTreatments(item).map((entry) => entry.treatment.name).join(" → ")}</p> : null}
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm">Edit</Button>
              <Button variant="outline" size="sm">Disable</Button>
            </div>
          </Card>
        ))}
      </div>
    </AdminShell>
  );
}

function getSitiBookings(bookings: Booking[], assignments: ReturnType<typeof useBabySpaStore.getState>["assignments"], includeCompleted: boolean) {
  return bookings.filter((booking) => {
    const assignment = assignments.find((item) => item.bookingId === booking.id && item.therapistId === "therapist-siti");
    if (!assignment) return false;
    return includeCompleted ? booking.status === "COMPLETED" : booking.status !== "COMPLETED" && booking.status !== "CANCELLED" && booking.status !== "NO_SHOW";
  });
}

export function TherapistDashboardPage() {
  const bookings = useBabySpaStore((state) => state.bookings);
  const assignments = useBabySpaStore((state) => state.assignments);
  const activeBookings = getSitiBookings(bookings, assignments, false).sort((left, right) => bookingDateSortValue(left).localeCompare(bookingDateSortValue(right)));
  const todayBookings = activeBookings.filter((item) => item.bookingDate === "2026-08-12");
  const history = getSitiBookings(bookings, assignments, true);

  return (
    <TherapistShell title="Siti Rahma" description="Jadwal personal therapist.">
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <Card title="Jadwal Hari Ini" description="Booking yang sudah ditugaskan ke Siti.">
          <div className="space-y-3">
            {todayBookings.length ? todayBookings.map((booking) => <TherapistBookingCard key={booking.id} booking={booking} />) : <EmptyState title="Belum ada jadwal hari ini" description="Assign booking dari admin untuk melihat jadwal di sini." />}
          </div>
        </Card>
        <div className="space-y-4">
          <Card><p className="text-sm text-slate-400">Treatment Selesai Bulan Ini</p><p className="mt-2 text-3xl font-semibold text-white">{history.length}</p></Card>
          <Card><p className="text-sm text-slate-400">Upcoming Schedule</p><p className="mt-2 text-3xl font-semibold text-white">{activeBookings.length}</p></Card>
        </div>
      </div>
    </TherapistShell>
  );
}

function TherapistBookingCard({ booking }: { booking: Booking }) {
  const sessionBabies = useBabySpaStore((state) => state.babies);
  const babyName = sessionBabies.find((baby) => baby.id === booking.babyId)?.name ?? getBaby(booking.babyId)?.name;

  return (
    <Link href={`/therapist/schedule?booking=${booking.id}`} className="block rounded-lg border border-slate-200 bg-white p-4 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-semibold">{formatTime(booking.startTime)}</p>
          <p className="mt-1 font-medium">{babyName}</p>
          <p className="text-sm text-slate-500">{getBookingServiceName(booking)} - {booking.durationMinutes} menit</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>
    </Link>
  );
}

export function TherapistSchedulePage() {
  const bookings = useBabySpaStore((state) => state.bookings);
  const assignments = useBabySpaStore((state) => state.assignments);
  const activeBookings = getSitiBookings(bookings, assignments, false).sort((left, right) => bookingDateSortValue(left).localeCompare(bookingDateSortValue(right)));

  return (
    <TherapistShell title="Schedule" description="Siti hanya melihat booking yang ditugaskan kepadanya.">
      <div className="space-y-4">
        {activeBookings.map((booking) => (
          <Card key={booking.id}>
            <TherapistBookingDetail booking={booking} />
          </Card>
        ))}
      </div>
    </TherapistShell>
  );
}

function TherapistBookingDetail({ booking }: { booking: Booking }) {
  const sessionCustomers = useBabySpaStore((state) => state.customers);
  const sessionBabies = useBabySpaStore((state) => state.babies);
  const baby = sessionBabies.find((item) => item.id === booking.babyId) ?? getBaby(booking.babyId);
  const customer = sessionCustomers.find((item) => item.id === booking.customerId) ?? getCustomer(booking.customerId);
  const service = getBookingServiceName(booking);
  const pkg = booking.packageId ? getPackage(booking.packageId) : undefined;
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-semibold">{baby?.name} - {service}</p>
          <p className="text-sm text-slate-500">{formatDate(booking.bookingDate)} {formatTime(booking.startTime)} - {formatTime(booking.endTime)}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div><dt className="text-slate-500">Customer</dt><dd className="font-medium">{customer?.name}</dd></div>
        <div><dt className="text-slate-500">Usia Baby</dt><dd className="font-medium">{baby ? formatDate(baby.birthDate, { year: "numeric", month: "long" }) : "-"}</dd></div>
        <div><dt className="text-slate-500">Durasi</dt><dd className="font-medium">{booking.durationMinutes} menit</dd></div>
        <div><dt className="text-slate-500">Catatan Customer</dt><dd className="font-medium">{booking.customerNotes || "-"}</dd></div>
      </dl>
      {pkg ? (
        <ol className="space-y-2 text-sm">
          {getPackageTreatments(pkg).map((entry) => <li key={entry.packageItem.id}>{entry.packageItem.sequence}. {entry.treatment.name}</li>)}
        </ol>
      ) : null}
    </div>
  );
}

export function TherapistHistoryPage() {
  const bookings = useBabySpaStore((state) => state.bookings);
  const sessionBabies = useBabySpaStore((state) => state.babies);
  const assignments = useBabySpaStore((state) => state.assignments);
  const history = getSitiBookings(bookings, assignments, true).sort((left, right) => bookingDateSortValue(right).localeCompare(bookingDateSortValue(left)));

  return (
    <TherapistShell title="History" description="Treatment selesai untuk Siti Rahma.">
      <Card title="August 2026">
        <div className="space-y-3">
          {history.map((booking) => (
            <div key={booking.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
              <div>
                <p className="font-semibold">{formatDate(booking.bookingDate, { day: "numeric", month: "short", year: "numeric" })}</p>
                <p className="text-sm text-slate-500">{getBookingServiceName(booking)} - {sessionBabies.find((baby) => baby.id === booking.babyId)?.name ?? getBaby(booking.babyId)?.name}</p>
              </div>
              <StatusBadge status={booking.status} />
            </div>
          ))}
        </div>
      </Card>
    </TherapistShell>
  );
}
