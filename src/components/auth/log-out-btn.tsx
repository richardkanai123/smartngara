'use client'

import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const LogOutBtn = () => {
    const router = useRouter();
    const session = authClient.useSession();

    const user = session.data?.user;
    if(!user) {
        return null;
    }

    const handleSignOut = async () => {
           const res =  await authClient.signOut();
           if(res.error) {
            toast.error(res.error.message);
            return;
           }
           toast.success(`Logged out ${user.name} successfully`);
           router.push("/login");
    }

    return (
        <Button onClick={handleSignOut} variant="destructive">Log Out {user.username}</Button>
    )
}

export default LogOutBtn