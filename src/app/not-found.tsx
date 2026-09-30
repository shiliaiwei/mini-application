import React from "react";
import Link from "next/link";
import { ShiliaiweiBrand } from "@/components/brand/ShiliaiweiBrand";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 font-sans text-slate-900 select-none">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm text-center space-y-6">
        <div className="flex justify-center">
          <ShiliaiweiBrand height={28} colorScheme="blue" />
        </div>

        <div className="space-y-2">
          <span className="text-4xl font-black text-[#0098ea] block">
            404
          </span>
          <h2 className="text-xl font-black text-slate-900">
            Page Not Found
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            The requested destination does not exist. Please return to the official SHILIAIWEI Web3 application.
          </p>
        </div>

        <div>
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full py-3.5 px-6 rounded-full bg-[#0098ea] hover:bg-[#0088cc] text-white font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all duration-300 ease-out cursor-pointer"
          >
            Return to Main App
          </Link>
        </div>
      </div>
    </div>
  );
}
