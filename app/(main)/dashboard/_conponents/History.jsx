"use client";

import { UserContext } from '@/app/_context/UserContext';
import { api } from '@/convex/_generated/api';
import { useConvex } from 'convex/react';
import Image from 'next/image';
import React, { useContext, useEffect, useState } from 'react';
import Link from 'next/link';

function History() {

  const convex = useConvex();
  const { userData } = useContext(UserContext);
  const [discussionRoomList, setDiscussionRoomList] = useState([]);

  useEffect(() => {
    if (userData) {
      GetDiscussionRooms();
    }
  }, [userData]);

  const GetDiscussionRooms = async () => {
    const result = await convex.query(api.DiscussionRoom.GetAllDiscussionRoom, {
      uid: userData?._id
    });
    console.log(result);
    setDiscussionRoomList(result);
  };

  return (
    <div>
      <h2 className='font-bold text-xl'>Your Previous Lectures</h2>
      {discussionRoomList?.length === 0 && (
        <h2 className='text-gray-500'>You don’t have any history</h2>
      )}

      <div>
        {discussionRoomList.map((item, index) => (
          <div key={index} className='border-b-[2px] pb-3 mb-4 group flex justify-between items-center'>
            <div className='flex gap-7 items-center'>
              <Image
                src='/ab1.png'
                alt='abs'
                width={50}
                height={50}
                className='rounded-full h-[50px] w-[50px]'
              />
              <div>
                <h2 className='font-bold'>{item.topic}</h2>
                <h2 className='text-gray-400'>{item.coachingOption}</h2>
              </div>
            </div>
            <Link href={'/view/summery/' + item._id}> 
              <button varient='ouutline'> View Notes </button>
            </Link>
            
          </div>
        ))}
      </div>
    </div>
  );
}

export default History;
