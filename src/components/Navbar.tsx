"use client";

import { useState, useEffect, memo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Menu, Shield } from "lucide-react";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface NavbarProps {
  isAdmin: boolean;
}

// Define static data outside component to prevent recreation
const navItems = [
  { name: "Home", path: "/home" },
  { name: "About", path: "/about" },
  { name: "Services", path: "/services" },
  { name: "portfolios", path: "/portfolios" },
  { name: "Blog", path: "/blog" },
  { name: "Contact", path: "/contact" },
];

// Memoize auth buttons to prevent unnecessary re-renders
const AuthButtons = memo(() => (
  <div className='flex items-center gap-3'>
    <SignedOut>
      <div>
        <SignInButton mode='modal'>
          <Button
            variant='ghost'
            size='sm'
            className='rounded-full px-4'
          >
            Sign In
          </Button>
        </SignInButton>
      </div>
      <div>
        <SignUpButton mode='modal'>
          <Button
            variant='default'
            size='sm'
            className='rounded-full px-4'
          >
            Sign Up
          </Button>
        </SignUpButton>
      </div>
    </SignedOut>
    <SignedIn>
      <div className='ml-2'>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-8 w-8",
            },
          }}
        />
      </div>
    </SignedIn>
    <div>
      <ThemeToggle />
    </div>
  </div>
));

// Name component for React DevTools
AuthButtons.displayName = "AuthButtons";

// Memoize navbar links to prevent unnecessary re-renders
const DesktopNavLinks = memo(
  ({ isAdmin, items }: { isAdmin: boolean; items: typeof navItems }) => (
    <div className='hidden md:flex items-center gap-6 text-sm font-medium'>
      <nav className='flex items-center gap-8'>
        {items.map((item) => (
          <div key={item.path}>
            <Link
              href={item.path}
              className='relative transition-colors hover:text-primary text-foreground group'
              aria-label={`Navigate to ${item.name}`}
            >
              {item.name}
              <span className='absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full'></span>
            </Link>
          </div>
        ))}
      </nav>
      {isAdmin && (
        <div>
          <Link
            href='/admin'
            className='flex items-center'
            aria-label='Admin Panel'
          >
            <Shield className='h-5 w-5 text-primary' />
          </Link>
        </div>
      )}
      <AuthButtons />
    </div>
  )
);

DesktopNavLinks.displayName = "DesktopNavLinks";

// Export the optimized navbar component
function NavbarComponent({ isAdmin }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Optimize scroll event handler with throttling
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full border-b z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/85 backdrop-blur-md shadow-sm"
          : "bg-background/70 backdrop-blur-sm"
      }`}
    >
      <div className='container mx-auto flex h-16 items-center justify-between px-4'>
        <div>
          <Link
            href='/'
            aria-label='Home'
            className='flex items-center space-x-2'
          >
            <span className='font-bold text-lg bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent'>
              OurShop
            </span>
          </Link>
        </div>

        {/* Desktop navigation - memoized */}
        <DesktopNavLinks
          isAdmin={isAdmin}
          items={navItems}
        />

        {/* Mobile navigation - only render the minimal trigger until needed */}
        <Sheet
          open={isOpen}
          onOpenChange={setIsOpen}
        >
          <SheetTrigger
            asChild
            className='block md:hidden'
            aria-describedby='side bar sheet'
          >
            <Button
              variant='ghost'
              size='icon'
              className='relative'
              aria-label='Open Menu'
            >
              {isOpen ? null : <Menu className='h-5 w-5 container mx-auto' />}
            </Button>
          </SheetTrigger>
          <SheetContent
            side='left'
            className='w-[280px] sm:w-[350px] flex flex-col overflow-y-auto border-r'
            aria-describedby='side bar sheet'
          >
            <div className='py-6 flex justify-center'>
              <Link
                href='/'
                aria-label='Home'
                onClick={() => setIsOpen(false)}
              >
                <SheetTitle className='font-bold text-xl bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent'>
                  OurShop
                </SheetTitle>
              </Link>
            </div>
            <nav className='flex flex-col gap-1 flex-1 mt-4'>
              {navItems.map((item) => (
                <div key={item.path}>
                  <Link
                    href={item.path}
                    className='block px-4 py-3 text-base hover:bg-muted rounded-lg transition-colors'
                    aria-label={`Navigate to ${item.name}`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                </div>
              ))}
              {isAdmin && (
                <div>
                  <Link
                    href='/admin'
                    className='flex items-center gap-2 px-4 py-3 text-base hover:bg-muted rounded-lg transition-colors'
                    aria-label='Admin Panel'
                    onClick={() => setIsOpen(false)}
                  >
                    <Shield className='h-5 w-5 text-primary' />
                    Admin
                  </Link>
                </div>
              )}
            </nav>
            <div className='py-6 flex justify-center'>
              <AuthButtons />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}

// Export memoized component to prevent unnecessary re-renders
export const Navbar = memo(NavbarComponent);
