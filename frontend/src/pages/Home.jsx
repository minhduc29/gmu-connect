import { useState, useEffect } from "react"
import api from "../api"
import { useSearchParams } from "react-router-dom";

function Home() {
    const [notes, setNotes] = useState([]);
    const [content, setContent] = useState("")
    const [title, setTitle] = useState("")

    useEffect(() => {
        getNotes();
    }, [])

    const getNotes = () => {
        api.get("/api/notes/").then((res) => res.data).then((data) => setNotes(data)).catch().catch((err) => alert(err));
    }
    return <div>Home</div>
}

export default Home