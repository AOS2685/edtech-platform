import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import IconBtn from '../../common/IconBtn';
import { BsChevronDown } from "react-icons/bs"
import { IoIosArrowBack } from "react-icons/io"

const VideoDetailsSidebar = ({setReviewModal}) => {

    const [activeStatus, setActiveStatus] = useState("");
    const [videoBarActive, setVideoBarActive] = useState("");
    const navigate = useNavigate();
    const location = useLocation();
    const {sectionId, subSectionId} = useParams();
    // Ye data humlog slice se fetch kiye hai 
    const {
        courseSectionData,
        courseEntireData,
        totalNoOfLectures,
        completedLectures,
    } = useSelector((state)=>state.viewCourse);

    // useEffect(()=> {
    //     const setActiveFlags = () => {
    //         if(!courseSectionData.length)
    //             return;
    //         const currentSectionIndex = courseSectionData.findIndex(
    //             (data) => data._id === sectionId
    //         )
    //         const currentSubSectionIndex = courseSectionData?.[currentSectionIndex]?.subSection.findIndex(
    //             (data) => data._id === subSectionId
    //         )
    //         const activeSubSectionId = courseSectionData[currentSectionIndex]?.subSection?.[currentSubSectionIndex]?._id;
    //         //set current section here
    //         setActiveStatus(courseSectionData?.[currentSectionIndex]?._id);
    //         //set current sub-section here
    //         setVideoBarActive(activeSubSectionId);
    //     }
    //     setActiveFlags();
    // },[courseSectionData, courseEntireData, location.pathname])

    useEffect(() => { 
        ;(() => {
            if(!courseSectionData.length) return;
            const currentSectionIndx = courseSectionData.findIndex(
                (data) => data._id === sectionId
            )
            const currentSubSectionIndx = courseSectionData?.[
                currentSectionIndx
            ]?.subSection.findIndex((data) => data._id === subSectionId)
            const activeSubSectionId = courseSectionData[currentSectionIndx]?.subSection?.[
                currentSubSectionIndx]?._id
            //Set Current Section Here
            setActiveStatus(courseSectionData?.[currentSectionIndx]?._id)
            // Set Current Sub-Section Here
            setVideoBarActive(activeSubSectionId)
        })()
    }, [courseSectionData, courseEntireData, location.pathname])

  return (
    <>
        <div className='flex h-[calc(100vh-3.5rem)] w-[320px] max-w-[350px] flex-col border-r-[1px] border-r-richblack-700 bg-richblack-800'>
            {/* for buttons and headings */}
            <div className='mx-5 flex flex-col items-start justify-between gap-2 gap-y-4 border-b border-richblack-600 py-5 text-lg font-bold text-richblack-25'>
                {/* for buttons */}
                <div className='flex w-full items-center justify-between'>
                    <div 
                    onClick={()=> {
                        navigate(`/dashboard/enrolled-courses`)
                    }}
                    className='flex h-[35px] w-[35px] items-center justify-center rounded-full bg-richblack-100 p-1 text-richblack-700 hover:scale-90'
                    title='back'
                    >
                        <IoIosArrowBack size={30}/>
                    </div>
                    <IconBtn 
                        text="Add Review"
                        onClick={() => setReviewModal(true)}
                        customClasses="ml-auto"
                    />
                </div>
                {/* for heading or title */}
                <div className='flex flex-col'>
                    <p>{courseEntireData?.courseName}</p>
                    <p className='text-sm font-semibold text-richblack-500'>
                        {completedLectures?.length} / {totalNoOfLectures}
                    </p>
                </div>
            </div>

            {/* for sections and subSections */}
            <div className='h-[calc(100vh - 5rem)] overflow-y-auto'>
                {
                    courseSectionData.map((course, index) => (
                        <div
                            onClick={() => setActiveStatus(course?._id)}
                            key={index}
                            className='mt-2 cursor-pointer text-sm text-richblack-5'
                        >
                            {/* section */}
                            <div className='flex flex-row justify-between bg-richblack-600 px-5 py-4'>
                                <div className='w-[70%] font-semibold'>
                                    {course?.sectionName}
                                </div>
                                {/* add icon here and handle rotate 180 logic */}
                                <div className='flex items-center gap-3'>
                                    <span
                                        className={`${
                                            activeStatus === course?.sectionName
                                                ? "rotate-0"
                                                : "rotate-180"
                                        } transition-all duration-500`}
                                    >
                                        <BsChevronDown/>
                                    </span>
                                </div>
                            </div>

                            {/* Sub Sections */}
                            <div>
                                {
                                    activeStatus === course?._id && (
                                        <div className='transition-[height] duration-500 ease-in-out'>
                                            {
                                                course.subSection.map((topic, index) => (
                                                    <div
                                                    className={`flex gap-5 p-5 ${
                                                        videoBarActive === topic._id
                                                        ? "bg-yellow-200 text-richblack-800"
                                                        : "bg-richblack-900 text-white"
                                                    }`}
                                                    key={index}
                                                    onClick={() => {
                                                        navigate(
                                                            `/view-course/${courseEntireData?._id}/section/${course?._id}/sub-section/${topic?._id}`
                                                        )
                                                        setVideoBarActive(topic?._id);
                                                    }}
                                                    >
                                                        <input
                                                            type='checkbox'
                                                            checked= {completedLectures.includes(topic?._id)}
                                                            onChange={() => {}}
                                                        />
                                                            {topic.title}
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    </>
  )
}

export default VideoDetailsSidebar