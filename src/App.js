// This example shows you how to set up React Stripe.js and use Elements.
// Learn how to accept a payment with the PaymentRequestButton using the official Stripe docs.
// https://stripe.com/docs/stripe-js/elements/payment-request-button#react

import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { usePaymentRequest } from './PaymentRequest';
import './styles/common.css';

const STRIPE_PUBLISHABLE_KEY = `${process.env.REACT_APP_STRIPE_PUB_KEY}`

const options = {
  currency: 'aud',
  country: 'AU',
  requestPayerEmail: true,
  requestPayerName: true,
  requestShipping: true,
  requestPayerPhone: true,
  shippingOptions: [],
  total: {
    label: 'Demo Payment',
    amount: 1000,
    pending: true,
  },
}

const shippingAddressObj = {
  status: 'success',
  total: {
    label: 'Grand Total',
    amount: 1300,
  },
  displayItems: [
    {
      amount: 300,
      label: 'Shipping Charge',
    },
    {
      amount: 1000,
      label: 'Sub total',
    },
    {
      amount: 1300,
      label: 'Grand Total',
    },
  ],
  shippingOptions: [
    {
      id: 'shipping_amount',
      amount: 300,
      label: 'Shipping Charge',
      detail: 'Standard Shipping Charges',
    },
  ],
}

const CheckoutForm = () => {

  const onPaymentMethod = async (e) => {
    // eslint-disable-next-line no-console
    console.log('[onPaymentMethod]', e)
    const { complete } = e
    complete('success')
  }
  
  const onShippingAddressChange = (e) => {
    // eslint-disable-next-line no-console
    console.log('[onShippingAddressChange]', e)
  
    // simulate API update for shipping charges
    e.updateWith(shippingAddressObj)
  }

  // This potentially fixes the issue by setting the shipping options back
  const onShippingOptionChange = (e) => {  
    console.log('[onShippingOptionsChange]', e)
    e.updateWith({
      status: 'success',
      shippingOptions: [
        {
          ...shippingAddressObj.shippingOptions[0],
          // doesn't work if you don't change one of the following
          // id: 'shipping_amount', // either change this
          // amount: 300, // or change this
        },
      ],
    })
  }
  
  const { availableMethods, paymentRequest, reInitialize } = usePaymentRequest({
    options,
    onPaymentMethod,
    onShippingAddressChange,
    onShippingOptionChange,
    onCancel: () => reInitialize(options),
  })

  const handleClick = () => {
    paymentRequest.show()
  }

  return (
    <form>
      {availableMethods && (
          <button
            type="button"
            className="btn btn-outline-dark"
            onClick={handleClick}
          >
            Google Pay
          </button>
        )
      }
    </form>
  );
};

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

const App = () => {

  return (
    <Elements stripe={stripePromise}>
      {
        window.location.href !== "http://localhost:3000/" && (
          <CheckoutForm />
        )
      }
      {
        window.location.href === "http://localhost:3000/" && (
          <h1> Needs HTTPS </h1>
        )
      }
    </Elements>
  );
};

export default App;
