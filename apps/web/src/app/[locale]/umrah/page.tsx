import { CategoryListing } from '@/components/packages/category-listing';

export default async function UmrahPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <CategoryListing locale={locale} type="UMRAH" titleKey="umrahTitle" subtitleKey="umrahSubtitle" />
  );
}
