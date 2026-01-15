# Smart Reconciliation Visualizer

An interactive dashboard that helps users reconcile two financial datasets (e.g., Purchase Register vs Sales Register) and visually identify matches, mismatches, and missing entries.

![Smart Reconciliation Visualizer](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)

## 🚀 Live Demo

**[View Live Demo](https://smart-reconciliation-visualizer.vercel.app)** *(Update after deployment)*

## ✨ Features

- **📤 Dual CSV Upload**: Drag-and-drop file upload for Purchase Register and Sales Register
- **🔍 Smart Matching**: Automatically matches records by Invoice Number + Date
- **📊 Visual Dashboard**: Summary cards, pie charts, and detailed data tables
- **🎯 Discrepancy Detection**: Identifies mismatches in amounts, GSTIN, tax values
- **🔎 Advanced Filtering**: Search by Invoice No, Party Name, GSTIN; filter by status and amount range
- **📥 Export Results**: Download reconciliation report as CSV
- **📱 Responsive Design**: Works on desktop and mobile devices

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | Custom shadcn/ui-style components |
| Data Table | @tanstack/react-table |
| Charts | Recharts |
| CSV Parsing | PapaParse |
| Icons | Lucide React |

## 🏃 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Git-Shashi/Smart-Reconciliation-Visualizer.git

# Navigate to project directory
cd smart-reconciliation-visualizer

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx          # Main application page
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/
│   ├── ui/               # Reusable UI components (Button, Card, Table, etc.)
│   ├── FileUpload.tsx    # CSV file upload component
│   ├── FilterPanel.tsx   # Search and filter controls
│   ├── ResultsTable.tsx  # Data table with expandable rows
│   ├── SummaryCards.tsx  # Statistics summary cards
│   └── ReconciliationChart.tsx  # Pie chart visualization
├── lib/
│   ├── reconciliation.ts # Core reconciliation logic
│   └── utils.ts          # Utility functions
├── types/
│   └── reconciliation.ts # TypeScript type definitions
└── public/
    └── samples/          # Sample CSV files for testing
```

## 🧠 Approach & Technical Decisions

### 1. Matching Logic
- **Primary Key**: Invoice Number + Invoice Date combination
- **Tolerance**: ₹1 variance allowed for rounding differences
- **Date Formats**: Supports both YYYY-MM-DD and DD-MM-YYYY formats
- **Column Detection**: Auto-detects column names from common GST formats (GSTR-1, GSTR-2A)

### 2. Reconciliation Categories
| Status | Description |
|--------|-------------|
| ✅ Matched | Records exist in both datasets with identical values |
| ❌ Mismatched | Records found but values differ (amount, tax, GSTIN) |
| ⚠️ Missing in Purchase | Record exists in Sales but not in Purchase |
| ⚠️ Missing in Sales | Record exists in Purchase but not in Sales |

### 3. Why Next.js + TypeScript?
- **Type Safety**: Prevents runtime errors, better IDE support
- **Performance**: Server-side rendering, automatic code splitting
- **Modern React**: App Router with React Server Components support
- **Easy Deployment**: Seamless Vercel integration

### 4. Why Client-Side Processing?
- **Privacy**: Financial data never leaves the user's browser
- **Speed**: No network latency for reconciliation
- **Simplicity**: No backend required, reduces deployment complexity

## 📋 Assumptions

1. **CSV Format**: Input files must be valid CSV with headers in the first row
2. **Required Columns**: Must have at least an "Invoice No" column (or similar)
3. **Numeric Values**: Amount columns should be numeric (commas and ₹ symbol are handled)
4. **Character Encoding**: Files should be UTF-8 encoded
5. **Data Size**: Designed for datasets up to 10,000 records (browser memory limit)

## 🧪 Sample Data

The application includes sample CSV files for testing:

- `sample-purchase-register.csv` - 15 purchase records
- `sample-sales-register.csv` - 15 sales records (with intentional discrepancies)

**Test Scenarios Covered:**
- Perfect matches (INV-2024-001, INV-2024-002)
- Amount mismatches (INV-2024-003, INV-2024-008)
- Missing in Sales (INV-2024-012)
- Missing in Purchase (INV-2024-016)
- Minor name variations (HCL Technologies vs HCL Technologies Ltd)

## 📈 Future Enhancements

- [ ] Excel file support (.xlsx)
- [ ] Custom column mapping UI
- [ ] Multiple reconciliation rule sets
- [ ] Historical comparison tracking
- [ ] Bulk export with annotations
- [ ] Dark mode support

## 👤 Author

**Shashi** - Full Stack Developer Intern Applicant

- GitHub: [@Git-Shashi](https://github.com/Git-Shashi)

## 📄 License

This project is created as part of a technical assessment for WFYI Technology.

---

Built with ❤️ for WFYI Technology Full Stack Development Internship Assessment
