import { PackageDetailPage } from "@/modules/baby-spa/components";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PackageDetailPage slug={slug} />;
}
