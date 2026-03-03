import Navbar from "@/components/Navbar";
import ChatWidget from "@/components/ChatWidget";

const Index = () => {
  return (
    <div className="min-h-screen relative">
      <Navbar />

      {/* Hero with horizontal gradient */}
      <section
        className="relative px-8 pt-20 pb-32"
        style={{
          background:
            "linear-gradient(to right, hsl(210 15% 25%), hsl(200 10% 45%) 40%, hsl(40 20% 65%) 70%, hsl(43 40% 80%))",
        }}
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold leading-tight text-white max-w-lg">
            Write code once,
            <br />
            and earn every time
            <br />
            it's used.
          </h2>
          <p className="mt-8 text-base text-white/70 max-w-lg leading-relaxed">
            On Cortex, anyone with code can upload it and earn every time it's
            used.And anyone building a project will find ready-to-use modules
            to start instantly — without building from scratch.
          </p>
        </div>
      </section>

      {/* Beige section below */}
      <div className="bg-secondary min-h-[40vh]" />

      <ChatWidget />
    </div>
  );
};

export default Index;
