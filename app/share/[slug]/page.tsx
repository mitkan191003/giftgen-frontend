import GiftUnwrap from '@/components/GiftUnwrap';

interface SharePageProps {
  params: Promise<{ slug: string }>;
}

export default async function SharePage({ params }: SharePageProps) {
  const resolvedParams = await params;
  return <GiftUnwrap initialSlug={resolvedParams.slug} />;
}
