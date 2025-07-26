import { useState } from "react";
import LoginScreen from "@/components/LoginScreen";
import Header from "@/components/Header";
import TabNavigation from "@/components/TabNavigation";
import UploadTab from "@/components/UploadTab";
import DashboardTab from "@/components/DashboardTab";
import ChatTab from "@/components/ChatTab";
import FloatingActionButton from "@/components/FloatingActionButton";
import jwt_decode from "jwt-decode";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'dashboard' | 'chat'>('upload');

  const handleLogin = (obj, credential:CredentialResponse) => {
    console.log(obj)
    const decoded: any = jwt_decode(credential.credential);
    const email = decoded.email;
    console.log("email",email)

    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveTab('upload');
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onLogout={handleLogout} />
      
      {activeTab === 'upload' && <UploadTab />}
      {activeTab === 'dashboard' && <DashboardTab />}
      {activeTab === 'chat' && <ChatTab />}
      
      <FloatingActionButton />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
