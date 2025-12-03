import { useState } from 'react';
import { register } from '../api/auth';
import { useNavigate } from 'react-router-dom';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('candidato');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      setLoading(true);
      const { token, user } = await register(email, password, fullName, role);
      localStorage.setItem('token', token);
      localStorage.setItem('role', user.role);
      navigate('/dashboard');
    } catch {
      alert('Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm p-6 mx-auto mt-10 bg-white/5 border border-white/10 rounded-lg">
      <h2 className="mb-4 text-xl font-semibold">Registro</h2>
      {loading ? (
        <div className="animate-pulse">
          <div className="h-9 mb-3 bg-white/10 rounded" />
          <div className="h-9 mb-3 bg-white/10 rounded" />
          <div className="h-9 mb-3 bg-white/10 rounded" />
          <div className="h-9 mb-4 bg-white/10 rounded" />
          <div className="h-9 w-32 bg-white/10 rounded" />
        </div>
      ) : (
        <>
          <input className="w-full p-2 mb-2 bg-black/20 border border-white/10 rounded" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Nombre completo" />
          <input className="w-full p-2 mb-2 bg-black/20 border border-white/10 rounded" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
          <input className="w-full p-2 mb-3 bg-black/20 border border-white/10 rounded" value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Contraseña" />
          <select className="w-full p-2 mb-3 bg-black/20 border border-white/10 rounded" value={role} onChange={e => setRole(e.target.value)}>
            <option value="admin">Admin</option>
            <option value="reclutador">Reclutador</option>
            <option value="candidato">Candidato</option>
          </select>
          <button onClick={handleRegister} disabled={loading} className="px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-500 disabled:opacity-50">Registrarse</button>
        </>
      )}
    </div>
  );
}
