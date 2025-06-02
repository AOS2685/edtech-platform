import React, {useEffect, useState} from "react";
import RatingStars from "../../common/RatingStars"
import GetAvgRating from "../../../utils/avgRating"
import { Link, useSearchParams } from "react-router-dom"

const Course_Card = ({course, Height}) => {

        const [avgReviewCount, setAvgReviewCount] = useState(0);

        useEffect(() => {
            // console.log(course.instructor);
            const count = GetAvgRating(course.ratingAndReviews);
            setAvgReviewCount(count);
            // console.log(course);
            // console.log(course.instructor.firstName);
        },[course])

        // useEffect(() => {
        //     console.log(course)
        // }, [course])

        return(
            <div>
                <Link to={`/courses/${course._id}`}>
                    <div>
                        <div className="rounded-lg">
                            <img
                                src={course?.thumbnail}
                                alt="course-thumbnail"
                                className={`${Height} w-full rounded-xl object-cover`}
                            />
                        </div>
                        <div className="flex flex-col gap-2 px-1 py-3">
                            <p className="text-xl text-richblack-5">{course?.courseName}</p>
                            <p className="text-sm text-richblack-50">
                                {/* {course?.instructor?.firstName} {course?.instructor?.lastName} */}
                                {course && course.instructor && typeof course.instructor !== "string"
                                ? `${course.instructor.firstName} ${course.instructor.lastName}`
                                : "Instructor information not available"}
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="text-yellow-5">{avgReviewCount || 0}</span>
                                <RatingStars Review_Count={avgReviewCount}/>
                                <span className="text-richblack-400">
                                    {course?.ratingAndReviews?.length} Ratings
                                </span>
                            </div>
                            <p className="text-xl text-richblack-5">Rs. {course?.price}</p>
                        </div>
                    </div>
                </Link>
            </div>
        )
}

export default Course_Card;