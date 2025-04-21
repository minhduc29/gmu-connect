import { useState, useMemo, memo, useRef } from "react"
import { TAGS } from "../../constants"

function PostEditForm({ post, onSubmit, onCancel }) {
    const tags = useRef(JSON.parse(localStorage.getItem(TAGS)) || [])
    const [formData, setFormData] = useState({
        title: post?.title || "",
        content: post?.content || "",
        interest_tags: useMemo(() => post?.interest_tags.map(i => i.slug) || [], [post?.interest_tags])
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
        <div className="form-bg">
            <form onSubmit={handleSubmit} className="form-container">
                <input className="form-input" type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Title" />
                <textarea className="form-input scroll-hidden" rows={5} type="text" name="content" value={formData.content} onChange={handleChange} placeholder="Content" />
                <select className="form-input scroll-hidden" id="interests" multiple value={formData.interest_tags} onChange={handleTagChange}>
                    {tags.current.map(tag => <option key={tag.slug} value={tag.slug}>{tag.name}</option>)}
                </select>
                <button className="form-button" type="submit">{post ? "Save" : "Create"}</button>
                <button className="form-button" style={{ marginTop: 0 }} type="button" onClick={onCancel}>Cancel</button>
            </form>
        </div>
    )
}

const MemoizedPostEditForm = memo(PostEditForm)
export default MemoizedPostEditForm
