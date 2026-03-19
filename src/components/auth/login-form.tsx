'use client'
import { authClient } from "@/lib/auth-client";
import { Spinner } from "../ui/spinner";
const LoginForm = ()  => {
    const {data, isPending} =  authClient.useSession()

    if (isPending) {
        return <Spinner/>
    }

    if (!data) {
        return <div>You are not logged in</div>
    }

    const email = data.user.email;
  return (
    <div>Welcome {email}</div>
  )
}

export default LoginForm