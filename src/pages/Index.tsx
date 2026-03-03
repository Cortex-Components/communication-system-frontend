import ChatWidget from "@/features/chat/ChatWidget";

const Index = () => {
  return (
    <div className="min-h-screen relative">
      {/* Beige section below */}
      <div className="bg-secondary min-h-[40vh]" />

      <ChatWidget />
    </div>
  );
};

export default Index;