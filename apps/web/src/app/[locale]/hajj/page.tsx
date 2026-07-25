import { CategoryListing } from '@/components/packages/category-listing';

export default async function HajjPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <CategoryListing locale={locale} type="HAJJ" titleKey="hajjTitle" subtitleKey="hajjSubtitle" />
  );
}
