const Course = require("../models/Course")
const Category = require("../models/Category")
const Section = require("../models/Section")
const SubSection = require("../models/SubSection")
const User = require("../models/User")
const { uploadImageToCloudinary } = require("../utils/imageUploader")
const CourseProgress = require("../models/CourseProgress")
// const mongoose = require("mongoose");
const { convertSecondsToDuration } = require("../utils/secToDuration")

// Rewriting all code in case of course

// Function to create a new Course
exports.createCourse = async (req, res) => {
  try{
    // Get userId from request object
    const userId = req.user.id

    // Get all required fields from request body
    let{
      courseName, courseDescription,
      whatYouWillLearn, price,
      tag: _tag,
      category, status,
      instructions: _instructions,
    } = req.body

    // Get thumbnail image from request files
    const thumbnail = req.files.thumbnailImage

    // Convert the tag and instructions from stringified Array to Array
    const tag = JSON.parse(_tag)
    const instructions = JSON.parse(_instructions)

    console.log("tag", tag)
    console.log("instructions", instructions)

    // Need to check if any of the fields are not present
    if(!courseName ||
        !courseDescription ||
        !whatYouWillLearn ||
        !price||
        !tag.length ||
        !thumbnail ||
        !category ||
        !instructions.length
    ){
      return res.status(400).json({
        success: false,
        message: "All Fields are Mandatory",
      })
    }
    if(!status || status === undefined){
      status  = "Draft"
    }
    // Check if user is an instructor
    const instructorDetails = await User.findById(userId, {
      accountType: "Instructor",
    })

    if(!instructorDetails){
      return res.status(404).json({
        success: false,
        message: "Instructor Details Not Found",
      })
    }

    // Fetch category details before using it
    const categoryDetails = await Category.findById(category);
    if (!categoryDetails) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }
    
    // Upload the Thumbnail to Cloudinary
    const thumbnailImage = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    )
    console.log(thumbnailImage)

    

    // Create a new course with the given details
    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatYouWillLearn: whatYouWillLearn,
      price,
      tag,
      category: categoryDetails._id,
      thumbnail: thumbnailImage.secure_url,
      status: status,
      instructions,
    })

    // We need to add the New Course to the User Schema of the Instructor
    await User.findByIdAndUpdate(
      {
        _id: instructorDetails._id,
      },
      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true }
    );

  // await Category.findByIdAndUpdate(
  //   categoryDetails._id,
  //   {
  //     $push: {
  //       courses: newCourse._id,
  //     },
  //   },
  //   { new: true }
  // );
    // Add the new course to the categories
    const categoryDetails2 = await Category.findByIdAndUpdate(
      { _id: category },
      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true }
    )

    console.log(categoryDetails2);

    // Return the new course and a success message
    res.status(200).json({
      success: true,
      data: newCourse,
      message: "Course Created Successfully",
    })
  }
  catch(error){
    // Need to handle errors that occur during the creation of the course
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Failed to create course",
      error: error.message
    })
  }
}

// Edit Course Details
exports.editCourse = async (req,res) => {
  try{
    const {courseId} = req.body;
    const updates = req.body
    const course = await Course.findById(courseId)

    if(!course){
      return res.status(404).json({
        error:"Course not found"
      })
    }

    // If thumbnail Image is found, update it
    if(req.files){
      console.log("Thumnail Update")
      const thumbnail = req.files.thumbnailImage
      const thumbnailImage = await uploadImageToCloudinary(
        thumbnail,
        process.env.FOLDER_NAME
      )
      course.thumbnail = thumbnailImage.secure_url
    }

    // Update only the fields that are present in the request body
    for (const key in updates){
      if(updates.hasOwnProperty(key)){
        if(key === "tag" || key === "instructions"){
          course[key] = JSON.parse(updates[key])
        }
        else{
          course[key] = updates[key]
        }
      }
    }

    await course.save()

    const updatedCourse = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec()

      res.json({
        success:true,
        message: "Course Updated Successfully",
        data: updatedCourse,
      })
  }
  catch(error){
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    })
  }
}

