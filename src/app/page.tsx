// app/page.tsx
import Image from 'next/image';
import AuthForm from '@/app/components/AuthForm'; // Adjust path if needed

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-center md:justify-between bg-white rounded-xl shadow-2xl overflow-hidden">

          {/* Left Column: Image and Text */}
          <div className="w-full md:w-1/2 p-8 lg:p-12 space-y-6 hidden md:block">
             <div className="relative z-10">
                {/* ... h1 and p tags ... */}
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
                    Your Intelligent Chat Companion
                </h1>
                <p className="text-lg text-gray-600 mb-6">
                    Engage in seamless conversations, get instant answers, and explore the power of AI. Sign up or log in to begin.
                </p>
                {/* --- Image Container --- */}
                {/* Ensure this parent div still has 'relative' */}
                <div className="relative aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-lg">
                    {/* --- MODIFIED IMAGE COMPONENT --- */}
                    <Image
                        src="/photo-1511632765486-a01980e01a18.avif"
                        alt="People collaborating illustration"
                        fill // Use the 'fill' boolean prop instead of layout="fill"
                        className="object-cover" // Use Tailwind class for object-fit
                        priority
                        // Optional but recommended for optimization with fill:
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        // Remove the deprecated props:
                        // layout="fill" (removed)
                        // objectFit="cover" (removed)
                    />
                    {/* --- END MODIFIED IMAGE COMPONENT --- */}
                </div>
                 {/* --- End Image Container --- */}
             </div>
          </div>

          {/* Right Column: Auth Form */}
          <div className="w-full md:w-1/2 flex items-center justify-center p-8 lg:p-12 bg-gray-50 md:bg-white">
            <AuthForm /> {/* This component is fine, the error wasn't here */}
          </div>

        </div>
      </div>
    </main>
  );
}
