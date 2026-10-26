import logo from "../assets/logo.png"

interface LogoProps {
  className?: string
}

export default function Logo({ className = "h-12 w-auto" }: LogoProps) {
  return <img src={logo} alt="StudyLink LK" className={className} />
}