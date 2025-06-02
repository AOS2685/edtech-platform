import * as Icons from "react-icons/vsc"
import { useDispatch } from "react-redux";
import { NavLink, matchPath, useLocation } from "react-router-dom";

import { resetCourseState } from "../../../slices/courseSlice"

export default function SidebarLink({link, iconName}) {

    const Icon = Icons[iconName];
    const location = useLocation();
    const dispatch = useDispatch();

    const matchRoute = (route) => {
        return matchPath({path:route}, location.pathname);
    }

    return(
        <NavLink
        to={link.path}
        onClick={() => dispatch(resetCourseState())}
        className={`relative px-8 py-2 text-sm font-medium
         ${
            matchRoute(link.path) 
            ? "bg-yellow-800 text-yellow-50"
            : "bg-opacity-0 text-richblack-300"}
             transition-all duration-200`}
        >
            <span className={`absolute left-0 top-0 h-full bg-yellow-50 w-[0.15rem]
             ${matchRoute(link.path) ? "opacity-100" : "opacity-0"}`}>
            </span>

            <div className="flex items-center gap-x-2">
            {/* Icons Goes Here */}
                <Icon className="text-lg"/>
                <span>{link.name}</span>
            </div>
        </NavLink>
    )
}
