import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';

export function AuthPage({ mode = 'login' }) {
  const navigate = useNavigate();
  const { login, signup, loginWithGoogle } = useAuth();
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('male');

  const [address, setAddress] = useState('');
  const [idNumber, setIdNumber] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (mode === 'signup') {
        await signup(email, password, role, name, phone, gender, address, idNumber);
      } else {
        await login(email, password, role);
      }
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle(role);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to authenticate with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-96 bg-gradient-accent rounded-full blur-[120px] opacity-20 -z-10 pointer-events-none"></div>
      
      <Card className="w-full max-w-md animate-fade-in-up">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-brand-dark dark:bg-brand-accent flex items-center justify-center shadow-sm mb-4">
            <span className="text-brand-accent dark:text-brand-dark font-bold text-2xl">H</span>
          </div>
          <CardTitle className="text-2xl">{mode === 'login' ? 'Welcome back' : 'Create an account'}</CardTitle>
          <CardDescription>
            {mode === 'login' ? 'Enter your credentials to access your account' : 'Sign up to start resolving conflicts'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleAuth}>
          <CardContent className="space-y-4">
            {error && <div className="p-3 bg-red-50 text-red-500 text-sm rounded-xl">{error}</div>}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Role</label>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  type="button" 
                  variant={role === 'user' ? 'default' : 'ghost'} 
                  onClick={() => setRole('user')}
                  className={role === 'user' ? 'border border-slate-200 dark:border-white/10' : ''}
                >
                  User
                </Button>
                <Button 
                  type="button" 
                  variant={role === 'moderator' ? 'default' : 'ghost'} 
                  onClick={() => setRole('moderator')}
                  className={role === 'moderator' ? 'border border-slate-200 dark:border-white/10' : ''}
                >
                  Moderator
                </Button>
              </div>
            </div>
            
            {mode === 'signup' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
                  <Input placeholder="John Doe" required value={name} onChange={e => setName(e.target.value)} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
                  <Input type="tel" placeholder="+91 9876543210" required value={phone} onChange={e => setPhone(e.target.value)} />
                </div>

                {role === 'user' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Gender</label>
                      <select 
                        className="flex h-12 w-full rounded-xl px-4 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/50 focus-visible:border-brand-accent glass-input appearance-none bg-slate-50 dark:bg-dark-900/50 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white"
                        value={gender} 
                        onChange={e => setGender(e.target.value)}
                        required
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="transgender">Transgender</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Address</label>
                      <Input placeholder="Full residential address" required value={address} onChange={e => setAddress(e.target.value)} />
                    </div>
                  </>
                )}

                {role === 'moderator' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Official ID Number</label>
                    <Input placeholder="MOD-2026-XXXX" required value={idNumber} onChange={e => setIdNumber(e.target.value)} />
                  </div>
                )}
              </>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
              <Input type="email" placeholder="name@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
              <Input type="password" placeholder="••••••••" required value={password} onChange={e => setPassword(e.target.value)} />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" variant="gradient" className="w-full" disabled={loading}>
              {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Sign Up')}
            </Button>
            
            <div className="relative w-full text-center py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-white/10"></div>
              </div>
              <span className="relative bg-white dark:bg-dark-900 px-3 text-xs uppercase text-slate-500 font-medium">Or</span>
            </div>

            <Button 
              type="button" 
              variant="outline" 
              className="w-full bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-white flex items-center justify-center gap-2"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                <path d="M1 1h22v22H1z" fill="none"/>
              </svg>
              Continue with Google
            </Button>
            <div className="text-center text-sm text-slate-500 dark:text-slate-400">
              {mode === 'login' ? (
                <>Don't have an account? <Button type="button" variant="link" className="p-0 h-auto text-brand-dark dark:text-brand-accent font-semibold" onClick={() => navigate('/signup')}>Sign up</Button></>
              ) : (
                <>Already have an account? <Button type="button" variant="link" className="p-0 h-auto text-brand-dark dark:text-brand-accent font-semibold" onClick={() => navigate('/login')}>Log in</Button></>
              )}
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
