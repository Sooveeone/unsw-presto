import { useState } from 'react';
import { Link } from 'react-router-dom';

const BackToHomeButton = () => {
  const [hover, setHover] = useState(false);

  return (
    <Link 
      to="/" 
      style={{ 
        position: 'fixed', 
        top: '20px', 
        left: '30px', 
        display: 'flex', 
        alignItems: 'center', 
        textDecoration: 'none', 
        color: hover ? '#555555' : '#333', 
        zIndex: 1000 
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={{ 
        display: 'inline-block' 
      }}>
        <span style={{ 
          display: 'block', 
          width: '20px', 
          height: '25px', 
          borderTop: `2px solid ${hover ? '#555555' : '#333'}`, 
          borderLeft: `2px solid ${hover ? '#555555' : '#333'}`, 
          transform: 'rotate(-45deg)', 
          marginTop: '90px', 
          marginLeft: '30px', 
          position: 'relative' 
        }}></span>
      </div>
      <span style={{ 
        fontSize: '1.4rem', 
        marginLeft: '10px', 
        marginTop: '90px', 
        opacity: hover ? 1 : 0, 
        transform: hover ? 'translateX(0)' : 'translateX(20px)', 
        transition: 'opacity 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease', 
        whiteSpace: 'nowrap', 
        fontFamily: "'CsClaireMono', sans-serif", 
        position: 'relative' 
      }}>
                Back to Home Page
      </span>
    </Link>
  );
};

export default BackToHomeButton;