// Get Course List
exports.getAllCourses = async (req,res) => {
  try{
    const allCourses = await Course.find(
      {status: "Published"},
      {
        courseName: true,
        price: true,
        thumbnail: true,
        instructor: true,
        ratingAndReviews: true,
        studentsEnrolled: true,
      }
    )
      // .populate("instructor",)
      .populate({
        path: "instructor",
        select: "firstName lastName",
      })
      .exec()
    // console.log(JSON.stringify(allCourses, null, 2));
    // print(allCourses);


    return res.status(200).json({
      success: true,
      data: allCourses,
    })
  }
  catch(error){
    console.log(error)
    return res.status(404).json({
      success: false,
      message: `Can't Fetch Course Data`,
      error: error.message,
    })
  }
}

// Get Course Details
exports.getCourseDetails = async (req, res) => {
  try{
    const {courseId} = req.body
    const courseDetails = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        select: "firstName lastName",
        populate: {
          path: "additionalDetails"
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
          select: "-videoUrl",
        },
      })
      .exec()

    if(!courseDetails || !courseDetails.courseContent){
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      })
    }

    let totalDurationInSeconds = 0
    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration)
        totalDurationInSeconds += timeDurationInSeconds
      })
    })

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
      },
    })

  }
  catch(error){
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get Full CourseDetails
exports.getFullCourseDetails = async (req, res) => {
  try{
    const { courseId } = req.body
    const userId = req.user.id
    const courseDetails = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        select: "firstName lastName",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec()

    let courseProgressCount = await CourseProgress.findOne({
      courseID: courseId,
      userId: userId,
    })

    console.log("CourseProgressCount : ", courseProgressCount)

    if(!courseDetails || !courseDetails.courseContent){
      return res.status(400).json({
        success:false,
        message: `Could not find course with id: ${courseId}`,
      })
    }

    let totalDurationInSeconds = 0;
    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration)
        totalDurationInSeconds += timeDurationInSeconds
      })
    })

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
        completedVideos: courseProgressCount?.completedVideos
            ? courseProgressCount?.completedVideos
            : [],
      },
    })
  }

  catch(error){
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get a list of Course for a given Instructor
exports.getInstructorCourses = async (req, res) => {
  try{
    // Get Instuctorid from the authenticated user or request body
    const instructorId = req.user.id

    // Find all courses belonging to the instructor
    const instructorCourses = await Course.find({
      instructor: instructorId,
    })
    .populate({
        path: "instructor",
        select: "firstName lastName",
    })
    .sort({ createdAt: -1 })
    .exec()

    // Return Instructor's Courses
    res.status(200).json({
      success:true,
      data: instructorCourses,
    })
  }
  catch(error){
    console.error(error);
    res.status(500).json({
      success: false,
      message:"Failed to retrieve instructor courses",
      error:error.message,
    })
  }
}

// Delete the Course
exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.body

    // Find the course
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    // Unenroll students from the course
    const studentsEnrolled = course.studentsEnrolled
    for (const studentId of studentsEnrolled) {
      await User.findByIdAndUpdate(studentId, {
        $pull: { courses: courseId },
      })
    }

    // Delete sections and sub-sections
    const courseSections = course.courseContent
    for (const sectionId of courseSections) {
      // Delete sub-sections of the section
      const section = await Section.findById(sectionId)
      if (section) {
        const subSections = section.subSection
        for (const subSectionId of subSections) {
          await SubSection.findByIdAndDelete(subSectionId)
        }
      }

      // Delete the section
      await Section.findByIdAndDelete(sectionId)
    }

    // Delete the course
    await Course.findByIdAndDelete(courseId)

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}



// old code

// Function to create a new course
// exports.createCourse = async (req, res) => {
//   try {
//     // Fetch data
//     let {
//       courseName,
//       courseDescription,
//       whatYouWillLearn,
//       price,
//       tag,
//       category,
// 			status,
// 			instructions,
//     } = req.body;

//     if (!status || status === undefined) {
//       status = "Draft"
//     }

//     // get thumbnail
//     const thumbnail = req.files.thumbnailImage;

//     // Check if any of the required fields are missing
//     if (
//       !courseName ||
//       !courseDescription ||
//       !whatYouWillLearn ||
//       !price ||
//       !tag ||
//       !thumbnail ||
//       !category ||
//       !instructions.length
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "All Fields are Mandatory",
//       });
//     }

