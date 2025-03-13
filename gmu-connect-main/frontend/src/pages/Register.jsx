import Form from "../components/Form"

function Register() {
    return <Form route="http://127.0.0.1:8000/api/auth/register/" method="register" />
}

export default Register