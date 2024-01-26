import { Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Meet } from "@/types";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";

const ShareButton = ({ params: { meet } }: { params: { meet: Meet } }) => {
    const { toast } = useToast();

    const share = async () => {
        if (!window || !window.navigator) {
            return;
        }

        const url = window.location.href;

        const shareData = {
            title: meet.name,
            text: `${meet.name}: When are you free?`,
            url,
        };

        try {
            if (navigator.share !== undefined) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(url);
                toast({
                    title: "Copied to clipboard",
                });
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <>
            <Button onClick={share} variant={"outline"}>
                <span className="pr-1">Share</span>
                <Share size={16} />
            </Button>
            <Toaster />
        </>
    );
};

export default ShareButton;
