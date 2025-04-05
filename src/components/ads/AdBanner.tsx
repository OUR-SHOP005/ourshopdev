import { useState, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { IAd } from "@/lib/types";
import {
  useTrackImpression,
  useTrackClick,
} from "@/lib/api/services/adService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

interface AdBannerProps {
  ad: IAd | null;
  onClose: () => void;
}

export function AdBanner({ ad, onClose }: AdBannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { mutate: trackImpression } = useTrackImpression();
  const { mutate: trackClick } = useTrackClick();

  useEffect(() => {
    // If ad exists, show the banner and track impression
    if (ad) {
      setIsOpen(true);
      trackImpression(ad._id as string);
    }
  }, [ad, trackImpression]);

  const handleClickCTA = () => {
    // Track click before navigating to CTA URL
    if (ad) {
      trackClick(ad._id as string);
      // Open in new tab
      window.open(ad.cta_url, "_blank");
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    // Notify parent that ad was closed
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation to complete
  };

  // Handle click outside the ad
  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking directly on the backdrop, not the card itself
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!ad || !isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all'
          onClick={handleOutsideClick}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className='w-full max-w-md sm:max-w-lg md:max-w-xl'
          >
            <Card className='overflow-hidden shadow-2xl border-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur'>
              <div className='relative'>
                {/* Close button */}
                <button
                  onClick={handleClose}
                  className='absolute right-3 top-3 rounded-full bg-black/50 hover:bg-red-500 p-1.5 text-white shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-400 z-10'
                  aria-label='Close advertisement'
                >
                  <X className='h-4 w-4' />
                </button>

                {/* Ad image */}
                <div className='relative h-52 sm:h-64 w-full'>
                  <Image
                    src={ad.image}
                    alt={ad.title}
                    fill
                    className='object-cover transition-transform hover:scale-105 duration-700'
                    sizes='(max-width: 640px) 100vw, (max-width: 768px) 80vw, 60vw'
                    priority
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-70'></div>
                </div>

                <CardContent className='p-5 sm:p-6'>
                  <h3 className='text-xl sm:text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100'>
                    {ad.title}
                  </h3>

                  <div className='flex flex-col sm:flex-row gap-3 sm:items-center'>
                    <Button
                      onClick={handleClickCTA}
                      className='w-full sm:flex-1 py-5 text-base font-medium transition-all hover:scale-[1.02] active:scale-[0.98]'
                      variant='default'
                    >
                      Learn More
                    </Button>
                    <Button
                      onClick={handleClose}
                      className='w-full sm:w-auto py-5 text-base font-medium'
                      variant='outline'
                    >
                      Not Now
                    </Button>
                  </div>

                  <p className='text-xs text-gray-500 dark:text-gray-400 mt-4 text-center'>
                    Sponsored content
                  </p>
                </CardContent>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
