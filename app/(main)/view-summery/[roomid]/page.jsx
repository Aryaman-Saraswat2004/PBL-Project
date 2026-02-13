"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import Image from "next/image";
import { useParams } from "next/navigation";
import React from "react";
import SummeryBox from "../_components/SummeryBox";

const CoachingOptions = [
  { name: "Interview Prep", abstract: "/abs1.png" },
  { name: "Language Learning", abstract: "/abs2.png" },
  { name: "Topic Discussion", abstract: "/abs3.png" },
  // Add any more options you have...
];

function ViewSummery() {
  const { roomid } = useParams();

  // Avoid running the query until roomid is ready
  const DiscussionRoomData = useQuery(
    api.DiscussionRoom.GetDiscussionRoom,
    roomid ? { id: roomid } : "skip"
  );

  if (!roomid) {
    return <div>Loading route...</div>;
  }

  if (DiscussionRoomData === undefined) {
    return <div>Loading discussion data...</div>;
  }

  const GetAbsImg = (option) => {
    const coachingOption = CoachingOptions.find((item) => item.name === option);
    return coachingOption?.abstract ?? "/ab1.png";
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header Section */}
      <div className="flex items-center gap-6">
        <Image
          src={GetAbsImg(DiscussionRoomData?.coachingOption)}
          alt="abstract"
          width={100}
          height={100}
          className="w-[70px] h-[70px] rounded-full"
        />
        <div>
          <h2 className="font-bold text-xl">{DiscussionRoomData?.topic}</h2>
          <h3 className="text-gray-400 text-sm">
            {DiscussionRoomData?.coachingOption}
          </h3>
        </div>
      </div>

      {/* Summary Box Section */}
      <SummeryBox summery={DiscussionRoomData.summery} />
    </div>
  );
}

export default ViewSummery;
