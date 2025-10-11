"use client";
import React from "react";
import { useUser } from "@stackframe/stack";
import { ExpertList } from "@/services/Options";
import Image from "next/image";
import UserInputDialog from "./UserInputDialog";

function FeatureAssistants() {
    const user = useUser();
    return(
        <div>
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="font-medium text-gray-500">My Workspace</h2>
                    <h2 className="text-3xl font-bold">Welcome Back, {user?.displayName}</h2>
                </div>
                <button>Profile</button>
            </div>

            <div className="grid grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-5 mt-10">
                {ExpertList.map((options, index) => (
                    <UserInputDialog ExpertList={options}>
                        <div key={index} className="p-3 bg-secondary rounded-3xl flex flex-col justify-center items-center">
                            <Image src={options.icon} alt={options.name}
                                width={70}
                                height={70}
                                className='object-contain hover:rotate-12 cursor-pointer transition-all'
                            />
                            <h2 className="mt-2">{options.name}</h2>
                        </div>
                    </UserInputDialog>
                ))}
            </div>
        </div>
    )
}

export default FeatureAssistants;