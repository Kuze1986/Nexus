import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const admins = await base44.entities.AdminUser.filter({ email });
      
      if (admins.length === 0) {
        setError('Invalid credentials');
        setLoading(false);
        return;
      }

      const admin = admins[0];
      if (admin.password_hash !== password) {
        setError('Invalid credentials');
        setLoading(false);
        return;
      }

      await base44.entities.AdminUser.update(admin.id, {
        last_login: new Date().toISOString()
      });

      sessionStorage.setItem('nexus_admin', admin.id);
      navigate('/admin/dashboard');
    } catch (err) {
      setError('Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080C14] flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">NEXUS Admin</h1>
          <p className="text-gray-400">Portal Management System</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-white mb-2 block">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
                placeholder="admin@nexus.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-white mb-2 block">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-6 text-lg bg-white text-gray-900 hover:bg-gray-100"
            >
              {loading ? 'Logging in...' : 'Sign In'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}