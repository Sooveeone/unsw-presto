import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  const [loopNum, setLoopNum] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const toRotate = ["brings success!", "powers presentations!", "captures your audiences!", "inspires with every slide!", "elevates pitches!"];
  const [text, setText] = useState('');
  const [delta, setDelta] = useState(200 - Math.random() * 100);
  const period = 1100;

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
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-lightGray to-lightBlue text-white">
      <div className="flex items-center justify-between p-6">
        <div className="text-3xl font-bold">
          <span className="text-black px-2 py-1 rounded font-serif">Presto</span>
        </div>
        <div className="space-x-4">
          <Link
            to="/login"
            className="px-4 py-2  text-black font-semibold rounded-lg hover:bg-white hover:text-black transition duration-220"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 bg-black text-white font-semibold rounded-lg hover:bg-white hover:text-black transition duration-220"
          >
            Register
          </Link>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center flex-grow text-center font-serif">
        <h2 className="text-6xl font-bold mb-4 text-black italic">Welcome</h2>
        <p className="text-2xl mb-8 text-black font-bold">
          Presto <span className="text-white">{text}</span>
        </p>
        <div className="text-base text-black" style={{ lineHeight: '1.8'}}>
          Create captivating and professional slide decks effortlessly. <br/>
          With the help of our user-friendly tools and features, save time and create presentations that are special.
        </div>
      </div>
    </div>
  );
}

export default LandingPage;