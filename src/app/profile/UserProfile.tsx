'use client'

import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { KindeUser } from '@kinde-oss/kinde-auth-nextjs/server'
import { Order, User } from '@prisma/client'
import { Package, User as UserIcon, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import OrderCard from './OrderCard'

interface UserProfileProps {
  user: User & {
    orders: (Order & {
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
    })[]
  }
  kindeUser: KindeUser
}

const UserProfile = ({ user, kindeUser }: UserProfileProps) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile')

  return (
    <div className="py-10">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar navigation */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white shadow rounded-md overflow-hidden">
            <button 
              className={`w-full text-left px-4 py-3 flex items-center gap-2 hover:bg-gray-50 transition-colors ${activeTab === 'profile' ? 'bg-gray-100 font-medium' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <UserIcon className="h-5 w-5" />
              Profile Information
            </button>
            <button 
              className={`w-full text-left px-4 py-3 flex items-center gap-2 hover:bg-gray-50 transition-colors ${activeTab === 'orders' ? 'bg-gray-100 font-medium' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <Package className="h-5 w-5" />
              Order History
              <span className="ml-auto bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full text-xs">
                {user.orders.length}
              </span>
            </button>
          </div>
        </div>
        
        {/* Main content area */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-medium mb-4">Profile Information</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{kindeUser.given_name} {kindeUser.family_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="pt-4">
                  <Link href="/api/auth/logout">
                    <Button variant="outline">Sign out</Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'orders' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-medium mb-4">Order History</h2>
              
              {user.orders.length === 0 ? (
                <div className="text-center py-10">
                  <div className="bg-gray-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium">No orders yet</h3>
                  <p className="text-gray-500 mt-1">When you place orders, they will appear here.</p>
                  <div className="mt-6">
                    <Link href="/configure/upload">
                      <Button>Create your first case</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {user.orders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserProfile
