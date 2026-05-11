//top right status badge
export const STATUS_CONFIG = {
  pending: {
    label: "pending",
    color: "bg-amber-50 text-amber-600 border-amber-200",
    dot: "bg-amber-500",
  },
  approved: {
    label: "approved",
    color: "bg-blue-50 text-blue-600 border-blue-200",
    dot: "bg-blue-500",
  },
  home_visit: {
    label: "home visit",
    color: "bg-purple-50 text-purple-600 border-purple-200",
    dot: "bg-purple-500",
  },
  completed: {
    label: "completed",
    color: "bg-green-50 text-green-600 border-green-200",
    dot: "bg-green-500",
  },
  rejected: {
    label: "rejected",
    color: "bg-red-50 text-red-600 border-red-200",
    dot: "bg-red-500",
  },
  payment_pending: {
    label: "payment received",
    color: "bg-teal-50 text-teal-600 border-teal-200",
    dot: "bg-teal-500",
  },
  dissolved: {
    label: "dissolved",
    color: "bg-amber-50 text-amber-600 border-amber-200",
    dot: "bg-amber-500",
  },
};

//the labels under progress bar
export const PROGRESS_STEPS = [
  { key: "pending", label: "Application review" },
  { key: "approved", label: "Approved" },
  { key: "home_visit", label: "Home visit" },
  { key: "payment_pending", label: "Payment received" },
  { key: "completed", label: "Completed" },
];

//for determining the order of statuses in progress bar
export const STATUS_ORDER = [
  "pending",
  "approved",
  "home_visit",
  "payment_pending",
  "completed",
];

export const HOME_VISIT_TIME_SLOTS = [
  "9:00 AM - 11:00 AM",
  "12:00 PM - 2:00 PM",
  "3:00 PM - 5:00 PM",
  "6:00 PM - 8:00 PM",
];

//the button shown during each status
export const getActionsForStatus = (status) => {
  switch (status) {
    case "pending":
      return [
        {
          label: "Approve application",
          value: "approved",
          style: "bg-blue-600 hover:bg-blue-700 text-white",
        },
        {
          label: "Reject application",
          value: "rejected",
          style:
            "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200",
        },
      ];

    case "approved":
    case "home_visit":
      return [
        {
          label: "Reject application",
          value: "rejected",
          style:
            "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200",
        },
      ];

    case "payment_pending":
      return [
        {
          label: "Complete adoption ",
          value: "completed",
          style: "bg-green-600 hover:bg-green-700 text-white",
        },
      ];

    default:
      return [];
  }
};
