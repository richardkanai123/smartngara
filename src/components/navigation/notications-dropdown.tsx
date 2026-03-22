import { fetchAuthQuery } from "@/lib/auth-server"
import { api } from "@convex/_generated/api"

const NoticationsDropdown = async() => {

    const notifications = await fetchAuthQuery(api.notifications.getNotifications)
  return (
    <div>
        <h1>Notifications</h1>
        <ul>
            {notifications.map((notification) => (
                <li key={notification._id}>{notification.message}</li>
            ))}
        </ul>
    </div>
  )
}

export default NoticationsDropdown