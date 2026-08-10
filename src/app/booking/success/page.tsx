import { BookingSuccessPage } from "@/modules/baby-spa/components";

export default async function Page({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  return <BookingSuccessPage bookingId={id} />;
}
