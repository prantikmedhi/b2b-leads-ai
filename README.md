# LeadFinder AI - B2B Lead Generation & Web Scraper Tool

**LeadFinder AI** is a powerful, AI-driven **B2B lead generation tool** designed to help agencies, freelancers, and marketers find high-quality local business leads. Whether you need leads for **website development**, **digital marketing**, **SEO**, or general business outreach, LeadFinder AI automates the process of finding, filtering, and organizing potential clients.

Built with **Next.js 14**, **Tailwind CSS**, and **OpenAI/Llama**, this application intelligently parses your natural language prompts to search Google Maps and export actionable data directly to **Google Sheets**.

![LeadFinder AI Screenshot](public/readme.png)
---

## 🌟 Key Features

*   **🤖 AI-Powered Search**: Uses advanced LLMs (Groq as the primary provider, with automatic fallback to OpenRouter) to understand natural language prompts like *"Find cafes in NYC that need a website"* or *"Digital marketing agencies in London"*.
*   **🎯 Smart Filtering**:
    *   **Website Development Mode**: Automatically filters out businesses that *already* have a website, giving you a list of high-potential prospects.
    *   **Broad Mode**: Finds all businesses in a category for digital marketing or general outreach, regardless of their website status.
*   **📍 Local Business Data**: Leverages Serper.dev (Google Maps API) to fetch accurate business names, addresses, phone numbers, ratings, and website links.
*   **📊 One-Click Export**: Manually review your search results and push them to **Google Sheets** with a single click.
*   **📱 Responsive UI**: A modern, mobile-friendly interface built with Tailwind CSS.

---

## 🛠️ Tech Stack

