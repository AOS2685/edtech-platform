const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const { default: mongoose } = require("mongoose");
const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail");
// Need it further 
const { paymentSuccessEmail } = require("../mail/templates/paymentSuccessEmail");
const crypto = require("crypto");
const CourseProgress = require("../models/CourseProgress");

// Capture the payment and initiate the Razorpay order
exports.capturePayment = async (req, res) => {
  const { courses } = req.body;
  const userId = req.user.id
  if(courses.length === 0){
    return res.json({
      success: false,
      message: "Please Provide Course ID"
    })
  }

  // Checkout pe jao
  let total_amount = 0
  for(const course_id of courses){
    let course
    try{
      // Find the course by its ID
      course = await Course.findById(course_id)
      // If Course does'nt found, return an error
      if(!course){
        return res.status(200).json({
          success: false,
          message: "Could Not Find the Course"
        })
      }

      // Check if the user is already enrolled in the course
      const uid = new mongoose.Types.ObjectId(userId)
      if(course.studentsEnrolled.includes(uid)){
        return res.status(200).json({
          success: false,
          message: "Student is already Enrolled"
        })
      }

      // Add the price of the course to the total amount
      total_amount += course.price
    }
    catch(error){
      console.log(error)
      return res.status(500).json({
        success: false,
        message: error.message
      })
    }
  }

  const options = {
      amount: total_amount * 100, //INR into paisa conversion
      currency: "INR",
      receipt: Math.random(Date.now()).toString(),
  }

  try{
    // Initiate the payment using razorpay
    const paymentResponse = await instance.orders.create(options)
    console.log(paymentResponse)
    return res.status(200).json({
      success: true,
      data: paymentResponse,
    })
  }

  catch(error){
    console.log(error)
    return res.status(500).json({
      success: false,
      message: "Couldn't initiate order."
    })
  }
}

// Verify the Payment
exports.verifyPayment = async (req,res) => {
  const razorpay_order_id = req.body?.razorpay_order_id
  const razorpay_payment_id = req.body?.razorpay_payment_id
  const razorpay_signature = req.body?.razorpay_signature
  const courses = req.body?.courses

  const userId = req.user.id

  if(!razorpay_order_id || !razorpay_payment_id || !razorpay_signature
    || !courses || !userId
  ){
    return res.status(200).json({
      success: false,
      message: "Payment Failed"
    })
  }

  let body = razorpay_order_id + "|" + razorpay_payment_id
  // | -> pipe operator
  const expectedSignature = crypto
                .createHmac("sha256", process.env.RAZORPAY_SECRET)
                .update(body.toString())
                .digest("hex")

  if(expectedSignature === razorpay_signature){
    await enrollStudents(courses, userId, res)
    return res.status(200).json({
      success: true,
      message: "Payment Verified"
    })
  }

  return res.status(200).json({
    success: false,
    message: "Payment Failed",
 })
}

// Send Payment Success Email
exports.sendPaymentSuccessEmail = async (req,res) => {
  const { orderId, paymentId, amount } = req.body
  const userId = req.user.id

  if(!orderId || !paymentId || !amount || !userId){
    return res.status(400).json({
      success: false,
      message: "Please provide all the details"
    })
  }

  try{
    const enrolledStudent = await User.findById(userId)
    await mailSender(
      enrolledStudent.email,
      `Payment Received`,
      paymentSuccessEmail(
        `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
        amount / 100,
        orderId,
        paymentId
      )
    )
  }
  catch(error){
    console.log("Error in sending mail ", error)
    return res.status(400).json({
      success: false,
      message: "Could not send email "
    })
  }
}

// Enroll the Students in the course
const enrollStudents = async (courses, userId, res) => {
  if(!courses || !userId){
    return res.status(400).json({
      success: false,
      message: "Please provide data for Course ID and User ID"
    })
  }

  for (const courseId of courses){
    try{
      // Find the Course & Enroll the student in it
      const enrolledCourse = await Course.findOneAndUpdate(
        { _id : courseId},
        { $push: { studentsEnrolled: userId }},
        { new : true }
      )

      if(!enrolledCourse){
        return res.status(500).json({
          success:false,
          error: "Course not Found "
        })
      }
      console.log("Updated Course: ", enrolledCourse)

      const courseProgress = await CourseProgress.create({
        courseID: courseId,
        userId: userId,
        completedVideos: [],
      })

      // Now find the student and add the course to their list of enrolled courses
      const enrolledStudent = await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            courses: courseId,
            courseProgress: courseProgress._id,
          },
        },
        { new: true }
      )

      console.log("Enrolled Student: ", enrolledStudent)
      // Send an email notifications to the enrolled Student
      const emailResponse = await mailSender(
        enrolledStudent.email,
        `Successfully Enrolled into ${enrolledCourse.courseName}`,
        courseEnrollmentEmail(
                  enrolledCourse.courseName,
                  `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
        )
      )

      console.log("Email sent Successfully ", emailResponse.response)
    }
    catch(error){
      console.log(error)
      return res.status(400).json({
        success: false,
        error: error.message
      })
    }
  } 
}

