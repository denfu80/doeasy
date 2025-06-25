import TerminalHomepage from "@/components/terminal-homepage"
import PlayfulHomepage from "@/components/playful-homepage"

export default function Home() {
  // Check environment variable for homepage style
  const homepageStyle = process.env.NEXT_PUBLIC_HOMEPAGE_STYLE || 'playful'
  
  if (homepageStyle === 'terminal') {
    return <TerminalHomepage />
  }
  
  return <PlayfulHomepage />
}