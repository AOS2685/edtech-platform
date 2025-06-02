import { useEffect } from "react";

// We know that the hooks detect clicks ouside of the specified component and calls
// the provided handler function
export default function useOnClickOutside(ref, handler){
    useEffect( () => {
        // Listener Function is defined and is to be called on click/touch events 
        const listener = (event) =>{
            // If the click/touch event originated inside the ref element, do nothing
            if(!ref.current || ref.current.contains(event.target)) {
                return;
            }
            // Otherwise call the provided handler function
            handler(event);
        };

        // Add event Listeners for mousedown & touchstart events on the document
        document.addEventListener("mousedown", listener);
        document.addEventListener("touchstart", listener);

        // Cleanup function to remove the event listeners when the component unmounts
        // or when the ref/handler dependencies  change
        return () => {
            document.removeEventListener("mousedown", listener);
            document.removeEventListener("touchstart", listener);
        };
        // Only run this efect when the ref or handler function changes
    }, [ref, handler]);
}