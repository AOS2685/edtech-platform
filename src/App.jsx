import "./App.css";
import { useEffect } from "react";
// Redux
import { useDispatch, useSelector } from "react-redux";

// Router Module
import { Route, Routes, useNavigate } from "react-router-dom";

//Pages
import Home from "./pages/Home"
import Login from "./pages/Login"
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import UpdatePassword from "./pages/UpdatePassword";
import VerifyEmail from "./pages/VerifyEmail";
import About from "./pages/About";
import Dashboard from  "./pages/Dashboard";
import Error from "./pages/Error"
import PrivateRoute from "./components/core/Auth/PrivateRoute";
import Contact from "./pages/Contact"
import Catalog from "./pages/Catalog"
import CourseDetails from "./pages/CourseDetails";
import ViewCourse from "./pages/ViewCourse";

// Components
import Navbar from "./components/common/Navbar"
import OpenRoute from "./components/core/Auth/OpenRoute"

import AddCourse from "./components/core/Dashboard/AddCourse"
import MyCourses from "./components/core/Dashboard/MyCourses"
import EditCourse from "./components/core/Dashboard/EditCourse"
import EnrolledCourses from "./components/core/Dashboard/EnrolledCourses"

import MyProfile from "./components/core/Dashboard/MyProfile"
import Settings from "./components/core/Dashboard/Settings"
import Cart from "./components/core/Dashboard/Cart"
import Instructor from "./components/core/Dashboard/Instructor"
import VideoDetails from "./components/core/ViewCourse/VideoDetails";

// Service 
import { getUserDetails } from "./services/operations/profileAPI"
// Utils
import { ACCOUNT_TYPE } from "./utils/constants";


function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.profile)

  useEffect(() => {
    if(localStorage.getItem("token")){
      const token = JSON.parse(localStorage.getItem("token"))
      dispatch(getUserDetails(token, navigate))
    }

  }, [])

  return (
    <div className="w-screen min-h-screen bg-richblack-900 flex flex-col font-inter">
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home/>} />
        {/* About Route */}
        <Route path="about" element={ <About/>} />
        {/* Contact Route */}
        <Route path="/contact" element={<Contact/>}/>
        <Route path="catalog/:catalogName" element={<Catalog/>} />
        <Route path="courses/:courseId" element={<CourseDetails/>} />
        {/* Routes for Signup */}
        <Route
          path="signup"
          element={
            <OpenRoute>
              <Signup/>
            </OpenRoute>
          }
        />

        {/* Router for login */}
        <Route
          path="login"
          element={
            <OpenRoute>
              <Login/>
            </OpenRoute>
          }
        />

        <Route
        // Here id means token
          path="update-password/:id"
          element = {
            <OpenRoute>
              <UpdatePassword/>
            </OpenRoute>
          }
        />

        <Route
          path="forgot-password"
          element = {
            <OpenRoute>
              <ForgotPassword/>
            </OpenRoute>
          }
        />

        <Route
          path="verify-email"
          element = {
            <OpenRoute>
              <VerifyEmail/>
            </OpenRoute>
          }
        />

      {/* Private Routes for authorised User(Login) */}
      <Route
        element={
          <PrivateRoute>
            <Dashboard/>
          </PrivateRoute>
        }
      >

      {/* Route for all users*/}
      <Route path="dashboard/my-profile" element={<MyProfile/>}/>
      <Route path="dashboard/Settings" element={<Settings/>} />

      {/* Routes for Students Only */}
      {
        user?.accountType === ACCOUNT_TYPE.STUDENT && (
          <>
            <Route path="dashboard/cart" element={<Cart/>} />
            <Route path="dashboard/enrolled-courses" element={<EnrolledCourses/>} />
          </>
        )
      }

      {/* Routes for Instructor Only */}
      {
        user?.accountType === ACCOUNT_TYPE.INSTRUCTOR && (
          <>
            <Route path="dashboard/instructor" element={<Instructor/>}/>
            <Route path="dashboard/add-course" element={<AddCourse/>}/>
            <Route path="dashboard/my-courses" element={<MyCourses />} />
            <Route path="dashboard/edit-course/:courseId" element={<EditCourse />} />
          </>
        )
      }
    
    </Route>
      {/* Error Page */}
      <Route path="*" element=<Error/>/>
      {/* For Watching video Lectures */}
      <Route element={
        <PrivateRoute>
          <ViewCourse/>
        </PrivateRoute>
      }>

        {
          user?.accountType === ACCOUNT_TYPE.STUDENT && (
            <>
              <Route
                path="view-course/:courseId/section/:sectionId/sub-section/:subSectionId"
                element={<VideoDetails/>}
              />
            </>
          )
        }
      </Route>

      </Routes>
    </div>
  );
}

export default App;