import React from "react"

function ProfileView({ profile, isCurrentUser, onEdit, error }) {
    return (
        <div className="form-container">
            <h1 className="green">Profile</h1>
            <div className="form-input"><strong>Username:</strong> {profile ? profile.username : ""}</div>
            <div className="form-input"><strong>Email:</strong> {profile ? profile.email : ""}</div>
            <div className="form-input"><strong>Bio:</strong> {profile ? profile.bio : ""}</div>
            <div className="form-input"><strong>Major:</strong> {profile ? profile.major : ""}</div>
            <div className="form-input"><strong>Graduation Year:</strong> {profile ? profile.graduation_year : ""}</div>
            <div className="form-input"><strong>Interests:</strong> {profile ? profile.interests.map(interest => interest.name).join(", ") : ""}</div>
            <div className="form-input"><strong>LinkedIn:</strong> {profile ? profile.linkedin : ""}</div>
            {isCurrentUser && <button onClick={onEdit} className="form-button">Edit profile</button>}
            {error && <p className="input-error" style={{ color: "red" }}>{error}</p>}
        </div>
    )
}

const MemoizedProfileView = React.memo(ProfileView)
export default MemoizedProfileView