// verify the Signature of Razorpay and Server
// exports.verifyPayment = async (req, res) => {
//   // const razorpay_order_id = req.body?.razorpay_order_id
//   // const razorpay_payment_id = req.body?.razorpay_payment_id
//   // const razorpay_signature = req.body?.razorpay_signature
//   // const courses = req.body?.courses
//   const{
//     razorpay_order_id, razorpay_payment_id, razorpay_signature, courses 
//   } = req.body;
//   const userId = req.user.id

//   // We will check later
//   // const webhookSecret = "12345678";
//   // const signature = req.headers["x-razorpay-signature"];
//   if (
//     !razorpay_order_id || !razorpay_payment_id ||
//     !razorpay_signature ||
//     !courses ||
//     !userId
//   ) 
//   {
//     return res.status(400).json({
//       success: false,
//       message: "Payment Failed"
//     });
//   }

//   let body = razorpay_order_id + "|" + razorpay_payment_id;

//   const expectedSignature = crypto
//                       .createHmac("sha256", process.env.RAZORPAY_SECRET)
//                       .update(body.toString())
//                       .digest("hex");
  

//   if (expectedSignature === razorpay_signature) {
//     try{
//       console.log("Payment is Authorised");
//       await enrollStudents(courses, userId);
//       return res.status(200).json({
//         success: true,
//         message: "Payment Verified"
//       });
//     }
//     catch(error){
//       console.error(error);
//       return res.status(500).json({
//         success:false,
//         message:"Error enrolling students",
//       });
//     }
//   }

//   return res.status(400).json({
//     success: false,
//     message: "Payment Verification Failed",
//   });
// };

// Send Payment Success Email
// exports.sendPaymentSuccessEmail = async (req, res) => {
//   const { orderId, paymentId, amount } = req.body;
//   const userId = req.user.id;

//   // Data Validation
//   if (!orderId || !paymentId || !amount || !userId) {
//     return res.status(400).json({
//       success: false,
//       message: "Incompleted details provided",
//     });
//   }

//   try {
//     const enrolledStudent = await User.findById(userId);
//     await mailSender(
//       enrolledStudent.email,
//       `Payment Received`,
//       paymentSuccessEmail(
//         `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
//         amount / 100,
//         orderId,
//         paymentId
//       )
//     );

//     return res.status(200).json({
//       success:true,
//       message:"Payment success email sent",
//     });
//   }

//   catch (error) {
//     console.error("Error in sending mail", error)
//     return res.status(500).json({
//       success: false,
//       message: "Error sending payment success email",
//     });
//   }
// };

// Enroll students into courses
// const enrollStudents = async (courses, userId) => {
//   for (const courseId of courses) {
//     try {
//       const enrolledCourse = await Course.findByIdAndUpdate(
//         courseId,
//         { $push: { studentsEnrolled: userId } },
//         { new: true }
//       );

//       if (!enrolledCourse) {
//         throw new Error(`Course with ID ${courseId} not found`);
//       }

//       const courseProgress = await CourseProgress.create({
//         courseID: courseId,
//         userId: userId,
//         completedVideos: [],
//       });

//       const enrolledStudent = await User.findByIdAndUpdate(
//         userId,
//         {
//           $push: {
//             courses: courseId,
//             courseProgress: courseProgress._id,
//           },
//         },
//         { new: true }
//       );

