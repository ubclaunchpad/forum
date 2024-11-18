import Navbar from "@/components/navigation/navbar";

export default function ForumLandingPage() {
  return (
    <div className="min-h-screen bg-[#ECECEC] ">
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
      </div>
    </div>
  );
}
