import Form from "../components/Form"

function Login() {
    return <Form route="http://127.0.0.1:8000/api/token/" method="login" />
}

export default Login