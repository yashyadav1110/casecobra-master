'use client'

import Phone from '@/components/Phone'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { COLORS, MODELS } from '@/validators/option-validator'
import { BillingAddress, Configuration, Order, ShippingAddress } from '@prisma/client'
import { ArrowLeft, Check, Truck } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface OrderDetailsProps {
  order: Order & {
    configuration: Configuration
    shippingAddress: ShippingAddress | null
    billingAddress: BillingAddress | null
  }
}

const OrderDetails = ({ order }: OrderDetailsProps) => {
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  
  const { configuration, shippingAddress, billingAddress } = order
  const modelOption = MODELS.options.find(m => m.value === configuration.model)
  const modelLabel = modelOption ? modelOption.label : configuration.model
  
  const colorOption = COLORS.find(c => c.value === configuration.color)
  const tw = colorOption?.tw || 'bg-black'
  
  // Show estimated delivery date (7 days from order date)
  const estimatedDelivery = new Date(order.createdAt)
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 7)
  const estimatedDeliveryString = estimatedDelivery.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="py-10">
      <Link href="/profile" className="inline-flex items-center text-sm text-purple-600 hover:text-purple-800 mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to profile
      </Link>
      
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {/* Order Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Order Details</h1>
              <p className="text-gray-500 mt-1">Order #{order.id}</p>
            </div>
            <div className={cn(
              "mt-4 sm:mt-0 px-3 py-1.5 text-sm font-medium rounded-full",
              {
                "bg-yellow-100 text-yellow-800": order.status === "awaiting_shipment",
                "bg-blue-100 text-blue-800": order.status === "shipped",
                "bg-green-100 text-green-800": order.status === "fulfilled",
              }
            )}>
              {order.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Placed on {orderDate}
          </div>
        </div>
        
        {/* Order Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Left column - Order summary */}
            <div className="md:col-span-2 space-y-8">
              <section>
                <h2 className="text-lg font-medium mb-4">Order Summary</h2>
                <div className="flex gap-6 border border-gray-200 rounded-lg p-4">
                  <div className="w-20 h-36 flex-shrink-0">
                    <Phone
                      imgSrc={configuration.croppedImageUrl || configuration.imageUrl}
                      className={tw}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{modelLabel} Case</h3>
                    <div className="text-sm text-gray-500 space-y-1 mt-2">
                      <p>Color: {configuration.color}</p>
                      <p>Material: {configuration.material}</p>
                      <p>Finish: {configuration.finish}</p>
                    </div>
                    <div className="mt-4 font-medium">
                      {formatPrice(order.amount / 100)}
                    </div>
                  </div>
                </div>
              </section>
              
              <section>
                <h2 className="text-lg font-medium mb-4">Shipping Information</h2>
                <div className="border border-gray-200 rounded-lg p-4">
                  {shippingAddress ? (
                    <div>
                      <p className="font-medium">{shippingAddress.name}</p>
                      <address className="not-italic text-gray-500 mt-1">
                        <p>{shippingAddress.street}</p>
                        <p>{shippingAddress.city}, {shippingAddress.state || ''} {shippingAddress.postalCode}</p>
                        <p>{shippingAddress.country}</p>
                        {shippingAddress.phoneNumber && <p className="mt-1">{shippingAddress.phoneNumber}</p>}
                      </address>
                    </div>
                  ) : (
                    <p className="text-gray-500">Shipping address not available</p>
                  )}
                </div>
              </section>
              
              {/* Order Timeline - Now showing for all order statuses */}
              <section>
                <h2 className="text-lg font-medium mb-4">
                  {order.status === "fulfilled" ? "Delivery Status" : "Estimated Delivery"}
                </h2>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Truck className="h-5 w-5 text-purple-600 mr-2" />
                    <p>
                      {order.status === "fulfilled" 
                        ? "Your order has been delivered" 
                        : `Estimated delivery by ${estimatedDeliveryString}`}
                    </p>
                  </div>
                  
                  <div className="mt-4">
                    <div className="relative">
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                        <div 
                          className="bg-purple-600 h-full" 
                          style={{ 
                            width: order.status === "awaiting_shipment" ? "25%" : 
                                  order.status === "shipped" ? "75%" : "100%" 
                          }}
                        />
                      </div>
                      
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <div className="flex flex-col items-center">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center ${order.createdAt ? "bg-purple-600" : "bg-gray-300"}`}>
                            <Check className="h-3 w-3 text-white" />
                          </div>
                          <span className="mt-1">Ordered</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center ${order.status !== "awaiting_shipment" ? "bg-purple-600" : "bg-gray-300"}`}>
                            {order.status !== "awaiting_shipment" && <Check className="h-3 w-3 text-white" />}
                          </div>
                          <span className="mt-1">Shipped</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center ${order.status === "fulfilled" ? "bg-purple-600" : "bg-gray-300"}`}>
                            {order.status === "fulfilled" && <Check className="h-3 w-3 text-white" />}
                          </div>
                          <span className="mt-1">Delivered</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
            
            {/* Right column - Payment info */}
            <div>
              <section>
                <h2 className="text-lg font-medium mb-4">Payment Information</h2>
                <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p>Credit Card</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Billing Address</p>
                    {billingAddress ? (
                      <address className="not-italic">
                        <p>{billingAddress.name}</p>
                        <p className="text-gray-500 text-sm mt-1">{billingAddress.street}</p>
                        <p className="text-gray-500 text-sm">{billingAddress.city}, {billingAddress.postalCode}</p>
                        <p className="text-gray-500 text-sm">{billingAddress.country}</p>
                      </address>
                    ) : (
                      <p className="text-gray-500">Billing address not available</p>
                    )}
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    {/* <div className="flex justify-between items-center">
                      <span className="text-gray-500">Subtotal</span>
                      <span>{formatPrice(order.amount / 100)}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-gray-500">Shipping</span>
                      <span>Free</span>
                    </div> */}
                    <div className="flex justify-between items-center mt-2 font-medium">
                      <span>Total</span>
                      <span>{formatPrice(order.amount / 100)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Link href="/configure/upload">
                    <Button className="w-full">Order another case</Button>
                  </Link>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetails
