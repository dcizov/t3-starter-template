import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Combines class names using clsx and tailwind-merge
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Returns a date object based on the current time plus a specified number of seconds
export function fromDate(time: number, date: number = Date.now()): Date {
  return new Date(date + time * 1000);
}

// Determines the user role based on the provided email
export function getUserRole(email: string): "user" | "admin" {
  return email === process.env.ADMIN_USER_EMAIL ? "admin" : "user";
}
