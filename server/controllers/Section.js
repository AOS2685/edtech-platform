const Section = require("../models/Section");
const Course = require("../models/Course");
const SubSection = require("../models/SubSection");

// CREATE a new section
exports.createSection = async (req, res) => {
	try {
		// Extract the required properties from the request body
		const { sectionName, courseId } = req.body;
		// Validate the input
		if (!sectionName || !courseId) {
			return res.status(400).json({
				success: false,
				message: "Missing required properties",
			});
		}

		// Create a new section with the given name
		const newSection = await Section.create({ sectionName });

		// Update course with section Object ID
		// Add the new section to the course's content array
		const updatedCourse = await Course.findByIdAndUpdate(
			courseId,
			{
				$push: {
					courseContent: newSection._id,
				},
			},
            // To update new state
			{ new: true }
		)
			.populate({
				path: "courseContent",
				populate: {
					path: "subSection",
				},
			})
			.exec();

		// Return the updated course object in the response
		return res.status(200).json({
			success: true,
			message: "Section created successfully",
			updatedCourse,
		});
	}

	catch (error) {
		// Handle errors
		return res.status(500).json({
			success: false,
			message: "Internal server error i.e. unable to create Section",
			error: error.message,
		});
	}
};

// UPDATE a section
exports.updateSection = async (req, res) => {
	try {
        // Data request from body
		const { sectionName, sectionId,courseId } = req.body;
		// const { sectionName, sectionId } = req.body;
        // Data Validation
        if (!sectionName) {
			return res.status(400).json({
				success: false,
				message: "Missing required properties",
			});
		}
        // Update Data 
		const section = await Section.findByIdAndUpdate(
			sectionId,
			{ sectionName },
			{ new: true }
		);
		const course = await Course.findById(courseId)
		.populate({
			path:"courseContent",
			populate:{
				path:"subSection",
			},
		})
		.exec();
        // return res
		res.status(200).json({
			success: true,
			message: "Section Updated Successfully",
			// data:section,
			data:course,
		});
	}

    catch (error) {
		console.error("Error updating section:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error i.e. Unable to update Section, please try again",
            error:error.message,
		});
	}
};

// DELETE a section
exports.deleteSection = async (req, res) => {
	try {
        // Get ID - assuming that we are sending ID in params
		const { sectionId, courseId }  = req.body;
		// Find By ID And Update
		await Course.findByIdAndUpdate(courseId, {
			$pull: {
				courseContent: sectionId,
			}
		});
		const section = await Section.findById(sectionId);
		console.log(sectionId, courseId);
		if(!section) {
			return res.status(404).json({
				success:false,
				message:"Section not Found",
			})
		}

		//delete sub section
		await SubSection.deleteMany({_id: {$in: section.subSection}});

		await Section.findByIdAndDelete(sectionId);

		//find the updated course and return 
		const course = await Course.findById(courseId).populate({
			path:"courseContent",
			populate: {
				path: "subSection"
			}
		})
		.exec();
		// Return Response
		return res.status(200).json({
			success:true,
			message:"Section Deleted Successfully",
			// Add this line further
			data:course
		});
	}
    catch (error) {
		console.error("Error deleting section:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error i.e. Unable to delete Section, Try again",
            error:error.message,
		});
	}
};