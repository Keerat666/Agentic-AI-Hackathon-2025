import { Button } from "@/components/ui/button";
import { Menu, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface User {
  name: string;
  email: string;
  picture: string;
}

interface HeaderProps {
  onLogout: () => void;
  user: User;
}

export default function Header({ onLogout, user }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-card/80 backdrop-blur-sm border-b border-border/50 px-6 py-4 z-40">
      <div className="flex items-center justify-between max-w-md mx-auto">
        <div className="flex items-center space-x-3">
          {/* Profile picture */}
          <img
            src={user.picture}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          <h1 className="text-xl font-bold">Hello {user.name}</h1>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Menu className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-card border border-border/50 rounded-2xl shadow-lg">
            <DropdownMenuItem onClick={onLogout} className="rounded-xl">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
