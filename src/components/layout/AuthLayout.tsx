import React from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row">
      {/* Brand Side - Desktop */}
      <div className="hidden md:flex md:w-1/2 bg-[#0066A1] p-10 text-white flex-col justify-between relative overflow-hidden">
        {/* Background Image - Semi-transparent to maintain brand color */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1601597111158-2fceff292cdc?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3')",
            backgroundBlendMode: 'overlay',
          }}
        ></div>

        {/* Content (positioned above the background) */}
        <div className="relative z-10">
          <Link to="/" className="text-2xl font-bold text-white">
            SureBank
          </Link>
        </div>

        <div className="mb-auto mt-20 relative z-10">
          <h1 className="text-4xl font-bold mb-4">Save money, save future</h1>
          <p className="text-lg text-white/80 max-w-lg ">
            Secure your financial future with SureBank, the most reliable
            savings platform in Nigeria.
            <br />
            Save, invest, and grow your money with ease.
          </p>
        </div>

        <div className="mt-auto relative z-10">
          <p className="text-sm text-white/70">
            © {new Date().getFullYear()} SureBank. All rights reserved.
          </p>
        </div>
      </div>

      {/* Content Side */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Banner with Background Image */}
        <div className="md:hidden bg-[#0066A1] text-white relative overflow-hidden">
          {/* Background Image for Mobile */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1601597111158-2fceff292cdc?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3')",
              backgroundBlendMode: 'overlay',
            }}
          ></div>

          {/* Mobile Header Content */}
          <div className="relative z-10 p-5 pt-6 pb-8">
            <Link to="/" className="text-2xl font-bold block mb-4">
              SureBank
            </Link>
            <h3 className="text-xl font-semibold mb-1">
              Save money, save future
            </h3>
            <p className="text-sm text-white/80">
              Secure your financial future with SureBank, the most reliable
              savings platform in Nigeria.
              <br />
              Save, invest, and grow your money with ease.
            </p>
          </div>
        </div>

        <div className="flex-1 flex flex-col p-5 pt-8 md:justify-center">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#212529]">{title}</h2>
              {subtitle && <p className="text-[#6C757D] mt-2">{subtitle}</p>}
            </div>

            {children}
          </div>

          <div className="md:hidden mt-8 text-center">
            <p className="text-sm text-[#6C757D]">
              © {new Date().getFullYear()} SureBank. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
