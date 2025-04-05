import * as React from "react";

interface ArrowDownIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export const ArrowDownIcon: React.FC<ArrowDownIconProps> = ({
  className,
  ...props
}) => {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M11.6666 16.6665L20 24.9998L28.3333 16.6665"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
