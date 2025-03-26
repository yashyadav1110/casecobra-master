'use client'

import { useQuery } from '@tanstack/react-query'
import { getPaymentStatus } from './actions'
import { useSearchParams } from 'next/navigation'
import { Download, Loader2 } from 'lucide-react'
import PhonePreview from '@/components/PhonePreview'
import { formatPrice } from '@/lib/utils'
import { useRef, useState } from 'react'
import { generatePDF } from './utils/pdfGenerator'

const ThankYou = () => {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId') || ''
  const receiptRef = useRef<HTMLDivElement>(null)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const { data } = useQuery({
    queryKey: ['get-payment-status'],
    queryFn: async () => await getPaymentStatus({ orderId }),
    retry: true,
    retryDelay: 500,
  })

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return
    
    setIsGeneratingPDF(true)
    
    try {
      await generatePDF(receiptRef.current, orderId);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('There was an issue generating your receipt. Please try again later.');
    } finally {
      setIsGeneratingPDF(false);
    }
  }

  if (data === undefined || data === false) {
    return (
      <div className='w-full mt-24 flex justify-center'>
        <div className='flex flex-col items-center gap-2'>
          <Loader2 className='h-8 w-8 animate-spin text-zinc-500' />
          <h3 className='font-semibold text-xl'>
            {data === undefined ? 'Loading your order...' : 'Verifying your payment...'}
          </h3>
          <p>{data === undefined ? "This won't take long." : 'This might take a moment.'}</p>
        </div>
      </div>
    )
  }
  
  const { configuration, billingAddress, shippingAddress, amount } = data
  const { color } = configuration

  return (
    <div className='bg-white relative'>
      <button
        onClick={handleDownloadPDF}
        disabled={isGeneratingPDF}
        className={`absolute top-4 right-4 flex items-center gap-2 ${
          isGeneratingPDF ? 'bg-gray-400 cursor-wait' : 'bg-primary hover:bg-primary/90'
        } text-white py-2 px-4 rounded-md transition-colors`}
      >
        {isGeneratingPDF ? (
          <Loader2 className='h-4 w-4 animate-spin' />
        ) : (
          <Download className='h-4 w-4' />
        )}
        <span>{isGeneratingPDF ? 'Generating...' : 'Download Receipt'}</span>
      </button>
      
      <div 
        ref={receiptRef} 
        className='mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8'
        data-pdf-content
      >
        <div className='max-w-xl'>
          <p className='text-base font-medium text-primary'>Thank you!</p>
          <h1 className='mt-2 text-4xl font-bold tracking-tight sm:text-5xl'>
            Your case is on the way!
          </h1>
          <p className='mt-2 text-base text-zinc-500'>
            We've received your order and are now processing it.
          </p>

          <div className='mt-12 text-sm font-medium'>
            <p className='text-zinc-900'>Order number</p>
            <p className='mt-2 text-zinc-500'>{orderId}</p>
          </div>
        </div>

        <div className='mt-10 border-t border-zinc-200'>
          <div className='mt-10 flex flex-auto flex-col'>
            <h4 className='font-semibold text-zinc-900'>
              You made a great choice!
            </h4>
            <p className='mt-2 text-sm text-zinc-600'>
              We at CaseCrafters believe that a phone case doesn't only need to
              look good, but also last you for the years to come. We offer a
              5-year print guarantee: If you case isn't of the highest quality,
              we'll replace it for free.
            </p>
          </div>
        </div>

        <div className='flex space-x-6 overflow-hidden mt-4 rounded-xl bg-gray-900/5 ring-1 ring-inset ring-gray-900/10 lg:rounded-2xl'>
          <PhonePreview
            croppedImageUrl={configuration.croppedImageUrl!}
            color={color!}
          />
        </div>

        <div>
          <div className='grid grid-cols-2 gap-x-6 py-10 text-sm'>
            <div>
              <p className='font-medium text-gray-900'>Shipping address</p>
              <div className='mt-2 text-zinc-700'>
                <address className='not-italic'>
                  <span className='block'>{shippingAddress?.name}</span>
                  <span className='block'>{shippingAddress?.street}</span>
                  <span className='block'>
                    {shippingAddress?.postalCode} {shippingAddress?.city}
                  </span>
                </address>
              </div>
            </div>
            <div>
              <p className='font-medium text-gray-900'>Billing address</p>
              <div className='mt-2 text-zinc-700'>
                <address className='not-italic'>
                  <span className='block'>{billingAddress?.name}</span>
                  <span className='block'>{billingAddress?.street}</span>
                  <span className='block'>
                    {billingAddress?.postalCode} {billingAddress?.city}
                  </span>
                </address>
              </div>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-x-6 border-t border-zinc-200 py-10 text-sm'>
            <div>
              <p className='font-medium text-zinc-900'>Payment status</p>
              <p className='mt-2 text-zinc-700'>Paid</p>
            </div>

            <div>
              <p className='font-medium text-zinc-900'>Shipping Method</p>
              <p className='mt-2 text-zinc-700'>
                DHL, takes up to 3 working days
              </p>
            </div>
          </div>
        </div>

        <div className='space-y-6 border-t border-zinc-200 pt-10 text-sm'>
          <div className='flex justify-between'>
            <p className='font-medium text-zinc-900'>Total</p>
            <p className='text-zinc-700'>{formatPrice(amount/100)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ThankYou
