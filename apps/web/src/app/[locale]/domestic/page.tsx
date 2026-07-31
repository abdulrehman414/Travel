import { CategoryListing } from '@/components/packages/category-listing';
import { ImmersiveShell } from '@/components/immersive/immersive-shell';

export default async function DomesticPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <ImmersiveShell>
      <CategoryListing
        locale={locale}
        type="DOMESTIC_TOUR"
        titleKey="domesticTitle"
        subtitleKey="domesticSubtitle"
      />
    </ImmersiveShell>
  );
}
