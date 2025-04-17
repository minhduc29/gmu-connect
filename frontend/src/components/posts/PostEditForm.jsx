import { useState, useMemo, memo, useRef } from "react"
import { TAGS } from "../../constants"

function PostEditForm({ post, onSubmit, onCancel, }) {
    const tags = useRef(JSON.parse(localStorage.getItem(TAGS)) || [])
    const [formData, setFormData] = useState({
        title: post.title || "",
        content: post.content || "",
        interest_tags: useMemo(() => post.interest_tags.map(i => i.slug) || [], [post.interest_tags])
    })

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

    const handleTagChange = (e) => {
        const value = e.target.value
        setFormData(prev => ({
            ...prev,
            interest_tags: prev.interest_tags.includes(value)
                ? prev.interest_tags.filter(tag => tag !== value)
                : [...prev.interest_tags, value]
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        await onSubmit(formData)
    }

    return (
        <div>
            <form onSubmit={handleSubmit} className="form-container">
                <input className="form-input" type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Title" />
                <input className="form-input" type="textarea" name="content" value={formData.content} onChange={handleChange} placeholder="Content" />
                <label htmlFor="interests">Select Interests</label>
                <select id="interests" multiple value={formData.interest_tags} onChange={handleTagChange}>
                    {tags.current.map(tag => <option key={tag.slug} value={tag.slug}>{tag.name}</option>)}
                </select>
                <div className="form-buttons">
                    <button className="form-button" type="submit">Save Changes</button>
                    <button className="form-button secondary" type="button" onClick={onCancel}>Cancel</button>
                </div>
            </form>
        </div>
    )
}

const MemoizedPostEditForm = memo(PostEditForm)
export default MemoizedPostEditForm