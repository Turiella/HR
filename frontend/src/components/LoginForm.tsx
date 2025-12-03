import { useState } from 'react';
import { login } from '../api/auth';
import { useNavigate } from 'react-router-dom';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setLoading(true);
      const { token, user } = await login(email, password);
      localStorage.setItem('token', token);
      localStorage.setItem('role', user.role);
      navigate('/dashboard');
    } catch {
      alert('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm p-6 mx-auto mt-10 bg-white/5 border border-white/10 rounded-lg">
      <h2 className="mb-4 text-xl font-semibold">Login</h2>
      {loading ? (
        <div className="animate-pulse">
          <div className="h-9 mb-3 bg-white/10 rounded" />
          <div className="h-9 mb-4 bg-white/10 rounded" />
          <div className="h-9 w-28 bg-white/10 rounded" />
        </div>
      ) : (
        <>
          <input className="w-full p-2 mb-2 bg-black/20 border border-white/10 rounded" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
          <input className="w-full p-2 mb-3 bg-black/20 border border-white/10 rounded" value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Contraseña" />
          <button onClick={handleLogin} disabled={loading} className="px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-500 disabled:opacity-50">Ingresar</button>
        </>
      )}
      {!loading && (
        <div className="mt-4 text-sm text-center text-gray-400">
          ¿No tienes una cuenta?{' '}
          <button 
            onClick={() => navigate('/register')}
            className="text-indigo-400 hover:text-indigo-300 underline"
          >
            Regístrate
          </button>
        </div>
      )}
    </div>
  );
}
