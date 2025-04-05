"use client";

import { useCompanyInfo } from "@/lib/api/services/companyService";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Github, Linkedin, Twitter, Mail, MapPin } from "lucide-react";
import { useMemo } from "react";

// Map of social platform to icon component
const socialIcons: Record<string, React.ReactNode> = {
  github: <Github className='h-5 w-5' />,
  linkedin: <Linkedin className='h-5 w-5' />,
  twitter: <Twitter className='h-5 w-5' />,
  email: <Mail className='h-5 w-5' />,
};

export default function AboutClient() {
  const { data: companyInfo, isLoading } = useCompanyInfo();

  // Memoize the social links to prevent unnecessary re-renders
  const socialLinks = useMemo(() => {
    if (!companyInfo?.socialLinks) return [];
    return companyInfo.socialLinks.map((link) => ({
      ...link,
      icon: socialIcons[link.platform.toLowerCase()] || null,
    }));
  }, [companyInfo?.socialLinks]);

  if (isLoading) {
    return <AboutSkeleton />;
  }

  if (!companyInfo) {
    return (
      <div className='text-center py-10'>
        <h2 className='text-2xl font-bold'>
          Company information not available
        </h2>
        <p className='mt-4'>Please check back later.</p>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-12 px-4 space-y-12'>
      {/* Company Header */}
      <section className='flex flex-col md:flex-row gap-8 items-center'>
        <div className='flex-1 space-y-4'>
          <h1 className='text-4xl font-bold'>{companyInfo.company_name}</h1>
          <p className='text-xl text-muted-foreground italic'>
            &quot;{companyInfo.tagline}&quot;
          </p>
          <div className='flex items-center text-muted-foreground'>
            <MapPin className='mr-2 h-5 w-5' />
            <span>{companyInfo.location}</span>
                </div>
          <div className='flex gap-3 mt-4'>
            {socialLinks.map((link) => (
              <Link
                href={link.url}
                key={link.platform}
                      target='_blank'
                      rel='noopener noreferrer'
                className='hover:text-primary transition-colors'
              >
                {link.icon || link.name}
              </Link>
            ))}
          </div>
        </div>
        {companyInfo.logo && (
          <div className='relative w-60 h-60'>
            <Image
              src={companyInfo.logo}
              alt={companyInfo.company_name}
              fill
              className='object-contain'
              sizes='(max-width: 768px) 100vw, 240px'
            />
          </div>
        )}
      </section>

      {/* Company Description */}
      <section className='prose prose-lg dark:prose-invert max-w-none'>
        <h2 className='text-3xl font-bold mb-6'>About Us</h2>
        <div className='space-y-4'>
          <p>{companyInfo.description}</p>
        </div>
      </section>

      {/* Story Section */}
      {companyInfo.stories.length > 0 && (
        <section className='space-y-6'>
          <h2 className='text-3xl font-bold'>Our Journey</h2>
          <Accordion
            type='single'
            collapsible
            className='w-full'
          >
            {companyInfo.stories.map((story, index) => (
              <AccordionItem
                key={index}
                value={`story-${index}`}
              >
                <AccordionTrigger className='text-xl font-medium'>
                  {story.heading}
                </AccordionTrigger>
                <AccordionContent className='prose dark:prose-invert max-w-none'>
                  <p>{story.content}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      )}

      {/* Team Section */}
      {companyInfo.team.length > 0 && (
        <section className='space-y-8'>
          <h2 className='text-3xl font-bold'>Our Team</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {companyInfo.team.map((member, index) => (
              <Card
                key={index}
                className='overflow-hidden'
              >
                <div className='relative h-64 w-full'>
                  <Image
                    src={member.profileImage || "/placeholder-profile.jpg"}
                    alt={member.name}
                    fill
                    className='object-cover'
                    sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                  />
                </div>
                <CardContent className='pt-6 space-y-4'>
                  <div>
                    <h3 className='text-xl font-bold'>{member.name}</h3>
                    <p className='text-muted-foreground'>{member.position}</p>
              </div>
                  <p>{member.about}</p>
                  {member.skills.length > 0 && (
                    <div className='flex flex-wrap gap-2'>
                      {member.skills.map((skill, i) => (
                        <span
                          key={i}
                          className='px-3 py-1 bg-muted rounded-full text-sm'
                        >
                          {skill}
                        </span>
                      ))}
            </div>
          )}
                  {member.socialLinks && member.socialLinks.length > 0 && (
                    <div className='flex gap-3'>
                      {member.socialLinks.map((link) => (
                  <Link
                    href={link.url}
                          key={link.platform}
                    target='_blank'
                    rel='noopener noreferrer'
                          className='hover:text-primary transition-colors'
                  >
                          {socialIcons[link.platform.toLowerCase()] ||
                            link.name}
                  </Link>
                ))}
              </div>
            )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Contact CTA */}
      <section className='bg-muted p-8 rounded-lg text-center space-y-4'>
        <h2 className='text-2xl font-bold'>Interested in working with us?</h2>
        <p>Reach out to discuss how we can help with your next project.</p>
        <Button
          asChild
          size='lg'
        >
          <Link href='/contact'>Contact Us</Link>
        </Button>
      </section>
                    </div>
  );
}

// Loading skeleton for the About page
function AboutSkeleton() {
  return (
    <div className='container mx-auto py-12 px-4 space-y-12'>
      {/* Company Header Skeleton */}
      <section className='flex flex-col md:flex-row gap-8 items-center'>
        <div className='flex-1 space-y-4'>
          <Skeleton className='h-10 w-3/4' />
          <Skeleton className='h-6 w-1/2' />
          <Skeleton className='h-5 w-1/3' />
          <div className='flex gap-3 mt-4'>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                className='h-8 w-8 rounded-full'
              />
            ))}
          </div>
        </div>
        <Skeleton className='w-60 h-60 rounded-lg' />
      </section>

      {/* About Skeleton */}
      <section className='space-y-6'>
        <Skeleton className='h-8 w-40' />
        <div className='space-y-4'>
          <Skeleton className='h-5 w-full' />
          <Skeleton className='h-5 w-full' />
          <Skeleton className='h-5 w-4/5' />
        </div>
      </section>

      {/* Story Skeleton */}
      <section className='space-y-6'>
        <Skeleton className='h-8 w-40' />
        <div className='space-y-4'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className='space-y-2'
            >
              <Skeleton className='h-8 w-1/2' />
              <Skeleton className='h-24 w-full' />
            </div>
          ))}
        </div>
      </section>

      {/* Team Skeleton */}
      <section className='space-y-8'>
        <Skeleton className='h-8 w-32' />
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {Array.from({ length: 3 }).map((_, i) => (
            <Card
              key={i}
              className='overflow-hidden'
            >
              <Skeleton className='h-64 w-full' />
              <CardContent className='pt-6 space-y-4'>
          <div>
                  <Skeleton className='h-6 w-36' />
                  <Skeleton className='h-4 w-24 mt-2' />
                </div>
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-full' />
                <div className='flex flex-wrap gap-2'>
                  {Array.from({ length: 4 }).map((_, j) => (
                    <Skeleton
                      key={j}
                      className='h-6 w-16 rounded-full'
                    />
                  ))}
                </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
      </section>
    </div>
  );
}
