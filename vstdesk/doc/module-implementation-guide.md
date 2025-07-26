# Module Implementation Guide

This document provides detailed implementation guidance for each module of the Rental & Expense Management App. It includes specific features, UI components, data models, and business logic for each module.

## 1. Dashboard Module

### Features
- Overview of monthly rent collected/expected
- Pending bills summary
- Water and current utility status
- External expenses summary
- Quick navigation to other modules

### Implementation Details

#### Components
1. **RentSummary.vue**
   - Display total rent collected vs. expected for the current month
   - Show breakdown by shop and apartment
   - Include visual indicators for paid/unpaid status

2. **UtilitySummary.vue**
   - Display water and electricity bill status
   - Show allocation status (allocated vs. unallocated)
   - Include visual indicators for paid/unpaid status

3. **ExpenseSummary.vue**
   - Display total expenses for the current month
   - Show breakdown by category
   - Highlight recurring expenses

4. **Charts**
   - Monthly income vs. expenses bar chart
   - Rent collection pie chart (paid vs. unpaid)
   - Utility allocation donut chart

#### API Endpoints
- `GET /api/dashboard/summary` - Get overall dashboard summary
- `GET /api/dashboard/rent-summary` - Get rent collection summary
- `GET /api/dashboard/utility-summary` - Get utility bills summary
- `GET /api/dashboard/expense-summary` - Get expenses summary

#### Business Logic
- Calculate total rent expected vs. collected
- Calculate total utility bills and allocation status
- Calculate total expenses by category
- Generate charts data

## 2. Shop Rental Module

### Features
- Tabular list of all shops
- Detailed shop profiles
- Rent payment history
- Utility bill allocations
- Document upload and management
- Search and filtering

### Implementation Details

#### Components
1. **ShopList.vue**
   - Display all shops in a sortable table
   - Include columns for name, tenant, monthly rent, status
   - Add quick actions (view details, add payment)

2. **ShopDetail.vue**
   - Display shop information
   - Show rent payment history
   - Show utility bill allocations
   - Display uploaded documents

3. **RentPaymentForm.vue**
   - Form for adding/editing rent payments
   - Include fields for amount, date, payment method, notes
   - Include document upload section

4. **DocumentUpload.vue (Reusable)**
   - Drag-and-drop file upload
   - Multiple file selection
   - Progress indicators
   - File type validation

#### Data Models
1. **Shop Model**
   ```javascript
   {
     id: Number,
     name: String,
     tenant_name: String,
     contact_info: String,
     monthly_rent: Decimal,
     status: String,
     created_at: DateTime,
     updated_at: DateTime
   }
   ```

2. **RentPayment Model**
   ```javascript
   {
     id: Number,
     entity_type: String, // 'shop' or 'apartment'
     entity_id: Number,
     amount: Decimal,
     payment_date: Date,
     paid_status: String,
     payment_method: String,
     notes: Text,
     doc_urls: JSON, // Array of document objects
     created_at: DateTime,
     updated_at: DateTime
   }
   ```

#### API Endpoints
- `GET /api/shops` - Get all shops
- `GET /api/shops/:id` - Get shop by ID
- `POST /api/shops` - Create new shop
- `PUT /api/shops/:id` - Update shop
- `DELETE /api/shops/:id` - Delete shop
- `GET /api/shops/:id/rent-payments` - Get rent payments for a shop
- `POST /api/shops/:id/rent-payments` - Add rent payment for a shop

#### Business Logic
- Calculate rent payment status (paid, partially paid, unpaid)
- Track payment history and generate receipts
- Manage document attachments for rent payments
- Implement search and filtering by shop name, tenant, date, payment status

## 3. Apartment Rental Module

### Features
- Overview of Apartments 1 and 2
- Booking management with check-in/check-out
- Guest information management
- Payment tracking
- Document upload and management
- Search and filtering

### Implementation Details

#### Components
1. **ApartmentList.vue**
   - Display all apartments with status
   - Show current/upcoming bookings
   - Include quick actions (view details, add booking)

2. **ApartmentDetail.vue**
   - Display apartment information
   - Show booking history
   - Show utility bill allocations
   - Display uploaded documents

3. **BookingForm.vue**
   - Form for adding/editing bookings
   - Include fields for guest name, contact info, check-in/check-out dates and times
   - Calculate amount based on duration
   - Include document upload section

4. **BookingHistory.vue**
   - Display booking history for an apartment
   - Include check-in/check-out times
   - Show payment status
   - Include document links

#### Data Models
1. **Apartment Model**
   ```javascript
   {
     id: Number,
     name: String,
     description: String,
     bedroom_count: Number,
     status: String,
     created_at: DateTime,
     updated_at: DateTime
   }
   ```

