import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js"
import React, { useState } from 'react'


const CARD_OPTIONS = {
	iconStyle: "solid",
	style: {
		base: {
			fontWeight: 25,
			fontFamily: "Roboto, Open Sans, Segoe UI, sans-serif",
			fontSize: "16px",
			fontSmoothing: "antialiased",
			":-webkit-autofill": { color: "#green" },
		},
		invalid: {
			iconColor: "#red",
			color: "red"
		}
	}
}

export default function StripePayment() {
    const [success, setSuccess ] = useState(false)
    const stripe = useStripe()
    const elements = useElements()


    const handleSubmit = async (event) => {
        event.preventDefault()
        const {error, paymentMethod} = await stripe.createPaymentMethod({
            type: "card",
            card: elements.getElement(CardElement)
        })


    if(!error) {
        try {
            const payload = {
                dollars: 5,
                cents: 5,
              };
            const p = JSON.stringify(payload);
            fetch('http://localhost:8000/addBalance', {  //add balance endpoint
                method: 'POST',
                credentials: 'include',
                body: p,
              }).then((response) => {
                console.log(response);
                setSuccess(true)
              });

        } catch (error) {
            console.log("Error", error)
        }
    } else {
        console.log(error.message)
    }
}

    return (
        <>
        {!success ? 
        <form onSubmit={handleSubmit}>
            <fieldset className="FormGroup">
                <div className="FormRow">
                    <CardElement options={CARD_OPTIONS}/>
                </div>
            </fieldset>
            <button className="btn btn-primary btn-sm">Pay</button>
        </form>
        :
       <div>
           <h2>Funds have been added to your account!</h2>
       </div> 
        }
            
        </>
    )
}