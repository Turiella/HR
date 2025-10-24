import { useState } from 'react';
import { register } from '../api/auth';
import { useNavigate } from 'react-router-dom';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('candidato');
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const { token, user } = await register(email, password, fullName, role);
      localStorage.setItem('token', token);
      localStorage.setItem('role', user.role);
      navigate('/dashboard');
    } catch {
      alert('Error al registrarse');
    }
  };

  return (
    <div>
      <h2>Registro</h2>
      <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Nombre completo" />
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Contraseña" />
      <select value={role} onChange={e => setRole(e.target.value)}>
        <option value="admin">Admin</option>
        <option value="reclutador">Reclutador</option>
        <option value="candidato">Candidato</option>
      </select>
      <button onClick={handleRegister}>Registrarse</button>
    </div>
  );
}
