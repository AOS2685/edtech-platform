import { toast } from "react-hot-toast";
import { studentEndpoints } from "../apis"
import { apiConnector } from "../apiconnector";
import rzpLogo from "../../assets/Logo/rzp_logo.png"
import { setPaymentLoading } from "../../slices/courseSlice";
import { resetCart } from "../../slices/cartSlice"

const {
    COURSE_PAYMENT_API, 
    COURSE_VERIFY_API, 
    SEND_PAYMENT_SUCCESS_EMAIL_API } = studentEndpoints;

// Load the RazorPay SDK from the CDN
function loadScript(src) {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = src;

        script.onload = () => {
            resolve(true);
        }
        script.onerror = () => {
            resolve(false);
        }
        document.body.appendChild(script);
    })
}

export async function buyCourse(token, courses, userDetails, navigate, dispatch){
    const toastId = toast.loading("Loading...");
    try{
        // Load the script
        const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

        if(!res){
            toast.error("RazorPay SDK failed to load. Check your Intenet Connection");
            return;
        }

        // Initiate the order (Capture Payment)
        const orderResponse = await apiConnector("POST", COURSE_PAYMENT_API, {courses},
            {
                Authorization: `Bearer ${token}`,
            }
        )

        if(!orderResponse.data.success){
            throw new Error(orderResponse.data.message);
        }
        console.log("PRINTING orderResponse", orderResponse);
        // Options
        let options = {
            // key: process.env.RAZORPAY_KEY,
            key: process.env.REACT_APP_RAZORPAY_KEY,
            // currency: orderResponse.data.message.currency,
            currency: orderResponse.data.data.currency,
            // amount: `${orderResponse.data.message.amount}`,
            amount: `${orderResponse.data.data.amount}`,
            // order_id: orderResponse.data.message.id,
            order_id: orderResponse.data.data.id,
            name:"StudyNotion",
            description: "Thank You for Purchasing the Course",
            image:rzpLogo,
            prefill: {
                name: `${userDetails.firstName} ${userDetails.lastName}`,
                email: userDetails.email,
            },
            handler: function(response){
                // Send successful wala mail
                // sendPaymentSuccessEmail(response, orderResponse.data.message.amount, token);
                sendPaymentSuccessEmail(response, orderResponse.data.data.amount, token);
                // Verify Payment
                verifyPayment({...response, courses}, token, navigate, dispatch);
            }
        }
        console.log("Razorpay Key:", process.env.REACT_APP_RAZORPAY_KEY);

        // In case Payment get cancel(Miss ho gaya)
        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
        paymentObject.on("payment.failed", function (response) {
            toast.error("oops, Payment failed");
            console.log(response.error);
        })
    }
    catch(error){
        console.log("PAYMENT API ERROR....", error);
        toast.error("Could not make Payment");
    }
    toast.dismiss(toastId);
}

async function sendPaymentSuccessEmail(response, amount, token){
    try{
        await apiConnector("POST", SEND_PAYMENT_SUCCESS_EMAIL_API, {
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            amount,
        }, {
            Authorization: `Bearer ${token}`
        })
    }
    catch(error){
        console.log("PAYMENT SUCCESS EMAIL ERROR....", error);
    }
}

// Verify Payment
async function verifyPayment(bodyData, token, navigate, dispatch) {
    const toastId = toast.loading("Verify Payment....");
    dispatch(setPaymentLoading(true));
    try{
        const response = await apiConnector("POST", COURSE_VERIFY_API, bodyData, {
            Authorization: `Bearer ${token}`,
        })
        console.log("VERIFY PAYMENT RESPONSE FROM BACKEND.......", response)

        if(!response.data.success){
            throw new Error(response.data.message);
        }
        toast.success("Payment Successful, you are added to the course");
        navigate("/dashboard/enrolled-courses");
        dispatch(resetCart());
    }
    catch(error){
        console.log("PAYMENT VERIFY ERROR...",error);
        toast.error("Could not verify Payment");
    }
    toast.dismiss(toastId);
    dispatch(setPaymentLoading(false));
}