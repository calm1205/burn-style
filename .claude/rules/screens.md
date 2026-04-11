# Screen Structure

## Screen Transition Flow

```
/signup (Passkey Registration)
    ↓ Registration success
/signin (Passkey Authentication)
    ↓ Authentication success
/ (Dashboard)
    ├─ /expense/monthly (Monthly Analysis)
    │     └─ /expense/:uuid (Expense Edit)
    ├─ /expense/annual (Annual Analysis)
    ├─ /expense/new (New Expense)
    ├─ /category (Category Management)
    └─ /setting (User Settings)
```

## Layout

| Screen Width | Navigation |
|-------------|------------|
| Desktop (768px+) | Left sidebar (w-56) |
| Mobile (< 768px) | Bottom footer (h-20) |

## Screen List

### Authentication

| Screen | Path | Function |
|--------|------|----------|
| Sign Up | `/signup` | Passkey registration → navigate to /signin |
| Sign In | `/signin` | Passkey authentication → get JWT → navigate to / |

### Main (Authentication Required)

| Screen | Path | Function |
|--------|------|----------|
| Dashboard | `/` | Current month total, category pie chart, annual bar chart |
| New Expense | `/expense/new` | Register expense with name, amount, date, category |
| Expense Detail | `/expense/:uuid` | Edit / delete expense |
| Monthly Analysis | `/expense/monthly` | 4 tabs (List / Pie Chart / Heatmap / Bubble Chart) |
| Annual Analysis | `/expense/annual` | 3 tabs (List / Area Chart / Line Chart) |
| Category Management | `/category` | Create / edit / delete categories |
| Settings | `/setting` | Edit username, data export, logout, delete account |

## Data Visualization

| Chart | Screen | Purpose |
|-------|--------|---------|
| Pie Chart (small) | Dashboard | Current month category breakdown |
| Bar Chart | Dashboard | Last 12 months trend |
| Pie Chart (large) | Monthly Analysis | Category-based amount and ratio |
| Heatmap | Monthly Analysis | Daily spending intensity |
| Bubble Chart | Monthly Analysis | Frequency and total by amount range |
| Area Chart | Annual Analysis | Stacked category monthly trend |
| Line Chart | Annual Analysis | Individual category monthly trend |
