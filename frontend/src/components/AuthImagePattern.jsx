const AuthImagePattern = ({ title, subtitle }) => {
  return (
    <div className="relative hidden lg:flex flex-col items-center justify-center p-8 xl:p-12 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-base-200 to-secondary/5" />
      <div className="absolute top-1/4 right-1/4 w-72 h-72 rounded-full bg-primary/20 blur-[100px]" />

      <div className="relative w-full max-w-2xl text-center space-y-8">
        <div className="relative mx-auto">
          <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-primary/30 via-secondary/15 to-transparent blur-3xl opacity-80" />
          <div className="absolute -inset-2 rounded-3xl border border-white/10 bg-base-100/20 backdrop-blur-sm" />
          <img
            src="/login_illustration.png"
            alt="Login Illustration"
            className="relative w-full max-h-[60vh] object-contain rounded-3xl drop-shadow-[0_25px_50px_rgba(0,0,0,0.25)] hover:scale-[1.02] transition-transform duration-500"
          />
        </div>
        <div className="space-y-3 px-4">
          <h2 className="text-3xl font-bold">{title}</h2>
          <p className="text-base-content/60 text-lg leading-relaxed">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

export default AuthImagePattern;