2. **ApartmentBooking Model**
   ```javascript
   {
     id: Number,
     apartment_id: Number,
     guest_name: String,
     contact_info: String,
     check_in_datetime: DateTime,
     check_out_datetime: DateTime,
     amount: Decimal,
     paid_status: String,
     notes: Text,
     doc_urls: JSON, // Array of document objects
     created_at: DateTime,
     updated_at: DateTime
   }
   ```

#### API Endpoints
- `GET /api/apartments` - Get all apartments
- `GET /api/apartments/:id` - Get apartment by ID
- `POST /api/apartments` - Create new apartment
- `PUT /api/apartments/:id` - Update apartment
- `DELETE /api/apartments/:id` - Delete apartment
- `GET /api/apartments/:id/bookings` - Get bookings for an apartment
- `POST /api/apartments/:id/bookings` - Add booking for an apartment
- `PUT /api/apartments/:id/bookings/:bookingId` - Update booking
- `DELETE /api/apartments/:id/bookings/:bookingId` - Delete booking

#### Business Logic
- Calculate booking duration and amount
- Track check-in and check-out times
- Manage document attachments for bookings
- Implement search and filtering by guest name, dates, payment status
- Prevent double-booking of apartments

## 4. Water Bill Module

### Features
- Monthly water bill entry
- Meter readings tracking
- Bill allocation to shops and apartments
- Document upload and management
- Search and filtering

### Implementation Details

#### Components
1. **WaterBillList.vue**
   - Display all water bills in a table
   - Include columns for billing period, units, amount, status
   - Add quick actions (view details, allocate)

2. **WaterBillForm.vue**
   - Form for adding/editing water bills
   - Include fields for meter readings, billing period, amount
   - Calculate units consumed automatically
   - Include document upload section

3. **AllocationForm.vue**
   - Form for allocating water bill to shops and apartments
   - Support equal or custom splits
   - Track allocation status

#### Data Models
1. **WaterBill Model**
   ```javascript
   {
     id: Number,
     meter_start: Decimal,
     meter_end: Decimal,
     units: Decimal,
     amount: Decimal,
     billing_start_date: Date,
     billing_end_date: Date,
     doc_urls: JSON, // Array of document objects
     status: String,
     created_at: DateTime,
     updated_at: DateTime
   }
   ```

2. **WaterBillAllocation Model**
   ```javascript
   {
     id: Number,
     waterbill_id: Number,
     entity_type: String, // 'shop' or 'apartment'
     entity_id: Number,
     amount_allocated: Decimal,
     paid_status: String,
     created_at: DateTime,
     updated_at: DateTime
   }
   ```

#### API Endpoints
- `GET /api/water-bills` - Get all water bills
- `GET /api/water-bills/:id` - Get water bill by ID
- `POST /api/water-bills` - Create new water bill
- `PUT /api/water-bills/:id` - Update water bill
- `DELETE /api/water-bills/:id` - Delete water bill
- `GET /api/water-bills/:id/allocations` - Get allocations for a water bill
- `POST /api/water-bills/:id/allocations` - Add allocation for a water bill

#### Business Logic
- Calculate units consumed from meter readings
- Allocate bill amounts to shops and apartments
- Track payment status for each allocation
- Manage document attachments for water bills
- Implement search and filtering by billing period, amount, status

## 5. Current Bill (Electricity) Module

### Features
- Monthly electricity bill entry
- Meter readings tracking
- Bill allocation to shops and apartments
- Document upload and management
- Search and filtering

### Implementation Details

#### Components
1. **CurrentBillList.vue**
   - Display all electricity bills in a table
   - Include columns for billing period, kWh, rate, amount, status
   - Add quick actions (view details, allocate)

2. **CurrentBillForm.vue**
   - Form for adding/editing electricity bills
   - Include fields for meter readings, rate per unit, billing period, amount
   - Calculate kWh consumed automatically
   - Include document upload section

3. **AllocationForm.vue**
   - Form for allocating electricity bill to shops and apartments
   - Support equal or custom splits
   - Track allocation status

#### Data Models
1. **CurrentBill Model**
   ```javascript
   {
     id: Number,
     meter_start: Decimal,
     meter_end: Decimal,
     kwh: Decimal,
     rate_per_unit: Decimal,
     amount: Decimal,
     billing_start_date: Date,
     billing_end_date: Date,
     doc_urls: JSON, // Array of document objects
     status: String,
     created_at: DateTime,
     updated_at: DateTime
   }
   ```

2. **CurrentBillAllocation Model**
   ```javascript
   {
     id: Number,
     currentbill_id: Number,
     entity_type: String, // 'shop' or 'apartment'
     entity_id: Number,
     amount_allocated: Decimal,
     paid_status: String,
     created_at: DateTime,
     updated_at: DateTime
   }
   ```

