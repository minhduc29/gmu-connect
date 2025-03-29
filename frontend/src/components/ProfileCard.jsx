import { useState, useEffect } from "react";
import api from "../api"
import { useNavigate, useParams } from "react-router-dom";
import { ACCESS_TOKEN, USER_NAME } from "../constants";
import "../styles/Form.css"

function ProfileCard(route){
    const {author} = useParams();
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [bio, setBio] = useState("")
    const [major, setMajor] = useState("")
    const [graduation_year, setGraduation_year] = useState(null)
    const [linkedin, setLinkedin] = useState("")
    const [interests, setInterests] = useState([])
    const [isEditing, setIsEditing] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [tags, setTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const navigate = useNavigate();

    

    useEffect(() => {
        const fetchUserInfo = async () => {
          const token = localStorage.getItem(ACCESS_TOKEN);
          if (token) {
            try {
              setUsername(localStorage.getItem(USER_NAME));
            } catch (error) {
              console.log("Error decoding token:", error);
            }
          }
        };
        fetchUserInfo();
    }, []);
    
    useEffect(() => {
        // Fetch available tags from backend
        const fetchTags = async () => {
          try {
            const res = await api.get('/api/tags/');
            setTags(res.data);
          } catch (error) {
            console.error('Error fetching tags:', error);
          }
        };
        fetchTags();
    }, []);

    // useEffect(() =>{
    //     const othersProfile = async () =>{
    //         try{
    //             const profileData = await api.get(`/api/profiles/${otherUser}`);
    //             // console.log(profileData.data);
    //         }
    //         catch(error){
    //             console.log("Error getting profile data:", error);
    //         }
    //     };
    //     othersProfile();
    // }, []);

    useEffect(() =>{
        if (username === "") return;
        const viewProfile = async () =>{
            try{
                const myProfile = await api.get(`${route.route}${author}/`);
                // console.log("email:", myProfile.data.email);
                // console.log("response data", myProfile.data);
                setEmail(myProfile.data.email);
                setBio(myProfile.data.bio);
                setMajor(myProfile.data.major);
                setGraduation_year(myProfile.data.graduation_year);
                setInterests(myProfile.data.interests);
                setLinkedin(myProfile.data.linkedin);
            }
            catch(error){
                console.log("Error getting user profile data:", error);
            }
        };
        viewProfile();
    }, [username])

    const editProfile = () =>{
        setIsEditing(true);
    }

    const handleTagChange = (e) => {
        const value = e.target.value;
        setSelectedTags(prevSelectedTags =>
          prevSelectedTags.includes(value)
            ? prevSelectedTags.filter(tag => tag !== value)
            : [...prevSelectedTags, value]
        );
      };

    const handleSubmit = async (e) =>{
        e.preventDefault();
        try{
            await api.put(`${route.route}${username}/`, {bio, major, graduation_year, selectedTags, linkedin}, { headers: { "Content-Type": "application/json" }});
            setIsEditing(false);
        }
        catch(error) {
            if (error.response?.data?.email) {
                setErrorMessage(error.response.data.email[0]);
              } else {
                setErrorMessage("Something went wrong.");
            }
        }
    }
    return(
        <div>
            {!isEditing ?(
                <div className="form-profileView">
                    <div><strong>Username:</strong> {author}</div>
                    <div><strong>Email:</strong> {email}</div>
                    <div><strong>Bio:</strong> {bio}</div>
                    <div><strong>Major:</strong> {major}</div>
                    <div><strong>Graduation Year:</strong> {graduation_year}</div>
                    <div><strong>Interests:</strong> {interests.map((interest) => interest.name).join(", ")}</div>
                    <div><strong>Linkedin:</strong> {linkedin}</div>
                    {author === username ? <form onClick={editProfile} className="form-button">Edit profile</form> : undefined}
                </div>
            ):(
                <div>
                    
                    <form onSubmit={handleSubmit} className="form-container">
                    <input
                        className="form-input"
                        type="textarea"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="bio"   
                    />
                    <input
                        className="form-input"
                        type="text"
                        value={major}
                        onChange={(e) => setMajor(e.target.value)}
                        placeholder="major"   
                    />
                    <input
                        className="form-input"
                        type="number"
                        value={graduation_year}
                        onChange={(e) => setGraduation_year(e.target.value)}
                        placeholder="graduation_year"   
                    />
                    <label htmlFor="interests">Select Interests</label>
                        <select
                            id="interests"
                            multiple
                            value={selectedTags}
                            onChange={handleTagChange}
                        >
                            {tags.map(tag => (
                            <option key={tag.id} value={tag.id}>
                                {tag.name}
                            </option>
                            ))}
                        </select>
                    <input
                        className="form-input"
                        type="url"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        placeholder="linkedin"   
                    />
                    <button className="form-button" type="submit">
                        {"submit"}
                    </button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default ProfileCard