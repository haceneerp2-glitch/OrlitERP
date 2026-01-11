# Multilingual Support Setup Guide

## Overview
The application now supports three languages: **English**, **French**, and **Arabic** with full RTL (Right-to-Left) support for Arabic.

## Installation

First, install the required packages:

```bash
cd frontend
npm install i18next react-i18next i18next-browser-languagedetector
```

Or if using Docker:
```bash
docker-compose exec frontend npm install i18next react-i18next i18next-browser-languagedetector
```

## Structure

### Translation Files
All translation files are located in `frontend/src/i18n/locales/`:
- `en.json` - English translations
- `fr.json` - French translations  
- `ar.json` - Arabic translations

### Configuration
- `frontend/src/i18n/config.js` - i18next configuration
- Language detection from browser or localStorage
- Fallback to English if translation missing

## Usage

### In Components

```javascript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
    const { t, i18n } = useTranslation();
    
    return (
        <div>
            <h1>{t('customers.title')}</h1>
            <button>{t('common.save')}</button>
        </div>
    );
};
```

### Language Switcher
The `LanguageSwitcher` component is already integrated in:
- **Login page** - Top right corner
- **Sidebar** - Above logout button

To add it to other pages:
```javascript
import LanguageSwitcher from '../components/LanguageSwitcher';

<LanguageSwitcher />
```

## RTL Support

Arabic (ar) automatically enables RTL layout:
- Document direction changes to `rtl`
- CSS adjustments for proper text alignment
- Flexbox and margin utilities reversed

The Layout component automatically handles direction changes.

## Translation Keys

### Common Keys
- `common.save`, `common.cancel`, `common.delete`, `common.edit`
- `common.loading`, `common.required`, etc.

### Page-Specific Keys
Each module has its own namespace:
- `auth.*` - Authentication related
- `menu.*` - Navigation menu
- `customers.*`, `suppliers.*`, `items.*`, etc.

### Example Translation Structure
```json
{
  "customers": {
    "title": "Customers",
    "addCustomer": "Add Customer",
    "saveCustomer": "Save Customer",
    "createdSuccess": "Customer created successfully"
  }
}
```

## Updating Pages

### Step 1: Import useTranslation
```javascript
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();
```

### Step 2: Replace Hard-coded Strings
**Before:**
```javascript
<h2>Customers</h2>
<button>Add Customer</button>
```

**After:**
```javascript
<h2>{t('customers.title')}</h2>
<button>{t('customers.addCustomer')}</button>
```

### Step 3: Update Toast Messages
**Before:**
```javascript
addToast('Customer created successfully', 'success');
```

**After:**
```javascript
addToast(t('customers.createdSuccess'), 'success');
```

### Step 4: Update Form Labels
**Before:**
```javascript
<label>Full Name</label>
```

**After:**
```javascript
<label>{t('customers.fullName')}</label>
```

## Current Implementation Status

### ✅ Fully Translated
- Login page
- Sidebar/Navigation menu
- Language switcher component
- RTL support (CSS)

### 🔄 Partially Translated  
- Customers page (example implementation)
- Toast notifications (using translation keys)

### ⏳ Needs Translation
The following pages need translation keys applied:
- Dashboard
- Suppliers
- Items
- Products
- Employees
- Attendance
- Leave Requests
- Inventory Levels
- Stock Movements
- Orders
- Invoices
- Production

All translation keys are already defined in the JSON files - they just need to be applied to the components.

## Adding New Translation Keys

1. Add the key to all three language files (`en.json`, `fr.json`, `ar.json`)
2. Use the key in your component with `t('namespace.key')`
3. Follow the existing structure and naming conventions

### Example:
**en.json:**
```json
{
  "myModule": {
    "newKey": "New Text"
  }
}
```

**fr.json:**
```json
{
  "myModule": {
    "newKey": "Nouveau Texte"
  }
}
```

**ar.json:**
```json
{
  "myModule": {
    "newKey": "نص جديد"
  }
}
```

Then use: `t('myModule.newKey')`

## Testing

1. Change language using the language switcher
2. Verify all text changes
3. For Arabic, verify RTL layout works correctly
4. Check that toast messages appear in selected language
5. Verify form labels and placeholders translate

## Browser Language Detection

The app automatically detects the user's browser language on first visit and uses it if supported (en, fr, ar). The preference is saved in localStorage.

## Notes

- All translation files share the same structure
- Keys must be consistent across all three files
- Arabic text is right-to-left by default
- Language preference persists across sessions
- The app falls back to English if a translation key is missing



