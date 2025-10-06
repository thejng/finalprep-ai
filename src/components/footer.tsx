"use client";
import React from "react";
import { Heart } from "lucide-react";

export function AppFooter() {
  return (
    <footer className="border-t bg-gradient-to-br from-muted/30 to-muted/60 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 md:px-8">
        <div className="flex flex-col items-center text-center space-y-3">
          {/* Brand */}
          <div>
            <p className="font-headline text-xl font-semibold tracking-tight text-foreground">
              FinalPrepAI
            </p>
            <p className="text-sm text-muted-foreground">
              Empowering smarter exam preparation 
            </p>
          </div>



          {/* Credits */}
          <p className="text-sm text-muted-foreground">
            © 2025{" "}
            <span className="font-medium text-foreground">FinalPrepAI</span> — Built
            with 🧡
            by{" "}
            <span className="font-medium text-foreground">The Saffron Coder</span>
          </p>

        </div>
      </div>
    </footer>
  );
}