*   **Frontend**: Next.js 14 (App Router), Tailwind CSS, React Icons
*   **Backend**: Next.js API Routes (Serverless)
*   **AI Logic**: Groq API (primary, Llama 3.3 70B by default) with OpenRouter as fallback
*   **Data Source**: Serper.dev (Google Maps Search API)
*   **Database/Export**: Google Sheets API
*   **Deployment**: Vercel / Netlify

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (v18 or higher)
*   [Git](https://git-scm.com/)
*   A Google Cloud Account
*   Accounts for Serper.dev and Groq (OpenRouter optional, used as a fallback)

---

## 🔑 API Keys & Setup Guide

To run this project, you need API keys from Serper.dev, at least one AI provider (Groq and/or OpenRouter), and Google Sheets. Follow this step-by-step guide:

### 1. Serper.dev (Google Maps Search)
1.  Go to [Serper.dev](https://serper.dev/).
2.  Sign up for a free account.
3.  On the dashboard, locate your **API Key**.
4.  Save this key; you will need it for `SERPER_API_KEY`.

### 2. Groq (AI Processing, primary)
1.  Go to [console.groq.com/keys](https://console.groq.com/keys).
2.  Sign up or log in, then click **Create API Key**.
3.  Save this key; you will need it for `GROQ_API_KEY`.
    *   *Note: The default model is `openai/gpt-oss-120b`; override it with `GROQ_MODEL`.*

### 3. OpenRouter (AI Processing, fallback)
If a Groq request fails (or `GROQ_API_KEY` is not set), the app retries the request with OpenRouter when `OPENROUTER_API_KEY` is set.
1.  Go to [OpenRouter.ai](https://openrouter.ai/).
2.  Sign up or log in.
3.  Navigate to **Keys** and create a new API Key.
4.  Save this key; you will need it for `OPENROUTER_API_KEY`.
    *   *Note: This project uses free models like Llama 3 by default, but you can configure it for others with `OPENROUTER_MODEL`.*

### 4. Google Sheets API (Data Export)
This is the most critical step. You need a Service Account to write data to your sheet.

1.  **Create a Project**: Go to the [Google Cloud Console](https://console.cloud.google.com/) and create a new project.
2.  **Enable APIs**:
    *   Search for **"Google Sheets API"** and click **Enable**.
3.  **Create Credentials**:
    *   Go to **APIs & Services > Credentials**.
    *   Click **+ CREATE CREDENTIALS** and select **Service account**.
    *   Give it a name (e.g., "leadfinder-bot") and click **Create and Continue**.
    *   (Optional) Grant the role **Editor** to the service account for the project.
    *   Click **Done**.
4.  **Get the Private Key**:
    *   Click on the newly created Service Account email (e.g., `leadfinder-bot@project-id.iam.gserviceaccount.com`).
    *   Go to the **Keys** tab.
    *   Click **Add Key > Create new key**.
    *   Select **JSON** and click **Create**. A file will download.
5.  **Configure Environment**:
    *   Open the downloaded JSON file.
    *   You need `client_email` for `GOOGLE_SERVICE_ACCOUNT_EMAIL`.
    *   You need `private_key` for `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`.
6.  **Share the Sheet**:
    *   Create a new Google Sheet (e.g., "LeadFinder Results").
    *   Click the **Share** button in the top right.
    *   Paste the `client_email` (from step 5) into the share dialog.
    *   Give it **Editor** permissions.
    *   Copy the **Spreadsheet ID** from the URL:
        `https://docs.google.com/spreadsheets/d/`**`COPY_THIS_ID_PART`**`/edit`
    *   This is your `GOOGLE_SHEET_ID`.

---

## 🚀 Installation & Local Development

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/prantikmedhi/leads-finder.git
    cd leads-finder
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Configure Environment Variables**
    Create a `.env` file in the root directory:
    ```bash
    cp .env.example .env
    ```
    Open `.env` and fill in your keys:
    ```env
    # Google Sheets Setup
    GOOGLE_SERVICE_ACCOUNT_EMAIL="your-service-account-email@project.iam.gserviceaccount.com"
    GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour...\n-----END PRIVATE KEY-----\n"
    GOOGLE_SHEET_ID="your-google-sheet-id"

    # External APIs
    SERPER_API_KEY="your-serper-api-key"

    # AI providers: Groq is primary, OpenRouter is the fallback (set at least one)
    GROQ_API_KEY="your-groq-api-key"
    OPENROUTER_API_KEY="your-openrouter-api-key"
    # Optional model overrides
    # GROQ_MODEL="openai/gpt-oss-120b"
    # OPENROUTER_MODEL="openrouter/free"
    ```
    *Tip: If your private key contains `\n`, ensure they are properly formatted or pasted as a single line string depending on your OS/deployment environment.*

4.  **Run the Application**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📖 How to Use

### 1. Website Development Leads (Strict Filter)
If you want to find businesses that **don't have a website**, use terms like "website", "web design", or "no website" in your prompt.

*   **Prompt**: *"Find plumbers in Austin Texas that need a website"*
*   **Result**: The app lists plumbers *without* a website found on Google Maps. The "Push to Sheets" button will save them for your outreach campaign.

### 2. Digital Marketing / General Leads (Broad Search)
If you want to find **all businesses** in a category (e.g., for SEO, Ads, or B2B sales), use a standard search prompt.

*   **Prompt**: *"Digital marketing agencies in New York"* or *"Gyms in Miami"*
*   **Result**: The app lists all matching businesses. Cards will show "Visit Website" for those that have one, and "No website found" for those that don't.

### 3. Saving Data
*   Review the results on the dashboard.
*   Click the green **"Push to Sheets"** button.
*   The data (Name, Address, Phone, Rating, Website URL) will be appended to your connected Google Sheet instantly.

---

## 📈 SEO Keywords
Lead generation software, B2B lead scraper, Google Maps scraper, find businesses without websites, AI lead finder, agency tools, automated prospecting, Next.js application, React source code.

---

## 📄 License

This project is licensed under the MIT License. Feel free to use, modify, and distribute it.
