import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import { fetchCourseDetails, getFullDetailsOfCourse } from "../../../../services/operations/courseDetailsAPI"
import { setCourse, setEditCourse } from "../../../../slices/courseSlice"
import RenderSteps from "../AddCourse/RenderSteps"

export default function EditCourse(){
    const dispatch = useDispatch() 
    // Couseid parameter se leye hai
    const { courseId } = useParams()
    const { course } = useSelector((state) => state.course)
    const [loading, setLoading] = useState(false)
    const { token } = useSelector((state) => state.auth)

    // useEffect(() => {
    //     ;(async () => {
    //         setLoading(true)
    //         const result = await getFullDetailsOfCourse(courseId, token)
    //         if(result?.courseDetails) {
    //             dispatch(setEditCourse(true))
    //             dispatch(setCourse(result?.courseDetails))
    //         }
    //         setLoading(false)
    //     })()
    // }, [])

    useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        try {
        const result = await getFullDetailsOfCourse(courseId, token);
        console.log("Fetched course result:", result);  // 🐞 debug line
        if (result?.courseDetails) {
            dispatch(setEditCourse(true));
            dispatch(setCourse(result.courseDetails));
        } else {
            console.error("Course details not found.");
        }
        } catch (error) {
        console.error("Error fetching course details:", error);
        } finally {
        setLoading(false);
        }
    };

    if (courseId && token) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if(loading){
        return(
            <div className="grid flex-1 place-items-center">
                <div className="spinner"></div>
            </div>
        )
    }

    return(
        <div>
            <h1 className="mb-14 text-3xl font-medium text-richblack-5">
                Edit Course
            </h1>
            <div className="mx-auto max-w-[600px]">
                {
                    course ? (
                        <RenderSteps/>
                    ): (
                        <p className="mt-14 text-center text-3xl font-semibold text-richblack-100">
                            Course Not Found
                        </p>
                    )
                }
            </div>
        </div>
    )
}