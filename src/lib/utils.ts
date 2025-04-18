import { type ClassValue, clsx } from 'clsx'
import { Metadata } from 'next'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatPrice = (price: number) => {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  });

  return formatter.format(price);
};
export function constructMetadata({
  title = 'CaseCrafters - custom high-quality phone cases',
  description = 'Create custom high-quality phone cases in seconds',
  image = 'C:/CopyCasecrafters/casecrafters/public/logo.png',
  // icons = '/favicon.ico',
}: {
  title?: string
  description?: string
  image?: string
  icons?: string
} = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@yashyadav11',
    },
  
    metadataBase: new URL("https://casecobra.vercel.app/")
  }
}
