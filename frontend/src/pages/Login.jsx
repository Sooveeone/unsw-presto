import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../axiosConfig';
import BackToHomeButton from '../components/BackToHomeButton';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {

    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/admin/auth/login', { email, password });
      localStorage.setItem('token', response.data.token); 
      navigate('/dashboard');
    } catch (err) {
      if (err.respnse && err.respnse.data && err.respnse.data.message) {
        setError(err.respnse.data.message);
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-lightBlue to-lightGray">
      <div>
      <BackToHomeButton />
      </div>
      <form 
        onSubmit={handleLogin} 
        className="bg-platinum p-8 rounded-3xl shadow-xl w-full max-w-md"
      >
        <Link to="/" className="absolute top-6 left-6 transform transition-transform duration-300 hover:scale-110">
          <span className="text-3xl font-bold text-black px-2 py-1 rounded font-serif ">
            Presto
          </span>
        </Link>
        <h2 className="text-2xl font-sans text-black text-center mb-6">Login</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 mb-2">Email</label>
          <input
            type="email"
            id="email"
            className="w-full p-3 border border-lightGray rounded focus:outline-none focus:ring-2 focus:ring-primaryBlue"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 mb-2">Password</label>
          <input
            type="password"
            id="password"
            className="w-full p-3 border border-lightGray rounded focus:outline-none focus:ring-2 focus:ring-primaryBlue"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className={`w-full py-3 px-4 rounded-md bg-primaryBlue text-white font-semibold hover:bg-lightBlue transition duration-300 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default Login;