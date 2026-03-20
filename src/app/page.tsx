import LogOutBtn from "@/components/auth/log-out-btn";
import { isAuthenticated } from "@/lib/auth-server";

const Home = async() => {
  const authenticated = await isAuthenticated();
    if(!authenticated) {
        return <div>Not authenticated</div>
    }
    return (
        <div>
            <h1>Welcome </h1>
            <LogOutBtn />
        </div>
    )
};

export default Home;