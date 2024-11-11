import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';

function Dashboard() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [presentationName, setPresentationName] = useState('');
  const [presentationDescription, setPresentationDescription] = useState('');
  const [presentations, setPresentations] = useState([]);

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
          onClick={() => setShowModal(true)} 
          className="px-4 py-2 bg-primaryBlue text-platinum font-semibold rounded-lg transform transition-transform duration-500 hover:scale-105"
        >
          Create New Presentation
        </button>
      </div>

      <div className="flex-grow flex justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {presentations.map((presentation) => (
            <div 
              key={presentation.id} 
              onClick={() => navigate(`/${presentation.id}/edit`)}
              className="bg-platinum text-black max-w-md aspect-[2/1] rounded-lg shadow-lg flex flex-col transform transition-transform duration-500 hover:scale-105 cursor-pointer"
            >
              <div className="flex-grow flex-2/3 p-0.5">
                <div className="w-full h-full flex items-center justify-center bg-gray-300">
                  {presentation.thumbnail ? (
                    <img src={presentation.thumbnail} alt="Thumbnail" className="w-full h-full object-cover rounded" />
                  ) : (
                    <span className="text-gray-500">Image Placeholder</span>
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
  );
}

export default Dashboard;