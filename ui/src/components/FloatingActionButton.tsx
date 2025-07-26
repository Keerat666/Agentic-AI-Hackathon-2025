import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function FloatingActionButton() {
  return (
    <Button 
      className="fixed bottom-28 right-6 w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg z-30"
      size="icon"
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
}