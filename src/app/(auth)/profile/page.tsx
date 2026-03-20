import UserProfile from "@/components/auth/profile";
import { isAuthenticated } from "@/lib/auth-server";
import Link from "next/link";

const ProfilePage = async () => {
  const authenticated = await isAuthenticated();
  if(!authenticated) {
    return (
      <div>
        <h1>Not authenticated</h1>
        <Link href="/login">Login</Link>
      </div>
    )
  }
  return <UserProfile />;
};

export default ProfilePage;
