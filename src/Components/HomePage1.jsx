import React from 'react'
import customStickers from "../assets/CustomStickers.png"
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import stickers from "../assets/stickers.png"
import { useNavigate } from 'react-router-dom';

// buttoncolor: [#3fcafd]

const HomePage1 = () => {
  const navigate = useNavigate();
  return (
    <div className='flex md:flex-row flex-col'>
      <div className='md:w-[60%] w-full md:pl-20 pl-4 pt-8 space-y-8'>
        <img src={customStickers} className='w-md'/>
        <p className='text-gray-500 font-semibold w-[50%]'>Easy online ordering, 4 days turn around and online proofs , Free Shipping.</p>
        <div className='space-x-10 flex flex-row'>
          <button className='bg-gradient-to-r from-buttonColorst to-buttonColorend text-white p-4 hover:opacity-95 rounded-full cursor-pointer font-semibold'
          onClick={()=> navigate('/createstickers')}>Create Now</button>
        </div>
      </div>
      <div>
        <img src={stickers} className='w-md'/>
      </div>
    </div>
  )
}

export default HomePage1
