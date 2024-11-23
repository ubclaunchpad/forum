import Navbar from "@/components/navigation/navbar";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

export default function Uitest() {
  return (
    <div className="min-h-screen bg-[#ECECEC]">
      <Navbar variant="default">
        <p></p>
      </Navbar>
      <div className="flex flex-col items-start p-4 space-y-4">
        <h1>Lorem Ipsum Heading 1</h1>
        <h2>Lorem Ipsum Heading 2</h2>
        <h3>Lorem Ipsum Heading 3</h3>
        <h4>Lorem Ipsum Heading 4</h4>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec
          odio. Praesent libero. Sed cursus ante dapibus diam.
        </p>
        <button>Lorem Ipsum Button</button>
        <a href="#">Lorem Ipsum Link</a>

        {/* Ghost Buttons */}
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm">
            Ghost Small
          </Button>
          <Button variant="ghost" size="md">
            Ghost Medium
          </Button>
          <Button variant="ghost" size="lg">
            Ghost Large
          </Button>
        </div>

        {/* Icon Buttons */}
        <div className="flex space-x-2">
          <Button variant="solid" size="sm" icon="none">
            <PlusIcon className="" />
            Solid Small
          </Button>
          <Button variant="solid" size="md" icon="none">
            <PlusIcon className="" />
            Solid Medium
          </Button>
          <Button variant="solid" size="lg" icon="none">
            <PlusIcon className="" />
            Solid Large
          </Button>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" icon="none">
            <PlusIcon className="" />
            Outline Small
          </Button>
          <Button variant="outline" size="md" icon="none">
            <PlusIcon className="" />
            Outline Medium
          </Button>
          <Button variant="outline" size="lg" icon="none">
            <PlusIcon className="" />
            Outline Large
          </Button>
        </div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" icon="none">
            <PlusIcon className="" />
            Ghost Small
          </Button>
          <Button variant="ghost" size="md" icon="none">
            <PlusIcon className="" />
            Ghost Medium
          </Button>
          <Button variant="ghost" size="lg">
            <PlusIcon className="" />
            Ghost Large
          </Button>
        </div>
      </div>
    </div>
  );
}
