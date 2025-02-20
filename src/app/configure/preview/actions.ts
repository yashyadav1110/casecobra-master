'use server'

import { BASE_PRICE, PRODUCT_PRICES } from '@/config/products'
import { db } from '@/db'
import { stripe } from '@/lib/stripe'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { Order } from '@prisma/client'

export const createCheckoutSession = async ({
  configId,
}: {
  configId: string
}) => {
  const configuration = await db.configuration.findUnique({
    where: { id: configId },
  })

  if (!configuration) {
    throw new Error('❌ No such configuration found')
  }

  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if (!user) {
    throw new Error('❌ You need to be logged in')
  }

  console.log('🔍 User ID from session:', user.id)

  // ✅ Ensure the user exists in the database
  let dbUser = await db.user.findUnique({
    where: { id: user.id },
  })

  if (!dbUser) {
    console.log('⚠️ User not found in DB, creating new user...')
    dbUser = await db.user.create({
      data: {
        id: user.id, // Ensure user.id is in the correct format
        email: user.email || '', // Fallback to empty string
      },
    })
  }

  const { finish, material } = configuration

  let price = BASE_PRICE
  if (finish === 'textured') price += PRODUCT_PRICES.finish.textured
  if (material === 'polycarbonate')
    price += PRODUCT_PRICES.material.polycarbonate

  let order: Order | undefined = undefined

  // ✅ Ensure existing order is checked
  const existingOrder = await db.order.findFirst({
    where: {
      userId: dbUser.id,
      configurationId: configuration.id,
    },
  })

  if (existingOrder) {
    order = existingOrder
  } else {
    order = await db.order.create({
      data: {
        amount: price / 100,
        userId: dbUser.id, // ✅ Ensure userId references an existing user
        configurationId: configuration.id,
      },
    })
  }

  const product = await stripe.products.create({
    name: 'Custom iPhone Case',
    images: [configuration.imageUrl],
    default_price_data: {
      currency: 'INR',
      unit_amount: price,
    },
  })

  const stripeSession = await stripe.checkout.sessions.create({
    success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/thank-you?orderId=${order.id}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/configure/preview?id=${configuration.id}`,
    payment_method_types: ['card', 'paypal'],
    mode: 'payment',
    shipping_address_collection: { allowed_countries: ['DE', 'US'] },
    metadata: {
      userId: dbUser.id,
      orderId: order.id,
    },
    line_items: [{ price: product.default_price as string, quantity: 1 }],
  })

  return { url: stripeSession.url }
}