//     // Check if the user is an instructor
//     const userId = req.user.id;
//     const instructorDetails = await User.findById(userId, {
//       accountType: "Instructor",
//     });
//     // console.log("Instruction Details: ",instructorDetails);

//     if (!instructorDetails) {
//       return res.status(404).json({
//         success: false,
//         message: "Instructor Details Not Found",
//       });
//     }

//     // Check if given tag is valid or not
//     const categoryDetails = await Category.findById(category);
//     if(!categoryDetails){
//         return res.status(404).json({
//             success:false,
//             message:"Category Details not found",
//         });
//     }

//     // Upload the Thumbnail to Cloudinary
//     const thumbnailImage = await uploadImageToCloudinary(
//       thumbnail,
//       process.env.FOLDER_NAME
//     );
//     console.log(thumbnailImage);
//     // Create a new course with the given details
//     const newCourse = await Course.create({
//       courseName,
//       courseDescription,
//       instructor: instructorDetails._id,
//       whatYouWillLearn: whatYouWillLearn,
//       price,
//       tag:tag,
//       category: categoryDetails._id,
//       thumbnail: thumbnailImage.secure_url,
//       status: status,
//       instructions:instructions,
//     });

//     // Add the new course to the User Schema of the Instructor
//     await User.findByIdAndUpdate(
//       {
//         _id: instructorDetails._id,
//       },
//       {
//         $push: {
//           courses: newCourse._id,
//         },
//       },
//       { new: true },
//     );

//     // Add new Course to the Categories
//     await Category.findByIdAndUpdate(
//       {_id: category},
//       {
//         $push: {
//           course: newCourse._id,
//         },
//       },
//       { new: true }
//     );

//     // return response
//     return res.status(200).json({
//         success:true,
//         data:newCourse,
//         message:"Course Created Successfully",
//     });
//   }

//   catch(error){
//     // Handle the error that occur during creation of the course
//     console.error(error);
//     return res.status(500).json({
//         success:false,
//         message:"Failed to create Course",
//         error:error.message,
//     });
//   }
// };

// getAllCouses handler function
// exports.getAllCourses = async (req,res) =>{
//     try{
//         const allCourses = await Course.find(
//           {},
//             {
//                 courseName:true,
//                 price:true,
//                 thumbnail:true,
//                 instructor:true,
//                 ratingAndReviews:true,
//                 studentsEnrolled:true,
//             }).populate("instructor").exec();
//         // Return success response
//             return res.status(200).json({
//             success:true,
//             // message:"Data for all courses fetched successfully",
//             data:allCourses,
//         });
//     }

//     catch(error){
//         console.log(error);
//         return res.status(404).json({
//             success:false,
//             message:"Cannot Fetch course data",
//             error:error.meassage,
//         });
//     }
// };

// Get CourseDetails
// exports.getCourseDetails = async (req,res) => {
//   try{
//     // Get id
//     const {courseId} = req.body;
//     // Handling fromat error of Course Id (No Need)
//     if(!mongoose.Types.ObjectId.isValid(courseId)){
//       return res.status(400).json({
//         success: false,
//         message:"Invalid course Id format",
//       });
//     }

//     // Find Course Details
//     const courseDetails = await Course.findById(
//                                   {_id: courseId}).populate(
//                                               {
//                                                 path:"instructor",
//                                                 populate:{
//                                                   path:"additionalDetails",
//                                                 },
//                                               }
//                                             )
//                                             .populate("category")
//                                             .populate("ratingAndReviews")
//                                             .populate({
//                                                 path:"courseContent",
//                                                 populate:{
//                                                   path:"subSection",
//                                                   // strictPopulate:false,
//                                                 },
//                                             })
//                                             .exec();
//     // Validation
//     if(!courseDetails){
//       return res.status(404).json({
//         success:false,
//         message:`Could not find the course with ${courseId}`,
//       });
//     }

//     // Return Response
//     return res.status(200).json({
//       success:true,
//       message:"Course Details fetched Successfully",
//       data:courseDetails,
//     });
//   }

//   catch(error){
//     console.log(error);
//     return res.status(500).json({
//       success:false,
//       message:error.message,
//     });
//   }
// };


