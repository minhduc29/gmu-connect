import React from "react"

function ProfileView({ profile, isCurrentUser, onEdit }) {
    return (
        <div className="form-profileView">
            <div><strong>Username:</strong> {profile ? profile.username : ""}</div>
            <div><strong>Email:</strong> {profile ? profile.email : ""}</div>
            <div><strong>Bio:</strong> {profile ? profile.bio : ""}</div>
            <div><strong>Major:</strong> {profile ? profile.major : ""}</div>
            <div><strong>Graduation Year:</strong> {profile ? profile.graduation_year : ""}</div>
            <div><strong>Interests:</strong> {profile ? profile.interests.map(interest => interest.name).join(", ") : ""}</div>
            <div><strong>Linkedin:</strong> {profile ? profile.linkedin : ""}</div>
            {isCurrentUser && <button onClick={onEdit} className="form-button">Edit profile</button>}
        </div>
    )
}

const MemoizedProfileView = React.memo(ProfileView)
export default MemoizedProfileView
