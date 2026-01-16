import MobileWriteCanvas from '@/components/MobileWriteCanvas';

export default async function WritePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <MobileWriteCanvas sessionId={id} />;
}
