import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Splash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 4000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="relative h-screen w-full flex justify-center items-center bg-white overflow-hidden">


      <div className="absolute -top-24 -left-24 w-96 h-96 md:w-[600px] md:h-[600px] bg-green-500/20 blur-[100px] rounded-full z-0"></div>


      <div className="absolute -bottom-32 -right-24 w-96 h-96 md:w-[600px] md:h-[600px] bg-[#FFF0DC] blur-[100px] rounded-full z-0"></div>


      <div className="relative z-10 text-center flex flex-col items-center">


        <div className="w-24 h-24 bg-gradient-to-br from-green-900/10 to-green-500/5 backdrop-blur-xl rounded-[25px] flex justify-center items-center mb-6 shadow-sm border border-white/20">
          <svg
            width="44"
            height="59"
            viewBox="0 0 44 59"
            fill="none"
            className="text-[#006E2F]"
          >
            <path
              d="M21.6665 58.5976C15.6367 58.5976 10.5181 56.4939 6.31086 52.2867C2.10362 48.0795 0 42.9609 0 36.931C0 32.0293 1.46153 27.6479 4.3846 23.7869C7.30766 19.9258 11.1303 17.3478 15.8525 16.0529C14.1474 15.6726 12.6463 14.9717 11.3493 13.9504C10.0523 12.929 8.99783 11.6769 8.18586 10.194C7.3739 8.71111 6.78522 7.10535 6.41984 5.37673C6.05445 3.64811 5.94013 1.87568 6.07687 0.0594526C8.16233 -0.11148 10.1474 0.0861741 12.032 0.652414C13.9166 1.21865 15.6174 2.09152 17.1345 3.271C18.6516 4.45048 19.8984 5.84791 20.8748 7.46329C21.8513 9.07867 22.4293 10.8949 22.6088 12.912C23.3097 11.2325 24.1579 9.64489 25.1537 8.14917C26.1494 6.65344 27.2861 5.26669 28.5639 3.98892C29.0255 3.52739 29.6109 3.29663 30.3203 3.29663C31.0297 3.29663 31.6151 3.52739 32.0767 3.98892C32.5382 4.45044 32.769 5.0359 32.769 5.74528C32.769 6.45467 32.5382 7.04012 32.0767 7.50165C30.8758 8.70251 29.8138 10.0123 28.8908 11.4311C27.9677 12.8499 27.2519 14.3606 26.7433 15.9632C31.6322 17.1127 35.6194 19.6383 38.7049 23.54C41.7904 27.4417 43.3331 31.9054 43.3331 36.931C43.3331 42.9609 41.2295 48.0795 37.0222 52.2867C32.815 56.4939 27.6964 58.5976 21.6665 58.5976Z"
              fill="currentColor"
            />
          </svg>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-1">Healthify</h1>
        <p className="text-gray-500 text-lg mb-8">Your AI Nutrition Coach</p>


        <div className="flex justify-center gap-2">
          <span className="w-2.5 h-2.5 bg-gray-300 rounded-full animate-pulse"></span>
          <span className="w-2.5 h-2.5 bg-gray-300 rounded-full animate-pulse [animation-delay:200ms]"></span>
          <span className="w-2.5 h-2.5 bg-gray-300 rounded-full animate-pulse [animation-delay:400ms]"></span>
        </div>
      </div>
    </div>
  );
};

export default Splash;