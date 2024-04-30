import { useNavigate } from 'react-router-dom';
import './notfound.scss';
import React, { useRef, useEffect } from 'react';
import lottie from 'lottie-web';
import animationData from '../../../assets/images/404lottie.json';

const Notfound = () => {
  const navigate = useNavigate();
  const lottieContainer = useRef(null);

  useEffect(() => {
    const anim = lottie.loadAnimation({
      container: lottieContainer.current,
      animationData: animationData,
      loop: true, // Mengatur apakah animasi berulang atau tidak
      autoplay: true // Mengatur apakah animasi akan otomatis diputar
    });
    return () => {
      anim.destroy();
    };
  }, []);

  const handleBackToHome = () => {
    navigate('/home');
  };

  return (
    <div className="containerNotfound">
      <div className="containerLeft">
        <div ref={lottieContainer} />
      </div>
      <div className="containerRight">
        <h2>Error 404 : Page Not Found</h2>
        <h3>The page you&apos;re looking for doesn&apos;t exist.</h3>
        <button onClick={handleBackToHome}>Back To Home</button>
      </div>
    </div>
  );
};

export default Notfound;
