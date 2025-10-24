import UploadForm from "../components/UploadForm";

export default function Dashboard() {
  const role = localStorage.getItem('role');

  if (role === 'admin') {
    return <div>Panel de Administrador</div>;
  }
  if (role === 'reclutador') {
    return <div>Panel de Reclutador</div>;
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