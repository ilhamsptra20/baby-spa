import { Suspense } from "react";

import { BookingPage } from "@/modules/baby-spa/components";
import { SectionLoader } from "@/ui/components/feedback";

export default function Page() {
  return (
    <Suspense fallback={<SectionLoader />}>
      <BookingPage />
    </Suspense>
  );
}
