import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { differenceInDays, addDays, format } from "date-fns";
import { PregnancyStats, Trimester } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return format(date, "MMMM d, yyyy");
}

export function formatDateTime(dateTimeString: string): string {
  const date = new Date(dateTimeString);
  return format(date, "MMM d, yyyy h:mm a");
}

export function calculatePregnancyStats(dueDate: string, startDate: string): PregnancyStats {
  const today = new Date();
  const dueDateObj = new Date(dueDate);
  const startDateObj = new Date(startDate);
  
  // Pregnancy is typically 40 weeks or 280 days
  const totalDays = 280;
  
  // Calculate days since pregnancy started
  const daysPassed = differenceInDays(today, startDateObj);
  
  // Calculate days remaining until due date
  const daysRemaining = differenceInDays(dueDateObj, today);
  
  // Calculate the current week of pregnancy
  const currentWeek = Math.floor(daysPassed / 7) + 1;
  
  // Calculate pregnancy progress percentage
  const progress = Math.min(Math.max((daysPassed / totalDays) * 100, 0), 100);
  
  // Determine trimester
  let trimester: 1 | 2 | 3;
  if (currentWeek <= 13) {
    trimester = 1;
  } else if (currentWeek <= 26) {
    trimester = 2;
  } else {
    trimester = 3;
  }
  
  // Determine baby size comparison
  const babySizeComparisons = [
    "a poppy seed", // Week 1
    "a sesame seed", // Week 2
    "a lentil", // Week 3
    "a blueberry", // Week 4
    "a raspberry", // Week 5
    "a pea", // Week 6
    "a coffee bean", // Week 7
    "a kidney bean", // Week 8
    "a grape", // Week 9
    "a kumquat", // Week 10
    "a fig", // Week 11
    "a lime", // Week 12
    "a peach", // Week 13
    "a lemon", // Week 14
    "an apple", // Week 15
    "an avocado", // Week 16
    "a pomegranate", // Week 17
    "a bell pepper", // Week 18
    "a mango", // Week 19
    "a banana", // Week 20
    "a carrot", // Week 21
    "a papaya", // Week 22
    "a grapefruit", // Week 23
    "a cantaloupe", // Week 24
    "a cauliflower", // Week 25
    "a lettuce head", // Week 26
    "a rutabaga", // Week 27
    "an eggplant", // Week 28
    "a butternut squash", // Week 29
    "a cabbage", // Week 30
    "a coconut", // Week 31
    "a jicama", // Week 32
    "a pineapple", // Week 33
    "a cantaloupe", // Week 34
    "a honeydew melon", // Week 35
    "a romaine lettuce", // Week 36
    "a bunch of swiss chard", // Week 37
    "a winter melon", // Week 38
    "a watermelon", // Week 39
    "a pumpkin", // Week 40
  ];
  
  const babySize = babySizeComparisons[Math.min(currentWeek - 1, babySizeComparisons.length - 1)];
  
  return {
    currentWeek,
    daysRemaining,
    totalDays,
    progress,
    babySize,
    trimester,
  };
}

export function getTrimesterLabel(trimester: 1 | 2 | 3): string {
  switch (trimester) {
    case 1:
      return Trimester.First;
    case 2:
      return Trimester.Second;
    case 3:
      return Trimester.Third;
    default:
      return "";
  }
}

export function getStatusColor(status: "normal" | "abnormal" | "follow_up") {
  switch (status) {
    case "normal":
      return "bg-green-100 text-green-800";
    case "abnormal":
      return "bg-red-100 text-red-800";
    case "follow_up":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function getStatusLabel(status: "normal" | "abnormal" | "follow_up") {
  switch (status) {
    case "normal":
      return "Normal";
    case "abnormal":
      return "Abnormal";
    case "follow_up":
      return "Follow Up";
    default:
      return status;
  }
}
