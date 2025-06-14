// Import necessary modules
const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

// Create a new sub-section for a given section
exports.createSubSection = async (req, res) => {
  try{
    // Extract necessary Information from request ki body
    const { sectionId, title, description } = req.body
    const video = req.files.video

    // Check if all necessary fields are provided
    if(!sectionId || !title || !description || !video){
      return res.status(404).json({
        success: false,
        message: "All Fields are Required"
      })
    }
    console.log(video)

    // Upload the video file to cloudinary
    const uploadDetails = await uploadImageToCloudinary(
      video,
      process.env.FOLDER_NAME
    )

    console.log(uploadDetails);
    // Create a new Sub-Section with the necessary information
    const SubSectionDetails = await SubSection.create({
      title: title,
      timeDuration: `${uploadDetails.duration}`,
      description: description,
      videoUrl: uploadDetails.secure_url,
    })

    // Update the corresponding section with new created SubSecction
    const updatedSection = await Section.findOneAndUpdate(
      { _id: sectionId },
      { $push: { subSection: SubSectionDetails._id } },
      { new: true }
    ).populate("subSection")

    // Return the updated Section in the response
    return res.status(200).json({
      success: true,
      data: updatedSection
    })

  }
  catch(error){
    // Need to handle the error
    console.error("Error creating new sub-section", error)
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    })
  }
}

exports.updateSubSection = async (req,res) => {
  try{
    const { sectionId, subSectionId, title, description } = req.body
    const subSection = await SubSection.findById(subSectionId)

    if(!subSection){
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      })
    }

    if(title !== undefined){
      subSection.title = title
    }

    if(description !== undefined){
      subSection.description = description
    }

    if(req.files && req.files.video !== undefined){
      const video = req.files.video
      const uploadDetails = await uploadImageToCloudinary(
        video,
        process.env.FOLDER_NAME
      )
      subSection.videoUrl = uploadDetails.secure_url
      subSection.timeDuration = `${uploadDetails.duration}`
    }

    await subSection.save()

    // Find updated Section and return it
    const updatedSection = await Section.findById(sectionId).populate(
      "subSection"
    )

    console.log("Update Section", updatedSection)

    return res.json({
      success: true,
      message: "Section updated successfully",
      data: updatedSection,
    })
  }
  catch(error){
    console.error(error)
    return res.status(500).json({
      success:false,
      message: "An error occured while updating the section",
    })
  }
}

exports.deleteSubSection = async (req, res) => {
  try {
    const { subSectionId, sectionId } = req.body;
    await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $pull: {
          subSection: subSectionId,
        },
      }
    )
    const subSection = await SubSection.findByIdAndDelete({ _id: subSectionId })

    if (!subSection) {
      return res.status(404).json({
        success: false, 
        message: "SubSection not found" 
      });
    }

    // find updated section and return it
    const updatedSection = await Section.findById(sectionId).populate("subSection");
    return res.json({
      success: true,
      data: updatedSection,
      message: "SubSection deleted successfully",
    });
  }
  catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the SubSection",
    });
  }
}





//Previous code
// Create a new sub-section for a given section
// exports.createSubSection = async (req, res) => {
//   try {
//     // Extract necessary information from the request body 
//     const { sectionId, title, timeDuration, description } = req.body;
//     // extract file/video

//     // Log the received file object
//     console.log("req.files:", req.files);

//     // Extract video file
//     const video = req.files ? req.files.videoFile : null;
//     // const video = req.files.videoUrl;
//     if(!video){
//       console.log("Video file is missing!");
//       return res.status(400).json({
//         success:false,
//         message:"Video file is required"
//       });
//     }

//     // Check if all necessary fields are provided or validation
//     if (!sectionId || !title || !description || !video) {
//       return res.status(400).json({
//         success: false,
//         message: "All Fields are Required"
//       });
//     }

//     // Upload the video file to Cloudinary
//     const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);
//     console.log(uploadDetails)
//     // Create a new sub-section with the necessary information
//     const SubSectionDetails = await SubSection.create({
//       title: title,
//       timeDuration: timeDuration,
//       description: description,
//       videoUrl: uploadDetails.secure_url,
//     })

//     // Update the corresponding section with the newly created sub-section ObjectId
//     const updatedSection = await Section.findByIdAndUpdate(
//       { _id: sectionId },
//       { $push: { subSection: SubSectionDetails._id }},
//       { new: true }
//     ).populate("subSection");

//     // Return the updated section in the response
//     return res.status(200).json({
//         success: true,
//         message:"Sub Section Created Successfully",
//         updatedSection,
//     });
//   }

//   catch (error) {
//     // Handle any errors that may occur during the process
//     console.error("Error creating new sub-section:", error)
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// }

// exports.updateSubSection = async (req, res) => {
//   try {
//     const { sectionId, subSectionId, title, description } = req.body;
//     const subSection = await SubSection.findById(subSectionId);

//     if (!subSection) {
//       return res.status(404).json({
//         success: false,
//         message: "SubSection not found",
//       })
//     }

//     if (title !== undefined) {
//       subSection.title = title
//     }

//     if (description !== undefined) {
//       subSection.description = description
//     }
//     if (req.files && req.files.video !== undefined) {
//       const video = req.files.video
//       const uploadDetails = await uploadImageToCloudinary(
//         video,
//         process.env.FOLDER_NAME
//       )
//       subSection.videoUrl = uploadDetails.secure_url
//       subSection.timeDuration = `${uploadDetails.duration}`
//     }

//     await subSection.save()

//     // find updated section and return it
//     const updatedSection = await Section.findById(sectionId).populate("subSection");
//     console.log("updated section", updatedSection);

//     return res.json({
//       success: true,
//       data: updatedSection,
//       message: "Section updated successfully",
//     })
//   }
//   catch (error) {
//     console.error(error)
//     return res.status(500).json({
//       success: false,
//       message: "An error occurred while updating the section",
//     });
//   }
// }