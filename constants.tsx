
import { Category, Transaction, UserProfile, SavingsGoal, Budget, Note } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: '1', name: 'খাবার', color: '#ff4b5c', icon: 'fa-burger' },
  { id: '2', name: 'যাতায়াত', color: '#00d2ff', icon: 'fa-bus' },
  { id: '3', name: 'বাজার', color: '#a29bfe', icon: 'fa-basket-shopping' },
  { id: '4', name: 'বেতন', color: '#00b894', icon: 'fa-money-bill-wave' },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 't1', date: new Date().toISOString(), amount: 50000, category: 'বেতন', description: 'মাসিক বেতন', type: 'income' },
  { id: 't2', date: new Date().toISOString(), amount: 1200, category: 'খাবার', description: 'দুপুরের খাবার', type: 'expense' },
];

export const INITIAL_NOTES: Note[] = [
  { id: 'n1', title: 'বাজারের তালিকা', content: 'চাল, ডাল, তেল, লবণ আর কাঁচা মরিচ কিনতে হবে।', date: new Date().toISOString().split('T')[0], type: 'text' }
];

export const INITIAL_PROFILE: UserProfile = {
  name: 'ব্যবহারকারী',
  email: 'user@example.com',
  avatar: 'https://picsum.photos/seed/alex/200',
  currency: 'BDT',
};

export const INITIAL_GOALS: SavingsGoal[] = [
  { id: 'g1', name: 'নতুন বাইক', targetAmount: 250000, currentAmount: 50000, deadline: '2025-12-31' },
];

export const INITIAL_BUDGETS: Budget[] = [
  { categoryId: '1', limit: 10000, spent: 1200 },
];

export const POPULAR_CURRENCIES = [
  { code: 'BDT', symbol: '৳', name: 'Bangladesh Taka' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
];

export const POPULAR_LANGUAGES = [
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
];

export const CATEGORY_ICONS = [
  { icon: 'fa-burger', color: '#FF6B6B' },
  { icon: 'fa-bus', color: '#4D96FF' },
  { icon: 'fa-basket-shopping', color: '#6BCB77' },
  { icon: 'fa-bolt', color: '#FFD93D' },
  { icon: 'fa-shirt', color: '#FF8AAE' },
  { icon: 'fa-pills', color: '#00D7FF' },
  { icon: 'fa-graduation-cap', color: '#A29BFE' },
  { icon: 'fa-gamepad', color: '#6C5CE7' },
  { icon: 'fa-couch', color: '#E17055' },
  { icon: 'fa-dumbbell', color: '#2D3436' },
  { icon: 'fa-heart', color: '#D63031' },
  { icon: 'fa-gift', color: '#FAB1A0' },
  { icon: 'fa-briefcase', color: '#636E72' },
  { icon: 'fa-car-side', color: '#F9CA24' },
  { icon: 'fa-plane', color: '#22A6B3' },
  { icon: 'fa-laptop', color: '#BE2EDD' },
  { icon: 'fa-utensils', color: '#EB4D4B' },
  { icon: 'fa-house', color: '#7ED6DF' },
  { icon: 'fa-stethoscope', color: '#BADC58' },
  { icon: 'fa-mobile-screen', color: '#F0932B' },
  { icon: 'fa-paw', color: '#535C68' },
  { icon: 'fa-coffee', color: '#95AFC0' },
  { icon: 'fa-gas-pump', color: '#FFBE76' },
  { icon: 'fa-tv', color: '#686DE0' },
  { icon: 'fa-camera', color: '#4834D4' },
  { icon: 'fa-bicycle', color: '#BADC58' },
  { icon: 'fa-book', color: '#7ED6DF' },
  { icon: 'fa-wallet', color: '#F0932B' },
  { icon: 'fa-shop', color: '#FF7979' },
  { icon: 'fa-microchip', color: '#22A6B3' }
];

export const TRANSLATIONS: Record<string, any> = {
  en: {
    dashboard: "Home",
    transactions: "Transactions",
    budgets: "Budgets",
    categories: "Categories",
    reports: "Reports",
    notes: "Notes",
    cloudSync: "Sync",
    totalBalance: "Total Balance",
    expenses: "Expenses",
    recentActivities: "Activity",
    addTransaction: "Add Record",
    income: "Income",
    expense: "Expense",
    amount: "Amount",
    description: "Description",
    date: "Date",
    category: "Category",
    save: "Save",
    cancel: "Cancel",
    search: "Search...",
    deleteConfirm: "Delete this record?",
    currency: "Currency",
    language: "Language",
  },
  bn: {
    dashboard: "হোম",
    transactions: "লেনদেন",
    budgets: "বাজেট",
    categories: "ক্যাটেগরি",
    reports: "রিপোর্ট",
    notes: "নোট",
    cloudSync: "সিঙ্ক",
    totalBalance: "ব্যালেন্স",
    expenses: "খরচ",
    recentActivities: "সাম্প্রতিক",
    addTransaction: "নতুন যোগ",
    income: "আয়",
    expense: "ব্যয়",
    amount: "পরিমাণ",
    description: "বিবরণ",
    date: "তারিখ",
    category: "শ্রেণী",
    save: "সেভ",
    cancel: "বাতিল",
    search: "খুঁজুন...",
    deleteConfirm: "মুছে ফেলবেন?",
    currency: "কারেন্সি",
    language: "ভাষা",
  },
  hi: {
    dashboard: "होम",
    transactions: "लेनदेन",
    budgets: "बजट",
    categories: "श्रेणियाँ",
    reports: "रिपोर्ट",
    notes: "नोट्स",
    cloudSync: "सिंक",
    totalBalance: "कुल शेष",
    expenses: "खर्च",
    recentActivities: "हाल ही में",
    addTransaction: "नया जोड़ें",
    income: "आय",
    expense: "व्यय",
    save: "सहेजें",
    cancel: "रद्द करें",
    currency: "मुद्रा",
    language: "भाषा",
  },
  es: {
    dashboard: "Inicio",
    transactions: "Transacciones",
    budgets: "Presupuestos",
    categories: "Categorías",
    reports: "Informes",
    notes: "Notas",
    cloudSync: "Sincronización",
    totalBalance: "Saldo Total",
    income: "Ingreso",
    expense: "Gasto",
    save: "Guardar",
    cancel: "Cancelar",
    currency: "Moneda",
    language: "Idioma",
  },
  ar: {
    dashboard: "الرئيسية",
    transactions: "المعاملات",
    budgets: "الميزانيات",
    categories: "الفئات",
    reports: "التقارير",
    notes: "ملاحظات",
    cloudSync: "مزامنة",
    totalBalance: "إجمالي الرصيد",
    income: "دخل",
    expense: "مصروف",
    save: "حفظ",
    cancel: "إلغاء",
    currency: "العملة",
    language: "اللغة",
  },
  fr: {
    dashboard: "Accueil",
    transactions: "Transactions",
    budgets: "Budgets",
    categories: "Catégories",
    reports: "Rapports",
    notes: "Notes",
    cloudSync: "Sync",
    totalBalance: "Solde Total",
    income: "Revenu",
    expense: "Dépense",
    save: "Enregistrer",
    cancel: "Annuler",
    currency: "Devise",
    language: "Langue",
  }
};
