// Import the required modules
const express = require("express");
const router = express.Router();

// Import the Controllers
// Course Controllers Import
const {
    createCourse,
    getAllCourses,
    getCourseDetails,
    getFullCourseDetails,
    editCourse,
    getInstructorCourses,
    deleteCourse,
} = require("../controllers/Course");

// Categories Controller Import
const {
    showAllCategories,
    createCategory,
    categoryPageDetails,
} = require("../controllers/Category");

// Section Controllers
const{
    createSection,
    updateSection,
    deleteSection
} = require("../controllers/Section");

// Sub-Sections Controllers
const {
    createSubSection,
    updateSubSection,
    deleteSubSection
} = require("../controllers/Subsection");

// Rating Controllers Import
const {
    createRating,
    getAverageRating,
    getAllRatingReview,
} = require("../controllers/RatingAndReview");

const {
    updateCourseProgress,
    getProgressPercentage
} = require("../controllers/courseProgress")

// We need to have middleware for checking whether user is Instructor, Student, Admin
const { auth, isInstructor, isStudent, isAdmin } = require("../middlewares/auth");
const { route } = require("./User");

// Now  Writing Course Routes one by one

// ******************** Course Routes ********************
//   ********* For Instructors ****************
router.post("/createCourse", auth, isInstructor, createCourse);
// Edit Course Routes
router.post("/editCourse", auth, isInstructor, editCourse)

// 1) Add a Section to a Course
router.post("/addSection", auth, isInstructor, createSection);
// 2) Update a Section
router.post("/updateSection",auth, isInstructor, updateSection);
// 3) Delete a Section
router.post("/deleteSection", auth, isInstructor, deleteSection);
// 4) Edit Sub Section
router.post("/updateSubSection", auth, isInstructor, updateSubSection);

// 5) Delete Sub-Section
router.post("/deleteSubSection", auth, isInstructor, deleteSubSection);

// Add Sub-Section
router.post("/addSubSection", auth, isInstructor, createSubSection);

// Get all Courses Under a Specific Instructor
router.get("/getInstructorCourses", auth, isInstructor, getInstructorCourses)

// Get all Courses Under a Specific Instructor
router.post("/getFullCourseDetails", auth, getFullCourseDetails)

// To Update Course Progress
router.post("/updateCourseProgress", auth, isStudent, updateCourseProgress)
// Get all Registered Course
router.get("/getAllCourses", getAllCourses);

// Get Details for a specific Course
router.post("/getCourseDetails", getCourseDetails);

// To Update Course Progress
router.post("/updateCourseProgress", auth, isStudent, updateCourseProgress)

// Delete a Course
router.delete("/deleteCourse", deleteCourse)

// ************** (Course Routes) *********************

// **********(For Admin) **************
// Category can only be created by admin
router.post("/createCategory", auth, isAdmin, createCategory);
router.get("/showAllCategories", showAllCategories);
router.post("/getCategoryPageDetails", categoryPageDetails);

//  *************(Rating & Reviews) It should be done by Student only ****************
router.post("/createRating",auth,isStudent, createRating);
router.get("/getAverageRating",getAverageRating);
router.get("/getReviews", getAllRatingReview);

module.exports = router;