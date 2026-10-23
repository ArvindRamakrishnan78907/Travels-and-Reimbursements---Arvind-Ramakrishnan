export const mockStore = {
  "settings": {
    "currency": "INR",
    "dailyMealCap": 3500,
    "mileageRate": 15,
    "requireReceiptAbove": 500,
    "managerApprovalThreshold": 250000,
    "autoApproveLimit": 2500
  },
  "spendSummary": {
    "fiscalYear": "2026-2027",
    "totalSpend": 1177000,
    "timeframes": {
      "This Year": [
        {
          "month": "Apr",
          "amount": 45000
        },
        {
          "month": "May",
          "amount": 62000
        },
        {
          "month": "Jun",
          "amount": 78500
        },
        {
          "month": "Jul",
          "amount": 91000
        },
        {
          "month": "Aug",
          "amount": 118000
        },
        {
          "month": "Sep",
          "amount": 132500
        },
        {
          "month": "Oct",
          "amount": 145000
        },
        {
          "month": "Nov",
          "amount": 110000
        },
        {
          "month": "Dec",
          "amount": 95000
        },
        {
          "month": "Jan",
          "amount": 85000
        },
        {
          "month": "Feb",
          "amount": 92000
        },
        {
          "month": "Mar",
          "amount": 123000
        }
      ],
      "Previous Year": [
        {
          "month": "Apr",
          "amount": 35000
        },
        {
          "month": "May",
          "amount": 48000
        },
        {
          "month": "Jun",
          "amount": 62000
        },
        {
          "month": "Jul",
          "amount": 72000
        },
        {
          "month": "Aug",
          "amount": 95000
        },
        {
          "month": "Sep",
          "amount": 105000
        },
        {
          "month": "Oct",
          "amount": 120000
        },
        {
          "month": "Nov",
          "amount": 85000
        },
        {
          "month": "Dec",
          "amount": 78000
        },
        {
          "month": "Jan",
          "amount": 68000
        },
        {
          "month": "Feb",
          "amount": 75000
        },
        {
          "month": "Mar",
          "amount": 98000
        }
      ]
    }
  },
  "overallSummary": {
    "pendingTripsCount": 4,
    "pendingReportsAmount": 118250,
    "unreportedExpenses": 42300,
    "employeeAdvances": 165000
  },
  "pendingTrips": [
    {
      "id": "1",
      "name": "Arvind Ramakrishnan",
      "count": 2,
      "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"
    },
    {
      "id": "2",
      "name": "Karthik Raja",
      "count": 1,
      "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
    },
    {
      "id": "3",
      "name": "Aditya Varma",
      "count": 1,
      "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop"
    }
  ],
  "pendingReports": {
    "totalPending": 118250,
    "categories": [
      {
        "id": "c1",
        "label": "Air Travel",
        "amount": 58000,
        "count": 3,
        "color": "#1b74e4"
      },
      {
        "id": "c2",
        "label": "Hotel & Stay",
        "amount": 38250,
        "count": 4,
        "color": "#f59e0b"
      },
      {
        "id": "c3",
        "label": "Meals & Per-Diem",
        "amount": 14500,
        "count": 8,
        "color": "#10b981"
      },
      {
        "id": "c4",
        "label": "Local Conveyance",
        "amount": 7500,
        "count": 5,
        "color": "#8b5cf6"
      }
    ]
  },
  "trips": [
    {
      "id": "TRP-101",
      "destination": "Bengaluru, India",
      "purpose": "Client Architecture Review",
      "traveler": "Arvind Ramakrishnan",
      "email": "admin@zylker.com",
      "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
      "dates": "Oct 24 - Oct 28, 2026",
      "budget": 42000,
      "status": "approved"
    },
    {
      "id": "TRP-102",
      "destination": "Mumbai, India",
      "purpose": "FinTech Leadership Summit",
      "traveler": "Karthik Raja",
      "email": "karthik@zylker.com",
      "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      "dates": "Nov 02 - Nov 05, 2026",
      "budget": 35000,
      "status": "pending"
    },
    {
      "id": "TRP-103",
      "destination": "Hyderabad, India",
      "purpose": "Cloud Infrastructure Audit",
      "traveler": "Aditya Varma",
      "email": "aditya@zylker.com",
      "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
      "dates": "Nov 12 - Nov 15, 2026",
      "budget": 28000,
      "status": "pending"
    },
    {
      "id": "TRP-104",
      "destination": "New Delhi, India",
      "purpose": "Annual Vendor Negotiations",
      "traveler": "Arvind Ramakrishnan",
      "email": "admin@zylker.com",
      "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
      "dates": "Dec 01 - Dec 06, 2026",
      "budget": 65000,
      "status": "pending"
    }
  ],
  "reports": [
    {
      "id": "EXP-8901",
      "title": "Bengaluru Q3 Client Flight & Hotel",
      "employee": "Arvind Ramakrishnan",
      "email": "admin@zylker.com",
      "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
      "submittedDate": "2026-10-18",
      "receiptsCount": 4,
      "amount": 38500,
      "policyStatus": "Compliant",
      "status": "pending"
    },
    {
      "id": "EXP-8902",
      "title": "Mumbai FinTech Expo Travel Advance Settlement",
      "employee": "Karthik Raja",
      "email": "karthik@zylker.com",
      "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      "submittedDate": "2026-10-19",
      "receiptsCount": 2,
      "amount": 24000,
      "policyStatus": "Compliant",
      "status": "in-review"
    },
    {
      "id": "EXP-8903",
      "title": "Hyderabad Data Center Emergency Cab Fare",
      "employee": "Aditya Varma",
      "email": "aditya@zylker.com",
      "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
      "submittedDate": "2026-10-21",
      "receiptsCount": 6,
      "amount": 8750,
      "policyStatus": "Compliant",
      "status": "pending"
    },
    {
      "id": "EXP-8904",
      "title": "Team Strategy Dinner - Chennai HQ",
      "employee": "Arvind Ramakrishnan",
      "email": "admin@zylker.com",
      "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
      "submittedDate": "2026-10-22",
      "receiptsCount": 1,
      "amount": 14500,
      "policyStatus": "Flagged",
      "status": "pending"
    }
  ],
  "advances": [
    {
      "id": "ADV-401",
      "employee": "Arvind Ramakrishnan",
      "email": "admin@zylker.com",
      "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
      "amount": 50000,
      "purpose": "Q4 Client Roadshow Travel Advance",
      "issuedDate": "2026-10-10",
      "settlementStatus": "unsettled"
    },
    {
      "id": "ADV-402",
      "employee": "Karthik Raja",
      "email": "karthik@zylker.com",
      "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      "amount": 35000,
      "purpose": "FinTech Expo Booth Logistics",
      "issuedDate": "2026-10-12",
      "settlementStatus": "partially-settled"
    },
    {
      "id": "ADV-403",
      "employee": "Aditya Varma",
      "email": "aditya@zylker.com",
      "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
      "amount": 80000,
      "purpose": "Regional Server Deployment Advance",
      "issuedDate": "2026-10-15",
      "settlementStatus": "unsettled"
    }
  ],
  "users": [
    {
      "id": "u1",
      "name": "Arvind Ramakrishnan",
      "email": "admin@zylker.com",
      "role": "admin",
      "department": "Executive Management",
      "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"
    },
    {
      "id": "u2",
      "name": "Karthik Raja",
      "email": "karthik@zylker.com",
      "role": "manager",
      "department": "Engineering & Operations",
      "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
    },
    {
      "id": "u3",
      "name": "Aditya Varma",
      "email": "aditya@zylker.com",
      "role": "employee",
      "department": "Product Development",
      "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop"
    }
  ]
};
export default mockStore;
