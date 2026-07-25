import { CategoryListing } from '@/components/packages/category-listing';

export default async function DomesticPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <CategoryListing
      locale={locale}
      type="DOMESTIC_TOUR"
      titleKey="domesticTitle"
      subtitleKey="domesticSubtitle"
    />
  );
}
