import * as React from "react";

interface SearchIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export const SearchIcon: React.FC<SearchIconProps> = ({
  className,
  ...props
}) => {
  return (
    <svg
      width="38"
      height="38"
      viewBox="0 0 38 38"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M22.5765 25.9746C21.981 25.3791 21.981 24.4136 22.5765 23.8182C23.1719 23.2227 24.1374 23.2227 24.7329 23.8182L30.832 29.9173C31.4275 30.5128 31.4275 31.4782 30.832 32.0737C30.2365 32.6692 29.2711 32.6692 28.6756 32.0737L22.5765 25.9746Z"
        fill="currentColor"
      />
      <path
        d="M17.5556 24.8965C21.7661 24.8965 25.1795 21.4832 25.1795 17.2726C25.1795 13.062 21.7661 9.64869 17.5556 9.64869C13.345 9.64869 9.93165 13.062 9.93165 17.2726C9.93165 21.4832 13.345 24.8965 17.5556 24.8965ZM17.5556 27.9461C11.6608 27.9461 6.88208 23.1674 6.88208 17.2726C6.88208 11.3778 11.6608 6.59912 17.5556 6.59912C23.4504 6.59912 28.2291 11.3778 28.2291 17.2726C28.2291 23.1674 23.4504 27.9461 17.5556 27.9461Z"
        fill="currentColor"
      />
    </svg>
  );
};