//       await mailSender(
//         enrolledStudent.email,
//         `Enrollment Successful for ${enrolledCourse.courseName}`,
//         courseEnrollmentEmail(
//           enrolledCourse.courseName,
//           `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
//         )
//       );
//     } catch (error) {
//       console.error(`Error enrolling in course ${courseId}:`, error);
//       throw error;
//     }
//   }
// };





// Old code
// exports.capturePayment = async (req, res) => {
//   //get CourseId & UserID
//   const { course_id } = req.body;
//   const userId = req.user.id;
//   // Validation
//   if (!course_id) {
//     return res.status(400).json({
//       success: false,
//       message: "Please Provide Course ID"
//     });
//   };

//   // Valid CourseDetail
//   let course;
//   // Further checking
//   // let total_amount = 0;
//   // for (const course_id of courses) {}
//     try {
//       // Find the course by its ID
//       course = await Course.findById(course_id);
//       // If the course is not found, return an error
//       if (!course) {
//         return res.status(400).json({
//           success: false,
//           message: "Could not found",
//         });
//       }

//       // Check if the user is already enrolled in the course
//       const uid = new mongoose.Types.ObjectId(userId);
//       if (course.studentsEnrolled.includes(uid)) {
//         return res.status(400).json({
//           success: false,
//           message: "Student is already Enrolled",
//         });
//       }

//       // Add the price of the course to the total amount
//       // total_amount += course.price

//     }

//     catch (error) {
//       console.error(error);
//       return res.status(500).json({ 
//         success: false,
//         message: error.message
//       });
//     }

//   // Order Create
//   const amount = course.price;
//   const currency = "INR";

//   const options = {
//     // amount: total_amount * 100,
//     amount: amount * 100,
//     // currency: "INR",
//     currency,
//     // receipt: Math.random(Date.now()).toString(),
//     receipt: `receipt_${Math.random().toString(36).substring(2)}`,
//     // Add by us 
//     notes:{
//       courseID: course_id,
//       userId,
//     },
//   };

//   try {
//     // Initiate the payment using Razorpay
//     const paymentResponse = await instance.orders.create(options);
//     console.log(paymentResponse);
//     // Return Response
//     return res.status(200).json({
//       success: true,
//       //Added by me later
//       courseName:course.courseName,
//       courseDescription:course.courseDescription,
//       thumbnail: course.thumbnail,
//       orderId: paymentResponse.id,
//       currency: paymentResponse.currency,
//       amount: paymentResponse.amount,
//       // It was present at previous state
//       // data: paymentResponse,
//     });

//   }
//   catch (error) {
//     console.log(error);
//     res.status(500).json({
//       success: false,
//       message: "Error in initiating payment",
//     });
//   }
// };

// enroll the student in the courses
// const enrollStudents = async (courses, userId, res) => {
  // if (!courses || !userId) {
  //   return res.status(400).json({
  //     success: false,
  //     message: "Please Provide Course ID and User ID"
  //   });
  // }


  // for (const courseId of courses) {
  //   try {
  //     // Find the course and enroll the student in it
  //     const enrolledCourse = await Course.findOneAndUpdate(
  //       { _id: courseId },
  //       { $push: { studentsEnroled: userId } },
  //       { new: true }
  //     )

  //     if (!enrolledCourse) {
  //       return res.status(500).json({ 
  //         success: false, 
  //         error: "Course not found" 
  //       });
  //     }
  //     console.log("Updated course: ", enrolledCourse)
  //     const courseProgress = await CourseProgress.create({
  //       courseID: courseId,
  //       userId: userId,
  //       completedVideos: [],
  //     })

      // Find the student and add the course to their list of enrolled courses
//       const enrolledStudent = await User.findByIdAndUpdate(
//         userId,
//         {
//           $push: {
//             courses: courseId,
//             courseProgress: courseProgress._id,
//           },
//         },
//         { new: true }
//       )

//       console.log("Enrolled student: ", enrolledStudent)
//       // Send an email notification to the enrolled student
//       const emailResponse = await mailSender(
//         enrolledStudent.email,
//         `Successfully Enrolled into ${enrolledCourse.courseName}`,
//         courseEnrollmentEmail(
//           enrolledCourse.courseName,
//           `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
//         )
//       )

//       console.log("Email sent successfully: ", emailResponse.response)
//     } catch (error) {
//       console.log(error)
//       return res.status(400).json({ success: false, error: error.message })
//     }
//   }
// }