import { CategoryListing } from '@/components/packages/category-listing';

export default async function InternationalPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <CategoryListing
      locale={locale}
      type="INTERNATIONAL_TOUR"
      titleKey="internationalTitle"
      subtitleKey="internationalSubtitle"
    />
  );
}
