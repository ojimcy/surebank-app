function Login() {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <h1 className="text-2xl font-bold text-[#0066A1] mb-6">Login</h1>
      <div className="bg-white rounded-xl shadow-sm p-6 w-full max-w-md">
        <form className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0066A1] focus:ring-[#0066A1] sm:text-sm h-12 px-3 border"
              placeholder="Enter your email"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0066A1] focus:ring-[#0066A1] sm:text-sm h-12 px-3 border"
              placeholder="Enter your password"
            />
          </div>
          <div className="text-right">
            <a href="#" className="text-sm text-[#0066A1] hover:underline">
              Forgot Password?
            </a>
          </div>
          <button
            type="submit"
            className="w-full bg-[#0066A1] text-white rounded-md py-3 font-semibold hover:bg-[#007DB8] transition-colors"
          >
            Login
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="#" className="text-[#0066A1] hover:underline font-medium">
              Register
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
