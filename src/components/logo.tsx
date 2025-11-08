import * as React from 'react';

export const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M13.63 4.37L10.71 10.2H14.2L12.43 14.65L14.47 11.23H11.5L13.63 4.37Z"
      className="fill-primary"
    />
    <path
      d="M10.37 19.63L13.29 13.8H9.8L11.57 9.35L9.53 12.77H12.5L10.37 19.63Z"
      className="fill-accent"
    />
  </svg>
);
