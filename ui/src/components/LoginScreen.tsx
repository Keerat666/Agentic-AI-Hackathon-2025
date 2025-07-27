import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface LoginScreenProps {
  onLogin: (token: string, obj : CredentialResponse) => void;
  isOffline : Boolean,
  handleLoginOffline : ()=> void
}

export default function LoginScreen({ onLogin , isOffline, handleLoginOffline }: LoginScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-light via-pink-light to-lavender-light flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8 text-center space-y-8 shadow-lg border-0 bg-card/80 backdrop-blur-sm">
        <div className="space-y-4">
          <div className="w-20 h-20 mx-auto bg-primary rounded-full flex items-center justify-center">
            <span className="text-3xl">💸</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Project Raseed</h1>
          <p className="text-muted-foreground">
            Smart financial insights powered by Google Wallet x Gemini
          </p>
        </div>

        <div className="space-y-4">
  <div className="flex justify-center">
    <GoogleLogin
      onSuccess={(credentialResponse) => {
        if (credentialResponse.credential && !isOffline) {
          onLogin(credentialResponse.credential, credentialResponse);
        }
      }}
      onError={() => {
        console.error("Login Failed");
      }}
    />
  </div>
          <p onClick={handleLoginOffline}>Login Guest</p>

  <p className="text-xs text-muted-foreground">
    Secure authentication powered by Google
  </p>
</div>
      </Card>
    </div>
  );
}