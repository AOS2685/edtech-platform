const Category = require("../models/Category");

function getRandomInt(max){
    return Math.floor(Math.random() * max);
}

// We create category handler function
exports.createCategory = async (req, res) => {
    try{
        // request data from body
        const {name, description} = req.body;
        // validation
        // if(!name || !description){
        if(!name){
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            });
        }

        // Entry data in DB
        const CategoryDetails = await Category.create({
            name:name,
            description:description,
        });
        console.log(CategoryDetails);
        // return response
        return res.status(200).json({
            success:true,
            message:"Category Created Successfully",
        });
    }

    catch(error){
        return res.status(500).json({
            success:true,
            message:error.message,
        });
    }
};

// GetAlltags Handler Function
exports.showAllCategories = async (req, res) => {
  try {
    const allCategorys = await Category.find()
    res.status(200).json({
      success: true,
      data: allCategorys,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.categoryPageDetails = async (req, res) => {
  try {
    const { categoryId } = req.body

    // Get courses for the specified category
    const selectedCategory = await Category.findById(categoryId)
      .populate({
        path: "courses",
        match: { status: "Published" },
        populate: "ratingAndReviews",
      })
      .exec()

    console.log("SELECTED COURSE", selectedCategory)
    // Handle the case when the category is not found
    if (!selectedCategory) {
      console.log("Category not found.")
      return res
        .status(404)
        .json({ success: false, message: "Category not found" })
    }
    // Handle the case when there are no courses
    if (selectedCategory.courses.length === 0) {
      console.log("No courses found for the selected category.")
      return res.status(404).json({
        success: false,
        message: "No courses found for the selected category.",
      })
    }

    // Get courses for other categories
    const categoriesExceptSelected = await Category.find({
      _id: { $ne: categoryId },
    })
    let differentCategory = await Category.findOne(
      categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
        ._id
    )
      .populate({
        path: "courses",
        match: { status: "Published" },
      })
      .exec()
    console.log()
    // Get top-selling courses across all categories
    const allCategories = await Category.find()
      .populate({
        path: "courses",
        match: { status: "Published" },
      })
      .exec()
    const allCourses = allCategories.flatMap((category) => category.courses)
    const mostSellingCourses = allCourses
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 10)

    res.status(200).json({
      success: true,
      data: {
        selectedCategory,
        differentCategory,
        mostSellingCourses,
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}


// exports.categoryPageDetails = async (req, res) => {
//     try{
//         // Get Category Id
//         const { categoryId } = req.body;
        
//         // Get Courses for the specified Category
//         const selectedCategory = await Category.findById(categoryId)
//                                             .populate({
//                                                 path: "courses",
//                                                 match: { status: "Published" },
//                                                 populate: "ratingAndReviews",
//                                             }).exec();
//         console.log(selectedCategory);
//         // Handle the case when category is not found
//         if(!selectedCategory){
//             console.log("Category not found");
//             return res.status(404).json({
//                 success:false,
//                 message: "Category Not Found."
//             });
//         }

//         //Handle the case when there are no courses
//         if(selectedCategory.courses.length === 0){
//             console.log("No Courses found for the selected category.");
//             return res.status(404).json({
//                 success:false,
//                 message:"No courses found for the selected category.",
//             });
//         }

//         const selectedCourses = selectedCategory.courses;
//         // Get Courses for other categories
//         const categoriesExceptSelected = await Category.find({
//             _id: { $ne: categoryId },
//         }).populate("courses").exec();
//         let differentCourses = [];
//         for(const category of categoriesExceptSelected){
//             differentCourses.push(...category.courses);
//         }

//         // Get top Selling Courses across all Categories
//         const allCategories = await Category.find().populate("courses");
//         const allCourses = allCategories.flatMap((category) => category.courses);
//         const mostSellingCourses = allCourses
//                     .sort((a,b) => b.sold -a.sold)
//                     .slice(0,10);

//         // Return
//         res.status(200).json({
//             selectedCourses:selectedCourses,
//             differentCourses:differentCourses,
//             mostSellingCourses: mostSellingCourses,
//         });

//     }
//     catch(error){
//         return res.status(500).json({
//             success:false,
//             message:"internal Server Error",
//             error:error.message,
//         });
//     }
// };