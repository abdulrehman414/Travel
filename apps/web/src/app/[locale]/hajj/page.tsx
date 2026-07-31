import { CategoryListing } from '@/components/packages/category-listing';
import { ImmersiveShell } from '@/components/immersive/immersive-shell';

export default async function HajjPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <ImmersiveShell>
      <CategoryListing locale={locale} type="HAJJ" titleKey="hajjTitle" subtitleKey="hajjSubtitle" />
    </ImmersiveShell>
  );
}
