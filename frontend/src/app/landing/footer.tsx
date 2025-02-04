import Link from "next/link"
import { Cpu } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-primary-800 bg-black py-6 md:py-0">
      <div className="container mx-auto flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Cpu className="h-6 w-6 text-primary-400" />
          <p className="text-center text-sm leading-loose text-primary-300 md:text-left">
            Built by{" "}
            <Link
              href="https://www.ubclaunchpad.com/"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4 transition-colors hover:text-primary-100"
            >
              UBC Launch Pad
            </Link>
            .{" "}
            <span className="hidden sm:inline">
              Source code available on{" "}
              <Link
                href="https://github.com/ubclaunchpad/forum"
                target="_blank"
                rel="noreferrer"
                className="font-medium underline underline-offset-4 transition-colors hover:text-primary-100"
              >
                GitHub
              </Link>
              .
            </span>
          </p>
        </div>
      </div>
    </footer>
  )
}

