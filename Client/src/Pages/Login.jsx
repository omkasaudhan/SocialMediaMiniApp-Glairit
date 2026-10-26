import {assets} from '../assets/assets'
import { Star } from 'lucide-react'
import { SignIn } from '@clerk/react'
const Login = () => {
  return (
    <div className='min-h-screen flex flex-col md:flex-row '>
        {/* {backgroundImage} */}
        <img src={assets.bgImage} alt="Background" className='absolute top-0 left-0 -z-1 w-full h-full object-cover '/>    
    
        {/* {left side : Branding} */}
        <div className='flex-1 flex flex-col justify-center items-center gap-12 bg-gradient-to-r from-blue-500 to-purple-500 text-white p-8'>
            <img src={assets.logo} alt="Logo" className='h-24 object-contains' />
        
          <div>
            <div className='flex items-center gap-3 mb-4 max-md:mt-10'> 
              <img src={assets.group_users} alt="" className='h-8 md:h-10 ' />
              <div>
                <div className='flex items-center gap-1 mb-1'>
                  {Array(5).fill(0).map((_, index) => (
                    <Star key={index} className='size-4 md:size-4.5 text-transparent fill-amber-500' />
                  ))}
                </div>
                <p className='text-sm md:text-base'>Rated 4.8/5 by 12k+ users</p>
              </div>
            </div>
            <h1 className='text-3xl md:text-6xl md:pb-2 gap-4 font-bold bg-gradient-to-r from-indigo-950 to-indigo-800 bg-clip-text text-transparent'>A place for Friends to Truely Connect</h1>
            <p className='text-xl md:text-2xl text-indigo-900 gap-4 max-w-222'>Connect with Global community on glairit. </p>  
            <p className='text-xl md:text-2xl text-indigo-900 max-w-222'>Share your thoughts, ideas, and experiences with the world.</p>     
          </div>
          <span className='absolute bottom-0 right-0 text-sm md:text-base text-white p-2'>© 2024 Glairit. All rights reserved.</span>   
        </div>
    {/* { Right side:login form } */}
    <div className='flex-1 flex flex-col justify-center items-center p-8'>
      <SignIn />
    </div>
  </div>
  )
}

export default Login