import { useState } from 'react';
import axios from 'axios';

const UploadForm = () => {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      alert('Seleccioná un archivo PDF');
      return;
    }

    const formData = new FormData();
    formData.append('cv', file);

    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/cvs/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setAnalysis(res.data.analysis);
      alert('✅ CV subido y analizado correctamente');
    } catch (err) {
      console.error('❌ Error al subir el CV:', err);
      alert('❌ Error al subir el CV');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl p-4 mx-auto border rounded shadow-md">
      <h2 className="mb-4 text-xl font-semibold">Subir y analizar CV</h2>
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-2"
      />
      <button
        onClick={handleUpload}
        disabled={loading}
        className="px-4 py-2 text-white bg-blue-600 rounded disabled:opacity-50"
      >
        {loading ? 'Analizando...' : 'Subir CV'}
      </button>

      {analysis && (
        <div className="mt-6">
          <h3 className="mb-2 text-lg font-medium">Resultado del análisis:</h3>
          <pre className="p-2 overflow-auto text-sm bg-gray-100 rounded">
            {JSON.stringify(analysis, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default UploadForm;
