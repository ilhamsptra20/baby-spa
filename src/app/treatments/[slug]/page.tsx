import { TreatmentDetailPage } from "@/modules/baby-spa/components";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <TreatmentDetailPage slug={slug} />;
}
