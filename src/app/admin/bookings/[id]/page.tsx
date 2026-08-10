import { AdminBookingDetailPage } from "@/modules/baby-spa/components";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminBookingDetailPage id={id} />;
}
