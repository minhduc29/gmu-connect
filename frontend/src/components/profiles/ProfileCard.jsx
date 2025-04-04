import { useState, useEffect, useCallback, useRef } from "react"
import { PROFILE, USERNAME } from "../../constants"
import ProfileEditForm from "./ProfileEditForm"
import ProfileView from "./ProfileView"
import profileService from "../../services/profileService"

function ProfileCard({ author }) {
    const username = useRef(localStorage.getItem(USERNAME))
    const [profile, setProfile] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [isCurrentUser, setIsCurrentUser] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        if (username.current === author) {
            setIsCurrentUser(true)
            setProfile(JSON.parse(localStorage.getItem(PROFILE)))
        } else {
            profileService.getProfile(author).then(result => {
                if (result.success) setProfile(result.data)
                else setError(result.error)
            })
        }
    }, [author])

    const handleSubmit = useCallback(async (formData) => {
        const result = await profileService.updateProfile(username.current, formData)
        if (result.success) setProfile(result.data)
        else setError(result.error)

        setIsEditing(false)
    }, [])

    const handleEdit = useCallback(() => {
        setIsEditing(true)
    }, [])

    const handleCancel = useCallback(() => {
        setIsEditing(false)
    }, [])

    return (
        <div className="profile-card">
            {error && <p style={{ color: "red" }}>{error}</p>}
            {isEditing ? (
                <ProfileEditForm profile={profile} onSubmit={handleSubmit} onCancel={handleCancel} />
            ) : (
                <ProfileView profile={profile} isCurrentUser={isCurrentUser} onEdit={handleEdit} />
            )}
        </div>
    )
}

export default ProfileCard
