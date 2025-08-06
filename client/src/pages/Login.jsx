import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/kasse");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-2xl mb-4">Login</h1>
      <button
        onClick={handleLogin}
        className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600"
      >
        Login (Demo)
      </button>
    </div>
  );
};

export default Login;