#### API Endpoints
- `GET /api/current-bills` - Get all electricity bills
- `GET /api/current-bills/:id` - Get electricity bill by ID
- `POST /api/current-bills` - Create new electricity bill
- `PUT /api/current-bills/:id` - Update electricity bill
- `DELETE /api/current-bills/:id` - Delete electricity bill
- `GET /api/current-bills/:id/allocations` - Get allocations for an electricity bill
- `POST /api/current-bills/:id/allocations` - Add allocation for an electricity bill

#### Business Logic
- Calculate kWh consumed from meter readings
- Calculate amount based on kWh and rate per unit
- Allocate bill amounts to shops and apartments
- Track payment status for each allocation
- Manage document attachments for electricity bills
- Implement search and filtering by billing period, amount, status

## 6. Other/External Expenses Module

### Features
- Record external expenses
- Support for recurring and one-time expenses
- Document upload and management
- Search and filtering

### Implementation Details

#### Components
1. **ExpenseList.vue**
   - Display all expenses in a table
   - Include columns for category, description, amount, date, status
   - Add quick actions (view details, edit, delete)

2. **ExpenseForm.vue**
   - Form for adding/editing expenses
   - Include fields for category, description, amount, date, recurring flag
   - Include document upload section

#### Data Model
1. **ExternalExpense Model**
   ```javascript
   {
     id: Number,
     category: String,
     description: String,
     amount: Decimal,
     recurring_flag: Boolean,
     expense_date: Date,
     paid_status: String,
     payment_method: String,
     doc_urls: JSON, // Array of document objects
     created_at: DateTime,
     updated_at: DateTime
   }
   ```

#### API Endpoints
- `GET /api/expenses` - Get all expenses
- `GET /api/expenses/:id` - Get expense by ID
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

#### Business Logic
- Track recurring expenses and generate reminders
- Categorize expenses for reporting
- Manage document attachments for expenses
- Implement search and filtering by category, date, amount, status

## 7. Reporting Module

### Features
- Generate monthly and annual reports
- Interactive charts and trend analysis
- Export reports
- Document access via links

### Implementation Details

#### Components
1. **MonthlyReport.vue**
   - Generate monthly income and expense report
   - Include rent collection, utility bills, and expenses
   - Display charts and tables

2. **AnnualReport.vue**
   - Generate annual income and expense report
   - Include yearly trends and comparisons
   - Display charts and tables

3. **ReportExport.vue**
   - Export reports to PDF or Excel
   - Include document links in exports

#### API Endpoints
- `GET /api/reports/monthly/:year/:month` - Get monthly report
- `GET /api/reports/annual/:year` - Get annual report
- `GET /api/reports/custom` - Get custom report (with query parameters)

#### Business Logic
- Aggregate data from all modules for reporting
- Calculate net income after expenses
- Generate charts and trend analysis
- Include links to supporting documents in reports

## 8. Document Upload and Management

### Features
- Multi-file upload
- Document preview
- Download and delete options
- Integration with all modules

### Implementation Details

#### Components
1. **DocumentUpload.vue**
   - Reusable component for file upload
   - Support drag-and-drop
   - Multiple file selection
   - Progress indicators

2. **DocumentPreview.vue**
   - Preview documents (PDF, images)
   - Download option
   - Delete option

#### API Endpoints
- `POST /api/documents/upload` - Upload document(s)
- `GET /api/documents/:id` - Get document by ID
- `DELETE /api/documents/:id` - Delete document

#### Business Logic
- Store documents in a structured directory system
- Generate unique filenames
- Track document metadata in the database
- Validate file types and sizes
- Implement access control for documents

## 9. Search and Filtering

### Features
- Comprehensive search across all modules
- Advanced filtering options
- Sorting capabilities
- Bulk actions

### Implementation Details

#### Components
1. **SearchFilter.vue**
   - Reusable search and filter component
   - Support for multiple filter criteria
   - Clear and apply filter buttons

#### API Endpoints
- Each module's GET endpoint should support query parameters for search and filtering

#### Business Logic
- Implement server-side search and filtering
- Support multiple filter criteria
- Implement sorting by various fields
- Support bulk actions for selected items

## 10. Authentication and User Management

### Features
- User registration and login
- Role-based access control
- User profile management

### Implementation Details

#### Components
1. **Login.vue**
   - Login form with username/email and password
   - Remember me option
   - Forgot password link

2. **Register.vue**
   - Registration form with username, email, password
   - Role selection (admin only)

3. **Profile.vue**
   - User profile management
   - Change password option

#### Data Model
1. **User Model**
   ```javascript
   {
     id: Number,
     username: String,
     email: String,
     password: String, // Hashed
     role: String,
     created_at: DateTime,
     updated_at: DateTime
   }
   ```

#### API Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

#### Business Logic
- Implement JWT authentication
- Hash passwords securely
- Implement role-based access control
- Validate user input