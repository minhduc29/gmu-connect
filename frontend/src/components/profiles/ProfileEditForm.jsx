import { useState, useMemo, memo, useRef } from "react"
import { TAGS } from "../../constants"

function ProfileEditForm({ profile, onSubmit, onCancel }) {
    const tags = useRef(JSON.parse(localStorage.getItem(TAGS)) || [])
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
        <form onSubmit={handleSubmit} className="form-container">
            <h1 className="green">Edit Profile</h1>
            <textarea className="form-input scroll-hidden" rows={5} maxLength={500} type="text" name="bio" value={formData.bio} onChange={handleChange} placeholder="Bio" />
            <input className="form-input" type="text" name="major" value={formData.major} onChange={handleChange} placeholder="Major" />
            <input className="form-input" type="number" name="graduation_year" value={formData.graduation_year} onChange={handleChange} placeholder="Graduation Year" />
            <select className="form-input scroll-hidden" id="interests" multiple value={formData.interests} onChange={handleTagChange}>
                {tags.current.map(tag => <option key={tag.slug} value={tag.slug}>{tag.name}</option>)}
            </select>
            <input className="form-input" type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="LinkedIn URL" />
            <button className="form-button" type="submit">Save</button>
            <button className="form-button" style={{ marginTop: 0 }} type="button" onClick={onCancel}>Cancel</button>
        </form>
    )
}

const MemoizedProfileEditForm = memo(ProfileEditForm)
export default MemoizedProfileEditForm
