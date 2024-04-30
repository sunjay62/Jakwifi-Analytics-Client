import React from 'react';
import { HashLoader } from 'react-spinners';

const LoadingScreen = () => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999
      }}
    >
      <HashLoader color="#2f9cf5" />
    </div>
  );
};

export default LoadingScreen;
