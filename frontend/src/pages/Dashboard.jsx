import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';

function Dashboard() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [presentationName, setPresentationName] = useState('');
  const [presentations, setPresentations] = useState([]);

  const handleLogout = async () => {
    try {
      await axios.post('/admin/auth/logout');
      localStorage.removeItem('token');
      navigate('/');
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleCreatePresentation = () => {
    const newPresentation = { name: presentationName, slides: [] };
    setPresentations([...presentations, newPresentation]);
    setShowModal(false);
    setPresentationName(''); 
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-lightGray to-lightBlue text-white">
      <div className="flex items-center justify-between p-6">
        <div className="text-3xl font-bold">
          <span className="text-black px-2 py-1 rounded font-serif">Presto</span>
        </div>
        <button 
          onClick={handleLogout} 
          className="px-4 py-2 bg-black text-white font-semibold rounded-lg hover:bg-white hover:text-black transition duration-200"
        >
          Logout
        </button>
      </div>

      <div className="flex flex-col items-center justify-center flex-grow text-center">
        <h2 className="text-5xl font-bold mb-4 text-black">Dashboard</h2>
        <button 
          onClick={() => setShowModal(true)} 
          className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition duration-200 mt-4"
        >
          New Presentation
        </button>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-80">
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Create New Presentation</h3>
              <input 
                type="text" 
                value={presentationName} 
                onChange={(e) => setPresentationName(e.target.value)} 
                placeholder="Presentation Name"
                className="border p-2 w-full mb-4"
              />
              <div className="flex justify-end space-x-2">
                <button 
                  onClick={() => setShowModal(false)} 
                  className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition duration-200"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreatePresentation} 
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6">
          {presentations.map((presentation, index) => (
            <div key={index} className="bg-white text-black p-4 rounded-lg shadow-lg mb-4">
              {presentation.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;