"use client"

import { UserButton, UserProfile } from '@clerk/nextjs';
import React, { useState } from 'react';

// Define a type for SVG component props for better type safety
type SVGProps = React.SVGProps<SVGSVGElement>;

// You can use an SVG icon library like lucide-react or just use SVGs directly.
const MenuIcon = (props: SVGProps) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
);

const XIcon = (props: SVGProps) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

// Define an interface for the navigation link objects
interface NavLink {
  href: string;
  label: string;
}

const TopBar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const navLinks: NavLink[] = [
    { href: '/', label: 'Home' },
    { href: '/clients', label: 'Current Clients' },
    { href: '/leads', label: 'Leads' },
    { href: '/finances', label: 'Finances' },
    { href: '/knowledge-hub', label: 'Knowledge Hub' },
    { href: '/automations', label: 'Automations' },
    {
      href: '/website-builder', label: 'Website Content'
    }
  ];

  return (
    <>
      <nav className="bg-sidebar text-sidebar-foreground border-b border-sidebar-border z-20 fixed top-0 left-0 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo or Brand Name */}
            <div className="flex-shrink-0">
               <a href="#" className="text-xl font-bold tracking-wider text-primary">TWJ</a>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:block">
              <div className="ml-10 flex space-x-4 items-center">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                ))}
                <UserButton />
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-sidebar focus:ring-ring"
                aria-controls="mobile-menu"
                aria-expanded={isMenuOpen}
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? <XIcon className="block h-6 w-6" /> : <MenuIcon className="block h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Sheet */}
      <div
        className={`md:hidden fixed top-0 right-0 h-full w-64 bg-sidebar shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        id="mobile-menu-sheet"
      >
        <div className="flex justify-end p-4 border-b border-sidebar-border">
            <button onClick={() => setIsMenuOpen(false)} className="text-muted-foreground hover:text-accent-foreground">
                <span className="sr-only">Close menu</span>
                <XIcon className="h-6 w-6" />
            </button>
        </div>
        <div className="p-4 space-y-2">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setIsMenuOpen(false)} // Close menu on link click
              className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
          <UserButton />
         
        </div>
      </div>

      {/* Overlay for when menu is open */}
      {isMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
    </>
  );
};

export default TopBar;

