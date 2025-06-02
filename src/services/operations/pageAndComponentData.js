import {toast} from "react-hot-toast"
import {apiConnector} from "../apiconnector";
import { catalogData } from "../apis"

export const getCatalogaPageData = async(categoryId) => {
    const toastId = toast.loading("Loading...");
    let result = []
    try{
        console.log(categoryId) 
        const response = await apiConnector("POST", catalogData.CATALOGPAGEDATA_API,
            {categoryId: categoryId,}
        );

        if(!response?.data?.success){
            throw new Error("Could Not Fetch Category Page Data");
        }
        result = response?.data;
    }
    catch(error){
        console.log("CATALOG PAGE DATA API ERROR.....", error);
        toast.error(error.message);
        result = error.response?.data;
    }
    toast.dismiss(toastId);
    return result;
}
