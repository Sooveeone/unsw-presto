import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../axiosConfig';

function Register() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }
    try {

      await axios.post('/admin/auth/register', { email, name, password });
  
      // Automatically will log in the user in by calling the login endpoint
      const response = await axios.post('/admin/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      
  
      // Navigate to the dashboard
      navigate('/dashboard');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-lightBlue to-lightGray">
      <form 
        onSubmit={handleRegister} 
        className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md"
      >
        <Link to="/" className="absolute top-6 left-6 transform transition-transform duration-300 hover:scale-110">
          <span className="text-3xl font-bold text-black px-2 py-1 rounded font-serif">Presto</span>
        </Link>

        <h2 className="text-2xl font-sans text-black text-center mb-6">Register</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 mb-2">Email</label>
          <input
            type="email"
            id="email"
            className="w-full p-3 border border-lightGray rounded focus:outline-none focus:ring-2 focus:ring-primaryBlue"
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 mb-2">Name</label>
          <input
            type="text"
            id="name"
            className="w-full p-3 border border-lightGray rounded focus:outline-none focus:ring-2 focus:ring-primaryBlue"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700 mb-2">Password</label>
          <input
            type="password"
            id="password"
            className="w-full p-3 border border-lightGray rounded focus:outline-none focus:ring-2 focus:ring-primaryBlue"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="confirmPassword" className="block text-gray-700 mb-2">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            className="w-full p-3 border border-lightGray rounded focus:outline-none focus:ring-2 focus:ring-primaryBlue"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
}

export default Register;