import { useState, useEffect } from 'react';
import { useStripe} from '@stripe/react-stripe-js';

export const usePaymentRequest = ({ options, onPaymentMethod, onShippingAddressChange, onShippingOptionChange, onCancel }) => {
  
    const stripe = useStripe()
    const [paymentRequest, setPaymentRequest] = useState(null);
    const [availableMethods, setAvailableMethods] = useState(null);
  
    useEffect(() => {
      if (stripe && paymentRequest === null) {
        const pr = stripe.paymentRequest(options)
        setPaymentRequest(pr)
      }
      if (paymentRequest && !paymentRequest.isShowing()) {
        paymentRequest.update({
          currency: options?.currency,
          displayItems: options.displayItems,
          shippingOptions: options?.shippingOptions,
          total: options?.total,
        })
      }
    }, [stripe, options, paymentRequest])
  
    useEffect(() => {
      let subscribed = true
      if (paymentRequest) {
        paymentRequest.canMakePayment().then((res) => {
          if (res && subscribed) {
            setAvailableMethods(res)
          }
        })
      } else {
        setAvailableMethods(null)
      }
  
      return () => {
        subscribed = false
      }
    }, [paymentRequest])
  
    useEffect(() => {
      if (paymentRequest) {
        paymentRequest.on('paymentmethod', onPaymentMethod)
      }
      return () => {
        if (paymentRequest) {
          paymentRequest.off('paymentmethod', onPaymentMethod)
        }
      }
    }, [paymentRequest, onPaymentMethod])
  
    useEffect(() => {
      if (paymentRequest && onShippingAddressChange) {
        paymentRequest.on('shippingaddresschange', onShippingAddressChange)
      }
      return () => {
        if (paymentRequest) {
          paymentRequest.off('shippingaddresschange', onShippingAddressChange)
        }
      }
    }, [paymentRequest, onShippingAddressChange])
  
    useEffect(() => {
      if (paymentRequest && onShippingOptionChange) {
        paymentRequest.on('shippingoptionchange', (e) => onShippingOptionChange(e, paymentRequest))
      }
      return () => {
        if (paymentRequest) {
          paymentRequest.off('shippingoptionchange', onShippingOptionChange)
        }
      }
    }, [paymentRequest, onShippingOptionChange])
  
    useEffect(() => {
      if (paymentRequest && onCancel) {
        paymentRequest.on('cancel', onCancel)
      }
      return () => {
        if (paymentRequest) {
          paymentRequest.off('cancel', onCancel)
        }
      }
    }, [paymentRequest, onCancel])
    
    const reInitialize = (params) => {
        if (!stripe) return
        const pr = stripe.paymentRequest(params)
        setPaymentRequest(pr)
    }

    return { paymentRequest, availableMethods, reInitialize }
}