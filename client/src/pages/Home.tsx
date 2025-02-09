import SearchBar from "@/components/SearchBar";
import MenuButton from "@/components/MenuButton";
import ToolCard from "@/components/ToolCard";
import { ImageIcon, Wand2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <SearchBar />
          <MenuButton />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ToolCard
            title="AI BG Remover"
            description="Remove backgrounds from images instantly with AI"
            icon={<ImageIcon className="h-5 w-5" />}
            href="/bg-remover"
          />
          <ToolCard
            title="AI Image Generator"
            description="Generate unique images from text descriptions"
            icon={<Wand2 className="h-5 w-5" />}
            href="/image-generator"
          />
        </div>
      </main>

      <footer className="border-t mt-auto">
        <div className="container mx-auto px-4 h-16 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            COPYRIGHT© ALL RIGHTS RESERVED
          </p>
        </div>
      </footer>
    </div>
  );
}
