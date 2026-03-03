const Navbar = () => {
  return (
    <nav className="bg-black px-8 py-5 border-b border-border/20">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <h1
          className="text-3xl font-light tracking-[0.15em] text-white"
          style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "0.12em" }}
        >
          {"C o r t e x".split(" ").map((char, i) => (
            <span key={i} className="inline-block">{char}</span>
          ))}
        </h1>
      </div>
    </nav>
  );
};

export default Navbar;
