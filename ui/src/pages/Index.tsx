import { useState } from "react";
import LoginScreen from "@/components/LoginScreen";
import Header from "@/components/Header";
import TabNavigation from "@/components/TabNavigation";
import UploadTab from "@/components/UploadTab";
import DashboardTab from "@/components/DashboardTab";
import ChatTab from "@/components/ChatTab";
import FloatingActionButton from "@/components/FloatingActionButton";
import { jwtDecode } from "jwt-decode";
import { CredentialResponse } from "@react-oauth/google";

interface User {
  name: string;
  email: string;
  picture: string;
}

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'dashboard' | 'chat'>('upload');

  const handleLogin = (_: string, credential: CredentialResponse) => {
    const decoded: any = jwtDecode(credential.credential!);
    const name = decoded.name;
    const email = decoded.email;
    const picture = decoded.picture;

    setUser({ name, email, picture });
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setActiveTab('upload');
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onLogout={handleLogout} user={user} />

      {activeTab === 'upload' && <UploadTab user={user}/>}
      {activeTab === 'dashboard' && <DashboardTab user={user} />}
      {activeTab === 'chat' && <ChatTab user={user}/>}

      <FloatingActionButton />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
