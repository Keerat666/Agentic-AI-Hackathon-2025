import { GoogleLogin } from "@react-oauth/google";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface LoginScreenProps {
  onLogin: (token: string) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-light via-pink-light to-lavender-light flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8 text-center space-y-8 shadow-lg border-0 bg-card/80 backdrop-blur-sm">
        <div className="space-y-4">
          <div className="w-20 h-20 mx-auto bg-primary rounded-full flex items-center justify-center">
            <span className="text-3xl">💰</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">FinanceAI</h1>
          <p className="text-muted-foreground">
            Smart financial insights powered by AI
          </p>
        </div>

        <div className="space-y-4">
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              if (credentialResponse.credential) {
                onLogin(credentialResponse.credential);
              }
            }}
            onError={() => {
              console.error("Login Failed");
            }}
          />

          <p className="text-xs text-muted-foreground">
            Secure authentication powered by Google
          </p>
        </div>
      </Card>
    </div>
  );
}
