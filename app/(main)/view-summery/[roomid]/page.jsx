import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import React from "react";

function ViewSumemry() {
    const {roomId} = useParams();
    const DiscussionRoomData = useQuery(api.DiscussionRoom.GetDiscussionRoom, {id: roomId});

    return (
        <div>View Summery</div>
    )
}

export default ViewSumemry;