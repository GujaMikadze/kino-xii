import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement> & { size?: number };

export default function CalendarIcon({ size = 16, ...props }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M4.39951 3.20117H11.5995C12.925 3.20117 13.9995 4.27569 13.9995 5.60117V11.6012C13.9995 12.9267 12.925 14.0012 11.5995 14.0012H4.39951C3.07403 14.0012 1.99951 12.9267 1.99951 11.6012V5.60117C1.99951 4.27569 3.07403 3.20117 4.39951 3.20117Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.59951 2.00098V4.40098M10.3995 2.00098V4.40098M1.99951 6.80098H13.9995"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}