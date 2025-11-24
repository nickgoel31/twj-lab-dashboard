import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className='w-screen h-screen flex items-center justify-center bg-black/30' style={{backgroundImage: 'url(/bg.png)', backgroundBlendMode: 'overlay', backgroundSize: 'cover'}}>
      <SignIn />

    </div>
  )
}