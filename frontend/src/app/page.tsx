import { Button } from '@/components/ui/button'
import Image from 'next/image'

export default function Home() {
    return (
        <section className="bg-violet-800 flex flex-grow items-center justify-start 2xl:justify-center pl-28">
            <div className="text-center 2xl:w-3/5">
                <h1 className="text-5xl font-bold text-white mb-4 text-start">
                    Connect, collaborate and <br /> code with PeerPrep
                </h1>
                <p className="text-lg text-gray-300 text-start">
                    Collaborate and learn together with your peers, enhance your
                    skills
                    <br />
                    and prepare for technical interviews - all in one place.
                </p>
                <div className="flex my-10 gap-8 justify-start">
                    <Button size='xl' variant='default' className='font-bold'>Get Started</Button>
                    <Button size='xl' variant='outline' className='font-bold'>Find out more</Button>
                </div>
            </div>
        </section>
    )
}
