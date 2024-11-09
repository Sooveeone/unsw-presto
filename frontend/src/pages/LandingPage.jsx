import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div>
      <h2>Welcome to Presto!</h2>
      <p>Start your presentation journey.</p>
      <Link to="/login">Login</Link> | <Link to="/register">Register</Link>
    </div>
  );
}

export default LandingPage;