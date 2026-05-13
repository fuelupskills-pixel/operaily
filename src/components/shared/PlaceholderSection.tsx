"use client";

import React from "react";
import { Construction } from "lucide-react";

interface PlaceholderProps {
  title: string;
  description: string;
  icon?: string;
}

export default function PlaceholderSection({ title, description, icon = "🚧" }: PlaceholderProps) {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-200px)]">
      <div className="text-center space-y-4">
        <div className="text-6xl">{icon}</div>
        <h2 className="text-2xl font-bold gradient-text">{title}</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">{description}</p>
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Construction className="w-4 h-4" />
          <span>Coming in Phase 4+</span>
        </div>
      </div>
    </div>
  );
}
