
import type { SVGProps } from 'react';

export function TikTokIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        {...props}
    >
        <path d="M16 8.35A4 4 0 0 0 12 4.35v8.3a4 4 0 1 0 4 4V12a4 4 0 0 0-4-4v4.35" />
    </svg>
  );
}
