"use server";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function logoutAction() {
    await auth.api.signOut({
        headers: await headers(),
    });

    redirect("/login");
}
