import { cn } from '@/lib/utils';

export const PeamIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="3 3 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
    className={cn('scheme-light-dark', props.className)}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21H16.5C17.8978 21 18.5967 21 19.1481 20.7716C19.8831 20.4672 20.4672 19.8831 20.7716 19.1481C21 18.5967 21 17.8978 21 16.5V12C21 7.02944 16.9706 3 12 3Z"
      fill="currentColor"
    />
    <rect x="8" y="10" width="8" height="2" rx="1" className="fill-background" />
    <rect x="11" y="14" width="5" height="2" rx="1" className="fill-background" />
  </svg>
);

export const PeamCloseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="3 3 18 18"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
    className={cn('scheme-light-dark', props.className)}
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21H16.5C17.8978 21 18.5967 21 19.1481 20.7716C19.8831 20.4672 20.4672 19.8831 20.7716 19.1481C21 18.5967 21 17.8978 21 16.5V12C21 7.02944 16.9706 3 12 3Z"
    />
    <path
      className="fill-background"
      d="M10.71 9.03C10.32 8.64 9.69 8.64 9.3 9.03C8.91 9.42 8.91 10.05 9.3 10.44L11.06 12.2L9.3 13.96C8.91 14.35 8.91 14.98 9.3 15.37C9.69 15.76 10.32 15.76 10.71 15.37L12.47 13.61L14.23 15.37C14.62 15.76 15.25 15.76 15.64 15.37C16.03 14.98 16.03 14.35 15.64 13.96L13.88 12.2L15.64 10.44C16.03 10.05 16.03 9.42 15.64 9.03C15.25 8.64 14.62 8.64 14.23 9.03L12.47 10.79L10.71 9.03Z"
    />
  </svg>
);
