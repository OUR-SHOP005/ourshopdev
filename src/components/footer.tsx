"use client";

import { useCompanyInfo } from "@/lib/api/services/companyService";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import {
  Link as LucideLinkIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  Linkedin as LinkedinIcon,
  Github as GithubIcon,
} from "lucide-react";
import { memo } from "react";
import { ISocialLink } from "@/lib/types";

const quickLinks = [
  { name: "Home", path: "/home" },
  { name: "About", path: "/about" },
  { name: "portfolios", path: "/portfolios" },
  { name: "Blog", path: "/blog" },
  { name: "Contact", path: "/contact" },
];

const getSocialIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case "facebook":
      return <FacebookIcon className='h-4 w-4' />;
    case "twitter":
      return <TwitterIcon className='h-4 w-4' />;
    case "instagram":
      return <InstagramIcon className='h-4 w-4' />;
    case "linkedin":
      return <LinkedinIcon className='h-4 w-4' />;
    case "github":
      return <GithubIcon className='h-4 w-4' />;
    default:
      return <LucideLinkIcon className='h-4 w-4' />;
  }
};

// Memoize components that don't need frequent re-rendering
const QuickLinksSection = memo(function QuickLinksSection() {
  return (
    <div className='md:col-span-3'>
      <h4 className='font-semibold text-foreground mb-4'>Quick Links</h4>
      <ul className='space-y-2'>
        {quickLinks.map((link) => (
          <motion.li
            className='list-image-none'
            key={link.name}
            whileHover={{ x: 3 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Link
              href={link.path}
              className='hover:text-primary transition-colors duration-200 flex items-center'
            >
              <span className='h-1 w-1 bg-primary rounded-full mr-2 opacity-70'></span>
              {link.name}
            </Link>
          </motion.li>
        ))}
      </ul>
    </div>
  );
});

// Optimize copyright section
const CopyrightSection = memo(function CopyrightSection() {
  return (
    <div className='pt-6 border-t border-border/30 text-center'>
      <p className='text-xs opacity-70'>
        © {new Date().getFullYear()}{" "}
        <span className='font-medium'>OurShop</span>. All rights reserved.
      </p>
    </div>
  );
});

function Footer() {
  const { data: companyInfo, isLoading } = useCompanyInfo();

  return (
    <footer className='border-t border-border/40 bg-background/50 backdrop-blur-sm py-12 text-sm text-muted-foreground'>
      <div className='container mx-auto px-4'>
        <div className='grid grid-cols-1 md:grid-cols-12 gap-8 mb-8'>
          {/* Left Section: Name and Bio */}
          <div className='md:col-span-5 space-y-4'>
            {isLoading ? (
              <>
                <Skeleton className='h-7 w-48 mb-3' />
                <Skeleton className='h-4 w-full max-w-md mb-1' />
                <Skeleton className='h-4 w-3/4 max-w-sm' />
              </>
            ) : companyInfo ? (
              <>
                {companyInfo.company_name && (
                  <h3 className='font-bold text-lg bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent'>
                    {companyInfo.company_name}
                  </h3>
                )}
                {companyInfo.description && (
                  <p className='text-sm leading-relaxed max-w-md'>
                    {companyInfo.description}
                  </p>
                )}
              </>
            ) : (
              <p>Information not available.</p>
            )}
            <p className='text-xs opacity-70 md:hidden'>
              <span className='font-medium'>
                Interested in advertising on this website?{" "}
                <a
                  href={`${process.env.NEXT_PUBLIC_BASE_URL}/contact`}
                  className='text-primary hover:underline transition-colors'
                >
                  Contact me
                </a>{" "}
                for partnership opportunities
              </span>
              .
            </p>
          </div>

          {/* Middle Section: Quick Links - Now Memoized */}
          <QuickLinksSection />

          {/* Right Section: Follow Me and Social Links */}
          <div className='md:col-span-4'>
            <h4 className='font-semibold text-foreground mb-4'>Connect</h4>
            <div className='space-y-2'>
              {isLoading ? (
                <>
                  <Skeleton className='h-6 w-32 mb-2' />
                  <Skeleton className='h-6 w-40 mb-2' />
                  <Skeleton className='h-6 w-36' />
                </>
              ) : companyInfo?.socialLinks &&
                companyInfo.socialLinks.length > 0 ? (
                <div className='flex flex-wrap gap-3'>
                  {companyInfo.socialLinks.map((link: ISocialLink) => (
                    <motion.div
                      key={link.url}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        href={link.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='inline-flex items-center gap-2 px-3 py-2 rounded-full bg-muted hover:bg-muted/80 transition-colors'
                        aria-label={link.name || link.platform}
                      >
                        <span className='text-primary'>
                          {getSocialIcon(link.platform)}
                        </span>
                        <span className='text-xs font-medium'>
                          {link.name || link.platform}
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p>Social links not available.</p>
              )}
            </div>
          </div>
        </div>
        <div className='flex justify-center items-center hidden md:block'>
          <p className='text-xs opacity-70 md:hidden'>
            <span className='font-medium'>
              Interested in advertising on this website?{" "}
              <a
                href='https://utkarshchaudhary.space/contact'
                className='text-primary hover:underline transition-colors'
              >
                Contact me
              </a>{" "}
              for partnership opportunities
            </span>
            .
          </p>
        </div>
        {/* Bottom Section: Copyright - Now Memoized */}
        <CopyrightSection />
      </div>
    </footer>
  );
}

export default memo(Footer);
