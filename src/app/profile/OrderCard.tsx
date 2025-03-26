'use client'

import Phone from '@/components/Phone'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { MODELS } from '@/validators/option-validator'
import { Order } from '@prisma/client'
import { ChevronRight, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const OrderStatusBadge = ({ status }: { status: string }) => {
  let bgColor = 'bg-gray-100 text-gray-800'
  
  switch(status) {
    case 'fulfilled':
      bgColor = 'bg-green-100 text-green-800'
      break
    case 'shipped':
      bgColor = 'bg-blue-100 text-blue-800'
      break
    case 'awaiting_shipment':
    default:
      bgColor = 'bg-yellow-100 text-yellow-800'
  }

  const label = status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  
  return (
    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-md ${bgColor}`}>
      {label}
    </span>
  )
}

interface OrderCardProps {
  order: Order & {
    configuration: {
      id: string
      imageUrl: string
      croppedImageUrl: string | null
      model: string
      color: string
      material: string
      finish: string
    }
    shippingAddress: {
      name: string
      street: string
      city: string
      postalCode: string
      country: string
    } | null
  }
}

const OrderCard = ({ order }: OrderCardProps) => {
  const router = useRouter()
  const date = new Date(order.createdAt).toLocaleDateString()

  // Get model label
  const modelOption = MODELS.options.find(m => m.value === order.configuration.model)
  const modelLabel = modelOption ? modelOption.label : order.configuration.model

  const handleViewDetails = () => {
    router.push(`/profile/orders/${order.id}`)
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors">
      <div className="flex flex-col sm:flex-row gap-4 p-4">
        <div className="w-20 h-36 flex-shrink-0 mx-auto sm:mx-0">
          <Phone
            imgSrc={order.configuration.croppedImageUrl || order.configuration.imageUrl}
            className="w-full h-full"
          />
        </div>
        
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <h3 className="font-medium">
                {modelLabel} Case
              </h3>
              <OrderStatusBadge status={order.status} />
            </div>
            
            <p className="text-sm text-gray-500 mt-1">Order ID: {order.id.slice(0, 8)}...</p>
            <p className="text-sm text-gray-500">Placed on {date}</p>
            
            {order.shippingAddress && (
              <div className="mt-2 text-sm">
                <p className="text-gray-700">Ship to: {order.shippingAddress.name}</p>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <span className="font-medium">
              {formatPrice(order.amount / 100)}
            </span>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleViewDetails}
              className="text-purple-600 hover:text-purple-800"
            >
              View details
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderCard
