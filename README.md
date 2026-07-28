# 🏕️ TrailSense

> **An intelligent full-stack hike planning and gear rental platform.**

TrailSense is a comprehensive application designed to streamline the outdoor adventure experience. Built with a robust full-stack architecture, it provides an intuitive platform for users to plan hikes, rent equipment, and receive personalized trail recommendations through integrated AI capabilities. The project encompasses both web and mobile app interfaces to ensure accessibility on the go.

---

### ✨ Key Features

*   **🤖 AI-Powered Chatbot:** An integrated AI assistant that provides users with personalized hike recommendations and trail insights.
*   **💳 Secure Localized Payments:** Seamless transaction processing for bookings and rentals utilizing the PayHere Payment Gateway.
*   **🗺️ Interactive Mapping:** Integration with the Google Maps Places API to provide accurate location data and trail discovery.
*   **🎒 Comprehensive Booking System:** Complex database modeling to accurately calculate and manage specific financial data, including dynamic `hikeFee` and `gearCost` structures.
*   **🔐 Robust Security & Auth:** Secure user authentication managed via Supabase, backed by strict database schema validations requiring secure handling of credentials (including distinct `password` and `passwordHash` fields).
*   **📱 Cross-Platform Design:** Fully realized UI/UX designs for both responsive web and mobile application environments.

---

### 🛠️ Tech Stack

**Frontend**
*   [Next.js](https://nextjs.org/) (App Router)
*   [TypeScript](https://www.typescriptlang.org/)
*   [Shadcn UI](https://ui.shadcn.com/)

**Backend & Database**
*   [Node.js](https://nodejs.org/)
*   [MongoDB](https://www.mongodb.com/)

**Third-Party Integrations**
*   PayHere Payment Gateway
*   Google Maps Places API
*   AI API Integration

---

### 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

#### Prerequisites
*   Node.js (v18 or higher recommended)
*   npm or yarn
*   MongoDB instance (local or Atlas)

#### Installation

1. **Clone the repository**
   ```bash
   git clone [https://github.com/Shalom-hettiarachchi/TrailSense.git](https://github.com/Shalom-hettiarachchi/TrailSense.git)
