import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { buttonVariants } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <MaxWidthWrapper>
      <div className='py-20 text-center'>
        <h2 className='text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl'>Order not found</h2>
        <p className='mt-4 text-lg text-gray-600'>
          We couldn't find the order you're looking for.
        </p>
        <div className='mt-10'>
          <Link
            href='/profile'
            className={buttonVariants({
              className: 'mx-auto',
            })}>
            <ArrowLeft className='mr-2 h-5 w-5' />
            Back to profile
          </Link>
        </div>
      </div>
    </MaxWidthWrapper>
  )
}
