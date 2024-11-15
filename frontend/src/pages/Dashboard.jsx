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

      
      <div className="flex flex-col md:flex-row flex-grow w-full p-6 space-y-6 md:space-y-0 md:space-x-6">
        
        <div className="w-3/4 md:w-1/5 max-w-xs mx-auto">
          <button 
            onClick={() => setShowModal(true)} 
            className="w-full px-4 py-2 bg-primaryBlue text-platinum font-semibold rounded-lg transform transition-transform duration-500 delay-2000 hover:scale-105 md:mt-0"
          >
            Create
          </button>
        </div>

        {/* card area */}
        <div className="flex-grow flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {presentations.map((presentation) => (
              <div 
                key={presentation.id} 
                onClick={() => navigate(`/${presentation.id}/edit`)}
                className="bg-platinum text-black max-w-md aspect-[2/1] rounded-lg shadow-lg flex flex-col transform transition-transform duration-500 hover:scale-105 cursor-pointer"
              >
                <div className="flex-grow flex-2/3 p-0.5">
                  <div className="w-full h-40 flex items-center justify-center bg-gray-300">
                    {presentation.thumbnail ? (
                      <img src={presentation.thumbnail} alt="Thumbnail" className="w-full h-full object-contain rounded-lg" />
                    ) : (
                      <span className="text-gray-500">Thumbnail Image</span>
                    )}
                  </div>
                </div>
                <div className="w-full flex-1/3 text-sm md:text-base lg:text-lg flex flex-row justify-between px-0.5">
                  <div className="flex flex-col min-h-[5rem]">
                    <p className="font-semibold">{presentation.name}</p>
                    {presentation.description && (
                      <p className="text-sm text-gray-600">{presentation.description}</p>
                    )}
                  </div>
                  <div className="flex items-center">
                    <p className="text-sm text-gray-500">{presentation.slides.length} slides</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">New Presentation</h3>
            <input 
              type="text" 
              value={presentationName} 
              onChange={(e) => setPresentationName(e.target.value)} 
              placeholder="Presentation Name"
              className="border p-2 w-full mb-4 rounded focus:outline-none focus:ring-2 focus:ring-primaryBlue text-gray-800"
            />
            <input 
              type="text" 
              value={presentationDescription} 
              onChange={(e) => setPresentationDescription(e.target.value)} 
              placeholder="Description (optional)"
              className="border p-2 w-full mb-4 rounded focus:outline-none focus:ring-2 focus:ring-primaryBlue text-gray-800"
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
                className="px-4 py-2 bg-primaryBlue text-white rounded-lg hover:bg-blue-600 transition duration-200"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
