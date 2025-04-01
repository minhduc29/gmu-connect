import { useParams } from "react-router-dom"
import ProfileCard from "../components/profiles/ProfileCard"

function Profile() {
    const { username } = useParams()

    return <ProfileCard author={username} />
}

export default Profile