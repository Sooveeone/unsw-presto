import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post('/admin/auth/logout');
      localStorage.removeItem('token');
      navigate('/');
    } catch (err) {
      console.error("Logout failed:", err);
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
          className="text-black font-semibold hover:text-gray-200 transition duration-200"
        >
          Logout
        </button>
      </div>
      <div className="flex flex-col items-center justify-center flex-grow text-center">
        <h2 className="text-5xl font-bold mb-4 text-black">Dashboard</h2>
      </div>
    </div>
  );
}

export default Dashboard;