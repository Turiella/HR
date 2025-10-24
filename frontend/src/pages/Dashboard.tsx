import UploadForm from "../components/UploadForm";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const role = localStorage.getItem('role');

  if (role === 'admin') {
    return <div>Panel de Administrador</div>;
  }
  if (role === 'reclutador') {
    return (
      <div>
        <h1>Panel de Reclutador</h1>
        <Link to="/recruiter" className="inline-block px-4 py-2 mt-3 text-white bg-indigo-600 rounded">
          Ir al panel de ranking
        </Link>
      </div>
    );
  }
   if (role === 'candidato') {
    return (
      <div>
        <h1>Panel de Candidato</h1>
        <UploadForm />
      </div>
    );
  
}
};