const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const mongoose = require("mongoose");

// CreateRating
exports.createRating = async (req,res) => {
    try{
        // Get user id
        const userId = req.user.id;
        // Fetch it from request body
        const {rating, review, courseId} = req.body;
        // Check if user is enrolled or not.
        const courseDetails = await Course.findOne(
            {
                _id:courseId,
                studentsEnrolled: {$elemMatch: {$eq: userId} },
            });
        if(!courseDetails){
            return res.status(404).json({
                success:false,
                message:"Student is not enrolled in the course",
            });
        }

        // Check if user has already done its Rating And Reviews
        const alreadyReviewed = await RatingAndReview.findOne({
            user:userId,
            course:courseId,
        });
        if(alreadyReviewed){
            return res.status(403).json({
                success:false,
                message:"Course is already reviewed by the user",
            });
        }

        // Create Rating & Reviews
        const ratingReview = await RatingAndReview.create({
            rating,
            review,
            course:courseId,
            user:userId,
        });

        // Update Rating/Reviews into course 
        // const updatedCourseDetails = await Course.findByIdAndUpdate(
        //                         {
        //                             $push: {
        //                                 ratingAndReviews : ratingReview,
        //                             },
        //                         },
        //                         // {new:true}
        // );
        // await courseDetails.save();
        // console.log(updatedCourseDetails);
        
        // New Changes
        // Add the rating and review to the course
        await Course.findByIdAndUpdate(courseId, {
        $push: {
            ratingAndReviews: ratingReview,
        },
        })
        await courseDetails.save()

        // Return Response
        return res.status(201).json({
            success:true,
            message:"Rating and Review created Successfully",
            ratingReview,
        })
    }

    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Internal Server Error",
            error: error.message,
        });
    }
}

// Get Average Rating
exports.getAverageRating = async (req,res) => {
    // Get CourseId
    try{
        // Get course Id 
        const courseId = req.body.courseId;
        // Calculate avg rating
        const result = await RatingAndReview.aggregate([
            {
                $match:{
                    course: new mongoose.Types.ObjectId(courseId), //Change courseId to ObjectId
                },
            },
            {
                $group:{
                    _id:null,
                    averageRating: {$avg: "$rating"},
                }
            }
        ])

        // Return Rating
         if(result.length > 0){
            return res.status(200).json({
                success:true,
                averageRating: result[0].averageRating,
            });
        }

        // If no review/Raitng exists
        return res.status(200).json({
            success:true,
            message:"Average Rating is 0 out of 5, no ratings given till now",
            averageRating:0,
        });
    }

    catch(error){
        return res.status(500).json({
            success:false,
            message: "Failed to retrieve the rating for the course",
            message:error.message,
        });
    }
}

// GetAllRatingAndReviews
exports.getAllRatingReview = async (req,res) => {
    try{
            const allReviews = await RatingAndReview.find({})
                                                .sort({rating: "desc"})
                                                .populate({
                                                    path:"user",
                                                    select:"firstName lastName email image",
                                                })
                                                .populate({
                                                    path:"course",
                                                    select: "courseName",
                                                }).exec();
            // Return success Reviews
            return res.status(200).json({
                success:true,
                message:"All Reviews fetched Successfully",
                data:allReviews,
            });
    }

    catch(error){
        console.error(error)
        return res.status(500).json({
            success:false,
            message:"Failed to retrieve rating and review for the course",
            error:error.message,
        });
    }
}