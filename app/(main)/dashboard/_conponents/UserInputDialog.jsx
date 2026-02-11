import React, { useContext, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { Textarea } from "@/components/ui/textarea"
import { CoachingExpert } from '@/services/Options'
import Image from 'next/image'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useRouter } from 'next/navigation'
import { UserContext } from '@/app/_context/UserContext'

function UserInputDialog({ children, ExpertList }) {
    const [selectedExpert, setSelectedExpert] = useState();
    const [topic, setTopic] = useState();
    const createDiscussionRoom = useMutation(api.DiscussionRoom.CreateNewRoom);

    const [loading, setLoading] = useState(false);
    const[openDialog, setOpenDialog] = useState(false);
    const router = useRouter();
    const {userData}=useContext(UserContext);
        
    const OnClickNext= async () => {
        setLoading(true);
        const result = await createDiscussionRoom({
            topic:topic,
            coachingOptions: ExpertList?.name,
            expertName: selectedExpert,
            uid:userData?._id
        });
        console.log(result);
        setLoading(false);
        setOpenDialog(false);
        router.push('/discussion-room/'+result);
    }

    return (
    <div>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogTrigger>{children}</DialogTrigger>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>{ExpertList.name}</DialogTitle>
            <DialogDescription asChild>
                <div className='mt-3'>
                    <h2 className='text-black'>Enter a topic to master your skill</h2>
                    <Textarea placeholder="Enter your topic here" className='mt-2' onChange={(e) => setTopic(e.target.value)} />
                
                    <h2 className='text-black mt-5'>Select AI Person</h2>
                    <div className='grid grid-cols-3 md:grid-cols-6 gap-6'>
                    {CoachingExpert.map((expert, index) => (
                        <div key={index} onClick={() => setSelectedExpert(expert.name)}>
                        <Image
                            src={expert.avatar} // Make sure this path is correct
                            alt={expert.name}
                            width={100}
                            height={100}
                            className='rounded-2xl h-[80px] w-[80px] object-cover hover:scale-105 transition-all cursor-pointer'
                        />
                        <h2 className='text-center'>{expert.name}</h2>
                        </div> 
                    ))}
                    </div>

                    <div className='flex justify-end mt-5'>
                        <button onClick={OnClickNext}>Next</button>
                    </div>
                
                </div>
            </DialogDescription>
            </DialogHeader>
        </DialogContent>
        </Dialog>
    </div>
  )
}

export default UserInputDialog
