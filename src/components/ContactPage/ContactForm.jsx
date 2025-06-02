import React, { useEffect, useState } from 'react'
import {useForm} from "react-hook-form"
import { apiConnector } from '../../services/apiconnector';
import { contactusEndpoint } from '../../services/apis';
import CountryCode from "../../data/countrycode.json"

const ContactUsForm = () => {

    const [loading, setLoading] = useState(false);
    const {
        register,
        handleSubmit,
        reset,
        formState: {errors, isSubmitSuccessful}
    } = useForm();

    const submitContactForm = async(data) => {
        try{
            setLoading(true);
            // const response = await apiConnector("POST", contactusEndpoint.CONTACT_US_API, data);
            const response = {status: "OK"};
            console.log("Logging response", response);
            setLoading(false);

        }
        catch(error){
            console.log("Error:",error.message);
            setLoading(false);
        }
    }

    useEffect ( () => {
        if(isSubmitSuccessful){
            reset({
                email:"",
                firstname:"",
                lastname:"",
                message:"",
                phoneNo:"",
            })
        }
    },[reset, isSubmitSuccessful]);

    return(
        <form onSubmit={handleSubmit(submitContactForm)}>
            <div className='flex gap-5'>
                {/* FirstName */}
                <div className='flex flex-col'>
                    <label htmlFor='firstname'>First Name</label>
                    <input
                        type='text'
                        name='firstname'
                        id='firstname'
                        placeholder='Enter first name'
                        className='text-black'
                        {...register("firstname", {required:true})}
                    />
                    {
                        errors.firstname && (
                            <span>
                                Please Enter Your Name
                            </span>
                        )
                    }
                </div>

                {/* LastName */}
                <div className='flex flex-col'>
                    <label>Last Name</label>
                    <input
                        type='text'
                        name='lastname'
                        id='lastname'
                        className='text-black'
                        placeholder='Enter Last name'
                        {...register("lastname")}
                    />

                </div>

            </div>

            {/* Email */}
            <div className='flex flex-col'>
                    <label htmlFor='email'>Email Address</label>
                    <input
                        type='email'
                        name='email'
                        id='email'
                        placeholder='Enter email Address'
                        className='text-black'
                        {...register("email", {required:true})}
                    />
                    {
                        errors.email &&(
                            <span>
                                Please enter your email address
                            </span>
                        )
                    }
            </div>

            {/* PhoneNo */}
            <div className='flex flex-col'>
                    <label htmlFor='email'>
                        Email Address
                    </label>
                    <input
                        type=''
                    />

            </div>

        </form>
    )
}

export default ContactUsForm;