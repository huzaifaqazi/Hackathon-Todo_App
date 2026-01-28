const Footer = () => {
  return (
    <footer className="py-6 md:px-8 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <div className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          © {new Date().getFullYear()} TodoApp. All rights reserved.
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className="text-sm hover:underline underline-offset-4">
            Terms
          </a>
          <a href="#" className="text-sm hover:underline underline-offset-4">
            Privacy
          </a>
          <a href="#" className="text-sm hover:underline underline-offset-4">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
};

export { Footer };