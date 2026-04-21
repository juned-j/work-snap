import { useState } from 'react';
import { authService } from '../services/authService'; // Path check karein
import LoginForm from './LoginForm'; // Same folder import

export default function Login({ onToggle }: { onToggle: () => void }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

 const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    try {
      // ✅ Change: loginUser -> login AND pass as object
      await authService.login({ email, password }); 
      
      console.log("Login Success ✅");
    } catch (error: any) {
      console.error("Login Error:", error.message);
      
      if (error.message.includes("Invalid login credentials")) {
        alert("Incorrect email or password.");
      } else {
        alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4">
      <LoginForm 
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        loading={loading}
        onSubmit={handleLogin}
        onToggle={onToggle}
      />
    </div>
  );
}