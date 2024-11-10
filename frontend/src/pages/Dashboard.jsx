import { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';

function Dashboard() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [presentationName, setPresentationName] = useState('');
  const [presentationDescription, setPresentationDescription] = useState('');
  const [presentations, setPresentations] = useState([]);

  // Fetch the presentations for the current user
  const fetchStore = async () => {
    try {
      const response = await axios.get('/store', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPresentations(response.data.store.presentations || []);
    } catch (error) {
      console.error("Failed to fetch presentations:", error);
    }
  };

 
  useEffect(() => {
    fetchStore();
  }, []);

 
  const handleLogout = async () => {
    try {
      await axios.post('/admin/auth/logout');
      localStorage.removeItem('token');
      navigate('/');
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };


  const handleCreatePresentation = async () => {
    const newPresentation = {
      id: `presentation-${Date.now()}`,
      name: presentationName,
      description: presentationDescription || "", 
      thumbnail: "", 
      slides: [{ id: `slide-${Date.now()}`, elements: [] }]
    };

    const updatedPresentations = [...presentations, newPresentation];
    setPresentations(updatedPresentations);

    // Save the data to the backend
    try {
      await axios.put('/store', { store: { presentations: updatedPresentations } });
      setShowModal(false);
      setPresentationName('');
      setPresentationDescription(''); 
    } catch (error) {
      console.error("Failed to save presentation:", error);
    }
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
              <input 
                type="text" 
                value={presentationDescription} 
                onChange={(e) => setPresentationDescription(e.target.value)} 
                placeholder="Description (optional)"
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

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {presentations.map((presentation) => (
            <div 
              key={presentation.id} 
              className="bg-white text-black p-4 rounded-lg shadow-lg flex flex-col items-center"
              style={{ width: '200px', height: '150px' }}
            >
              <div className="w-full h-20 bg-gray-300 mb-2"></div>
              <h3 className="font-semibold">{presentation.name}</h3>
              <p className="text-sm text-gray-600">{presentation.description || ""}</p>
              <p className="text-xs text-gray-500">{presentation.slides.length} slides</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;