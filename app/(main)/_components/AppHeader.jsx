'use client';

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@stackframe/stack";

function AppHeader() {
    return (
        <div className="p-3 shadow-sm flex justify-between items-center">
            <Link href="/dashboard">
                <Image
                    src="/logo.svg"
                    alt="Logo"
                    width={50}
                    height={50}
                    className="cursor-pointer"
                />
            </Link>

            <UserButton />
        </div>
    );
}

export default AppHeader;
