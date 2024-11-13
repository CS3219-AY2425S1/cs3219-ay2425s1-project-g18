"use client"
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button"

const ActiveMatch = ({ roomId = '' }) => {
    const router = useRouter();
    const handleRejoin = () => {
        router.push(`/codeeditor/${roomId}`);
    };

    return (
        <div className="p-6 bg-white shadow-lg rounded-lg flex flex-col items-center space-y-4">
            <CheckCircle className="text-green-500" size={48} />
            <h2 className="text-2xl font-semibold">Hey! It seems that you are already matched with a partner.</h2>
            <Button
                onClick={handleRejoin}
            >
                Rejoin Collaborative Space
            </Button>
        </div>
    );

}

export default ActiveMatch
