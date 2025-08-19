import React from 'react';

const HeroCard = () => {    
  return (
    <div className="w-[320px] bg-[#fff480] text-black relative rounded-[2.5em] p-8 transition-transform duration-400 ease-in-out hover:scale-[0.97] active:scale-[0.9] cursor-pointer">
      <div className="flex flex-col justify-between gap-20 h-full transition-transform duration-400 ease-in-out group-hover:scale-[0.96]">
        <div className="flex justify-between">
          <span className="font-bold m-0">01.</span>
          <p className="font-semibold m-0">Lightning.</p>
        </div>
        <div className="flex justify-between items-end">
          <p className="font-semibold m-0">Hover Me?</p>
          <svg width={32} viewBox="0 -960 960 960" height={32} xmlns="http://www.w3.org/2000/svg">
            <path d="M226-160q-28 0-47-19t-19-47q0-28 19-47t47-19q28 0 47 19t19 47q0 28-19 47t-47 19Zm254 0q-28 0-47-19t-19-47q0-28 19-47t47-19q28 0 47 19t19 47q0 28-19 47t-47 19Zm254 0q-28 0-47-19t-19-47q0-28 19-47t47-19q28 0 47 19t19 47q0 28-19 47t-47 19ZM226-414q-28 0-47-19t-19-47q0-28 19-47t47-19q28 0 47 19t19 47q0 28-19 47t-47 19Zm254 0q-28 0-47-19t-19-47q0-28 19-47t47-19q28 0 47 19t19 47q0 28-19 47t-47 19Zm254 0q-28 0-47-19t-19-47q0-28 19-47t47-19q28 0 47 19t19 47q0 28-19 47t-47 19ZM226-668q-28 0-47-19t-19-47q0-28 19-47t47-19q28 0 47 19t19 47q0 28-19 47t-47 19Zm254 0q-28 0-47-19t-19-47q0-28 19-47t47-19q28 0 47 19t19 47q0 28-19 47t-47 19Zm254 0q-28 0-47-19t-19-47q0-28 19-47t47-19q28 0 47 19t19 47q0 28-19 47t-47 19Z" />
          </svg>
        </div>
      </div>
      <div className="absolute w-full h-full top-0 left-0 grid place-items-center pointer-events-none">
        <svg 
          className="w-16 h-16 transition-transform duration-400 ease-in-out hover:scale-[1.05]" 
          viewBox="0 -960 960 960" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="m393-165 279-335H492l36-286-253 366h154l-36 255Zm-73 85 40-280H160l360-520h80l-40 320h240L400-80h-80Zm153-395Z" />
        </svg>
      </div>
    </div>
  );
}

export default HeroCard;
