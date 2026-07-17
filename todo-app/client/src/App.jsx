import { BrowserRouter, Routes, Route } from "react-router-dom";
import Todolist from './components/todos/todolist.jsx'
import Login from "./components/auth/Login.jsx";
import Signup from "./components/auth/Signup.jsx";
import VerifyEmail from "./components/auth/VerifyEmail.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";

function App(){
	return(
		<BrowserRouter>
			<Routes>
				<Route path="/login" element={<Login />} />
				<Route path="/signup" element={<Signup />} />
				<Route path="/verify-email" element={<VerifyEmail />} />
				<Route
					path="/"
					element={
						<ProtectedRoute>
							<Todolist />
						</ProtectedRoute>
					}
				/>
			</Routes>
		</BrowserRouter>
	);
}
export default App
