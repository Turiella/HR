import UploadForm from "../components/UploadForm";
import { Link } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";

export default function Dashboard() {
  const role = localStorage.getItem('role');

  if (role === 'admin') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6 p-6 bg-white/10 backdrop-blur-md rounded-2xl shadow-xl">
          <div className="flex items-center justify-start gap-4">
            <div className="flex flex-col items-start gap-3" style={{ marginTop: '20px' }}>
              <LogoutButton variant="header" />
            </div>
            <div className="text-left">
              <h1 className="text-lg font-bold text-white flex items-center">
                <span className="text-sm mr-2"></span> Panel de Administrador
              </h1>
              <p className="mt-1 text-sm text-gray-400">Panel de administración en desarrollo...</p>
            </div>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Funciones de Administrador</h2>
          <p className="text-gray-300">Panel de administración en desarrollo...</p>
        </div>
      </div>
    );
  }
  if (role === 'reclutador') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6 p-6 bg-white/10 backdrop-blur-md rounded-2xl shadow-xl">
          <div className="flex items-center justify-start gap-4">
            <div className="flex flex-col items-start gap-3" style={{ marginTop: '20px' }}>
              <LogoutButton variant="header" />
            </div>
            <div className="text-left">
              <h1 className="text-lg font-bold text-white flex items-center">
                <span className="text-sm mr-2"></span> Panel de Reclutador
              </h1>
              <p className="mt-1 text-sm text-gray-400">Opciones del panel de reclutamiento</p>
            </div>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Opciones</h2>
          <Link to="/recruiter" className="inline-block px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700 transition-colors">
            Ir al panel de ranking
          </Link>
        </div>
      </div>
    );
  }
   if (role === 'candidato') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6 p-6 bg-white/10 backdrop-blur-md rounded-2xl shadow-xl">
          <div className="flex items-center justify-start gap-4">
            <div className="flex flex-col items-start gap-3" style={{ marginTop: '20px' }}>
              <LogoutButton variant="header" />
            </div>
            <div className="text-left">
              <h1 className="text-lg font-bold text-white flex items-center">
                <span className="text-sm mr-2"></span> Panel de Candidato
              </h1>
              <p className="mt-1 text-sm text-gray-400">Subir y gestionar tus CVs</p>
            </div>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Subir CV</h2>
          <UploadForm />
        </div>
      </div>
    );
  }
};