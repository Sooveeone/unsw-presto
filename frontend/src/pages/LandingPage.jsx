import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-lightBlue to-lightGray text-white">
      <div className="flex items-center justify-between p-6">
        <div className="text-3xl font-bold">
          <span className="text-black px-2 py-1 rounded font-serif">Presto</span>
        </div>
        <div className="space-x-4">
          <Link 
            to="/login" 
            className="text-black font-semibold hover:text-gray-200 transition duration-200"
          >
            Login
          </Link>
          <Link 
            to="/register" 
            className="text-black font-semibold hover:text-gray-200 transition duration-200"
          >
            Register
          </Link>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center flex-grow text-center">
        <h2 className="text-5xl font-bold mb-4 text-black">Welcome to Presto!</h2>
        <p className="text-lg mb-8 text-black">Start your presentation journey.</p>
      </div>
    </div>
  );
}

export default LandingPage;