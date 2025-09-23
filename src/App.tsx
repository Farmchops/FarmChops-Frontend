import './App.css'
import { Outlet } from "react-router-dom";
import Navbar from './components/Navbar';

//Checking if I can update git
function App() {

  return (
    <>
      <Navbar />

      <main>
        <Outlet />
      </main>
    </>
  )
}

export default App;