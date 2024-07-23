"use client";

import * as React from "react";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";

import { Button } from "@/app/_components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/app/_components/ui/tooltip";

export function ModeToggle() {
  return (
    <TooltipProvider disableHoverableContent>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <Button
            className="h-8 w-8 rounded-full bg-background"
            variant="outline"
            size="icon"
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            onClick={() => {}}
          >
            <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-transform duration-500 ease-in-out dark:rotate-0 dark:scale-100" />
            <MoonIcon className="scale-1000 absolute h-[1.2rem] w-[1.2rem] rotate-0 transition-transform duration-500 ease-in-out dark:-rotate-90 dark:scale-0" />
            <span className="sr-only">Switch Theme</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Switch Theme</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
