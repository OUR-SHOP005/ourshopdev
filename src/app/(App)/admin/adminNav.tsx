"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileText,
  Globe,
  Inbox,
  Layers,
  MailPlus,
  User,
  UserCog,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminNav() {
  const router = useRouter();

  const adminSections = [
    {
      title: "Users",
      description: "Manage user accounts and permissions",
      icon: <UserCog className='h-8 w-8' />,
      href: "/admin/users",
    },
    {
      title: "Portfolios",
      description: "Manage your portfolios and showcase",
      icon: <Layers className='h-8 w-8' />,
      href: "/admin/portfolios",
    },
    {
      title: "Clients",
      description: "Manage your clients and invoices",
      icon: <FileText className='h-8 w-8' />,
      href: "/admin/client",
    },
    {
      title: "Blog",
      description: "Manage your blog posts and articles",
      icon: <FileText className='h-8 w-8' />,
      href: "/admin/blog",
    },
    {
      title: "Inbox",
      description: "View and respond to contact messages",
      icon: <Inbox className='h-8 w-8' />,
      href: "/admin/inbox",
    },
    {
      title: "Marketing",
      description: "Manage marketing emails and campaigns",
      icon: <MailPlus className='h-8 w-8' />,
      href: "/admin/marketing",
    },
    {
      title: "SEO",
      description: "Manage site SEO settings and metadata",
      icon: <Globe className='h-8 w-8' />,
      href: "/admin/seo",
    },
    {
      title: "Company Info",
      description: "Manage company information and team",
      icon: <User className='h-8 w-8' />,
      href: "/admin/company",
    },
    {
      title: "Services",
      description: "Manage your services",
      icon: <User className='h-8 w-8' />,
      href: "/admin/services",
    },
    {
      title: "Ads",
      description: "Manage your ads",
      icon: <User className='h-8 w-8' />,
      href: "/admin/ads",
    },
  ];

  return (
    <div className='space-y-6'>
      <h1 className='text-3xl font-bold tracking-tight'>Admin Dashboard</h1>

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {adminSections.map((section) => (
          <Card
            key={section.title}
            className='overflow-hidden'
          >
            <CardHeader className='pb-2'>
              <div className='flex items-center justify-between'>
                <CardTitle>{section.title}</CardTitle>
                {section.icon}
              </div>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant='default'
                className='w-full'
                onClick={() => router.push(section.href)}
              >
                Manage
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
