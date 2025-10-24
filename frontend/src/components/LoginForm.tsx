import { useState } from 'react';
import { login } from '../api/auth';
import { useNavigate } from 'react-router-dom';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const { token, user } = await login(email, password);
      localStorage.setItem('token', token);
      localStorage.setItem('role', user.role);
      navigate('/dashboard');
    } catch {
      alert('Error al iniciar sesión');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Contraseña" />
      <button onClick={handleLogin}>Ingresar</button>
    </div>
  );
}
