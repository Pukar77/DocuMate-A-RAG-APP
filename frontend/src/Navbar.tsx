import React from "react";

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full bg-white/30 backdrop-blur-md shadow-md z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between">
       
        <div className="text-blue-700 text-2xl font-bold tracking-wide">
          DocuMate - Talk to Your Documents
        </div>

       
        <div className="mt-2 md:mt-0 overflow-hidden w-full md:w-auto">
          <div className="animate-marquee whitespace-nowrap text-blue-400 font-medium text-sm md:text-lg">
            Ask questions, summarize, and translate your documents effortlessly!
          </div>
        </div>
      </div>

      {/* Tailwind Animation */}
      <style>
        {`
          @keyframes marquee {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .animate-marquee {
            display: inline-block;
            animation: marquee 15s linear infinite;
          }
        `}
      </style>
    </nav>
  );
}

export default Navbar;
