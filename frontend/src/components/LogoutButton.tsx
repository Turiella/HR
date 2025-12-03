import { useNavigate } from 'react-router-dom';

interface LogoutButtonProps {
  variant?: 'header' | 'sidebar' | 'inline';
  className?: string;
}

export default function LogoutButton({ variant = 'header', className = '' }: LogoutButtonProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Limpiar localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    
    // Redirigir al login
    navigate('/login');
  };

  const baseClasses = 'transition-all duration-200 font-medium';
  
  const variantClasses = {
    header: 'px-3 py-1.5 text-xs bg-red-600/20 border border-red-500/30 text-red-300 rounded hover:bg-red-600/30 hover:text-red-200',
    sidebar: 'px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 w-full text-left',
    inline: 'px-2 py-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-600/10 rounded'
  };

  return (
    <button
      onClick={handleLogout}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      title="Cerrar sesión"
    >
      <span className="flex items-center gap-2">
        <span className="text-[10px]">🚪</span>
        {variant === 'sidebar' ? 'Cerrar sesión' : 'Salir'}
      </span>
    </button>
  );
}
