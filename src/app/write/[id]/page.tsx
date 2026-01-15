import MobileWriteCanvas from "@/components/MobileWriteCanvas";

export default function WritePage({ params }: { params: { id: string } }) {
    return <MobileWriteCanvas sessionId={params.id} />;
}
