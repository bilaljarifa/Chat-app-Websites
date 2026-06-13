const AuthImagePattern = ({ title, subtitle }) => {
  return (
    <div className="hidden lg:flex flex-col items-center justify-center bg-base-200 p-12">
      <div className="max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <img
            src="/login_illustration.png"
            alt="Login Illustration"
            className="rounded-2xl shadow-2xl w-full object-cover border border-base-300"
          />
        </div>
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="text-base-content/60">{subtitle}</p>
      </div>
    </div>
  );
};

export default AuthImagePattern;
