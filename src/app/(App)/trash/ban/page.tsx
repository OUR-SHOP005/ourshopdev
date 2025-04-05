import { AlertCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function BannedPage() {
  return (
    <div className='w-full min-h-[80vh] flex flex-col items-center justify-center px-4'>
      <div className='max-w-md w-full bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden'>
        <div className='p-5 sm:p-8'>
          <div className='flex justify-center mb-6'>
            <div className='relative w-32 h-32 sm:w-40 sm:h-40'>
              <Image
                src='/images/banned.svg'
                alt='Account Banned'
                fill
                className='object-contain'
                priority
              />
            </div>
          </div>

          <div className='text-center mb-8'>
            <div className='inline-flex items-center justify-center bg-red-100 dark:bg-red-900/30 p-2 rounded-full mb-4'>
              <AlertCircle className='h-8 w-8 text-red-600 dark:text-red-400' />
            </div>
            <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2'>
              Account Suspended
            </h1>
            <p className='text-gray-600 dark:text-gray-300 mb-4'>
              Your account has been suspended due to violations of our terms of
              service.
            </p>
            <div className='bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-sm text-left mb-6'>
              <p className='font-medium text-gray-900 dark:text-white mb-2'>
                Possible reasons for suspension:
              </p>
              <ul className='list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1'>
                <li>Sharing prohibited content</li>
                <li>Harassment or abusive behavior</li>
                <li>Multiple violations of community guidelines</li>
                <li>Suspicious or fraudulent activity</li>
              </ul>
            </div>
          </div>

          <div className='flex flex-col sm:flex-row gap-3 text-center'>
            <Link
              href='/support'
              className='px-4 py-2 w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md transition font-medium'
            >
              Contact Support
            </Link>
            <Link
              href='/'
              className='px-4 py-2 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md transition font-medium'
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>

      <p className='mt-8 text-sm text-gray-500 dark:text-gray-400 max-w-md text-center'>
        If you believe this is a mistake, please contact our support team for
        assistance with your account.
      </p>
    </div>
  );
}
