import { useState, useRef, useEffect, useCallback } from "react"
import { USERNAME } from "../../constants"
import profileService from "../../services/profileService"
import ProfileEditForm from "./ProfileEditForm"
import ProfileView from "./ProfileView"

function ProfileCard({ author }) {
    const tags = useRef([])
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [error, setError] = useState(null)

    const currentUsername = localStorage.getItem(USERNAME) || ""
    const isCurrentUser = author === currentUsername

    useEffect(() => {
        profileService.getProfile(author).then(result => {            
            if (result.success) setProfile(result.data)
            else setError(result.error)
        }).finally(() => {
            setLoading(false)
        })

        if (!tags.current.length) {
            profileService.getTags().then(result => {
                if (result.success) tags.current = result.data
                else setError(result.error)
            })
        }
    }, [author])

    const updateProfile = useCallback(async (formData) => {
        const result = await profileService.updateProfile(currentUsername, formData)
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

    if (loading) return <div>Loading...</div>

    return (
        <div className="profile-card">
            {error && <p style={{ color: "red" }}>{error}</p>}
            {isEditing ? (
                <ProfileEditForm profile={profile} tags={tags.current} onSubmit={updateProfile} onCancel={handleCancel} />
            ) : (
                <ProfileView profile={profile} isCurrentUser={isCurrentUser} onEdit={handleEdit} />
            )}
        </div>
    )
}

export default ProfileCard
