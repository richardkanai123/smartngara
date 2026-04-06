import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// kenyan phone Number validation
export function validateKenyanPhoneNumber(phoneNumber: string) {
  const regex = /^(?:\+254|254|0)(?:7|1)\d{8}$/;
  return regex.test(phoneNumber);
}