import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  const [loopNum, setLoopNum] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const toRotate = ["to success!", "unlocks your degree!", "builds your future!", "maps your degree path!", "drives your goals!", "simplifies your journey!"];
  const [text, setText] = useState('');
  const [delta, setDelta] = useState(200 - Math.random() * 100);
  const period = 1500;

  useEffect(() => {
    let ticker = setInterval(() => {
      tick();
    }, delta);

    return () => clearInterval(ticker);
  }, [text, delta, isDeleting, loopNum]);

  const tick = () => {
    let i = loopNum % toRotate.length;
    let fullText = toRotate[i];
    let updatedText = isDeleting ? fullText.substring(0, text.length - 1) : fullText.substring(0, text.length + 1);

    setText(updatedText);

    if (isDeleting) {
      setDelta(100);
    } else {
      setDelta(200 - Math.random() * 100);
    }

    if (!isDeleting && updatedText === fullText) {
      setIsDeleting(true);
      setDelta(period);
    } else if (isDeleting && updatedText === '') {
      setIsDeleting(false);
      setLoopNum(loopNum + 1);
      setDelta(200 - Math.random() * 100);
    }
  };

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
      <div className="flex flex-col items-center justify-center flex-grow text-center font-serif">
        <h2 className="text-5xl font-bold mb-4 text-black">Welcome to Presto</h2>
        <p className="text-lg mb-8 text-black font-bold">
          Presto <span className="text-primaryBlue">{text}</span>
        </p>
      </div>
    </div>
  );
}

export default LandingPage;