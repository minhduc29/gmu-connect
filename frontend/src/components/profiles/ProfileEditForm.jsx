import React from "react"
import { useState, useMemo } from "react"

function ProfileEditForm({ profile, tags, onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        bio: profile.bio || "",
        major: profile.major || "",
        graduation_year: profile.graduation_year || "",
        linkedin: profile.linkedin || "",
        interests: useMemo(() => profile.interests.map(i => i.slug) || [], [profile.interests])
    })

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

    const handleTagChange = (e) => {
        const value = e.target.value
        setFormData(prev => ({
            ...prev,
            interests: prev.interests.includes(value)
                ? prev.interests.filter(tag => tag !== value)
                : [...prev.interests, value]
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        await onSubmit(formData)
    }

    return (
        <div>
            <form onSubmit={handleSubmit} className="form-container">
                <input className="form-input" type="text" name="bio" value={formData.bio} onChange={handleChange} placeholder="Bio" />
                <input className="form-input" type="text" name="major" value={formData.major} onChange={handleChange} placeholder="Major" />
                <input className="form-input" type="number" name="graduation_year" value={formData.graduation_year} onChange={handleChange} placeholder="Graduation Year" />
                <label htmlFor="interests">Select Interests</label>
                <select id="interests" multiple value={formData.interests} onChange={handleTagChange}>
                    {tags.map(tag => <option key={tag.slug} value={tag.slug}>{tag.name}</option>)}
                </select>
                <input className="form-input" type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="LinkedIn URL" />
                <div className="form-buttons">
                    <button className="form-button" type="submit">Save Changes</button>
                    <button className="form-button secondary" type="button" onClick={onCancel}>Cancel</button>
                </div>
            </form>
        </div>
    )
}

const MemoizedProfileEditForm = React.memo(ProfileEditForm)
export default MemoizedProfileEditForm
