/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'ar' | 'en' | 'nl' | 'ku';

interface Translations {
  [key: string]: {
    ar: string;
    en: string;
    nl: string;
    ku: string;
  };
}

const translations: Translations = {
  // General
  'app.title': {
    ar: 'مخبز الملكة',
    en: 'Al-Queen Bakery',
    nl: 'Al-Queen Bakkerij',
    ku: 'نووشترگەی ملکە',
  },
  'app.subtitle': {
    ar: 'الخبز السوري الأصيل في هولندا',
    en: 'Authentic Syrian Bread in the Netherlands',
    nl: 'Authentieke Syrische Brood in Nederland',
    ku: 'نانی سوری ڕاستەقینە لە هۆڵەندا',
  },
  'app.dashboard': {
    ar: 'لوحة التحكم',
    en: 'Dashboard',
    nl: 'Dashboard',
    ku: 'داشبۆرد',
  },
  'app.driverApp': {
    ar: 'تطبيق السائق',
    en: 'Driver App',
    nl: 'Chauffeur App',
    ku: 'ئەپی شۆفێر',
  },
  'app.admin': {
    ar: 'الإدارة',
    en: 'Admin',
    nl: 'Beheer',
    ku: 'بەڕێوەبەری',
  },
  
  // Navigation
  'nav.orders': {
    ar: 'الطلبات',
    en: 'Orders',
    nl: 'Bestellingen',
    ku: 'داواکارییەکان',
  },
  'nav.products': {
    ar: 'المنتجات',
    en: 'Products',
    nl: 'Producten',
    ku: 'بەرهەمەکان',
  },
  'nav.drivers': {
    ar: 'السائقين',
    en: 'Drivers',
    nl: 'Chauffeurs',
    ku: 'شۆفێرەکان',
  },
  'nav.deliveryLines': {
    ar: 'خطوط التوزيع',
    en: 'Delivery Lines',
    nl: 'Bezorgroutes',
    ku: 'هێڵەکانی دابەشکردن',
  },
  'nav.inventory': {
    ar: 'المخزون',
    en: 'Inventory',
    nl: 'Voorraad',
    ku: 'کۆگا',
  },
  'nav.settings': {
    ar: 'الإعدادات',
    en: 'Settings',
    nl: 'Instellingen',
    ku: 'ڕێکخستنەکان',
  },
  'nav.vehicles': {
    ar: 'المركبات',
    en: 'Vehicles',
    nl: 'Voertuigen',
    ku: 'ئۆتۆمبێلەکان',
  },
  'nav.aiPredictions': {
    ar: 'الذكاء الاصطناعي',
    en: 'AI & Predictions',
    nl: 'AI & Voorspellingen',
    ku: 'ژیرەکاری و پێشبینی',
  },
  'nav.customers': {
    ar: 'العملاء',
    en: 'Customers',
    nl: 'Klanten',
    ku: 'کڕیارەکان',
  },
  'nav.webshop': {
    ar: 'متجر العملاء',
    en: 'Webshop',
    nl: 'Webshop',
    ku: 'دوکان',
  },
  'nav.integrations': {
    ar: 'التكاملات',
    en: 'Integrations',
    nl: 'Integraties',
    ku: 'یەکگرتنەکان',
  },
  'nav.preorders': {
    ar: 'الطلبات المسبقة',
    en: 'Pre-Orders',
    nl: 'Voorbestellingen',
    ku: 'داواکاری پێشوەخت',
  },
  
  // Vehicles
  'vehicles.title': {
    ar: 'إدارة المركبات',
    en: 'Vehicle Management',
    nl: 'Voertuigbeheer',
    ku: 'بەڕێوەبردنی ئۆتۆمبێل',
  },
  'vehicles.dashboard': {
    ar: 'لوحة المركبات',
    en: 'Vehicle Dashboard',
    nl: 'Voertuig Dashboard',
    ku: 'داشبۆردی ئۆتۆمبێل',
  },
  'vehicles.registry': {
    ar: 'سجل المركبات',
    en: 'Vehicle Registry',
    nl: 'Voertuigregister',
    ku: 'تۆماری ئۆتۆمبێل',
  },
  'vehicles.maintenance': {
    ar: 'الصيانة',
    en: 'Maintenance',
    nl: 'Onderhoud',
    ku: 'چاککردنەوە',
  },
  'vehicles.fuel': {
    ar: 'الوقود',
    en: 'Fuel',
    nl: 'Brandstof',
    ku: 'سوتەمەنی',
  },
  'vehicles.insurance': {
    ar: 'التأمين',
    en: 'Insurance',
    nl: 'Verzekering',
    ku: 'بیمە',
  },
  'vehicles.expenses': {
    ar: 'المصاريف',
    en: 'Expenses',
    nl: 'Kosten',
    ku: 'خەرجییەکان',
  },
  'vehicles.add': {
    ar: 'إضافة مركبة',
    en: 'Add Vehicle',
    nl: 'Voertuig Toevoegen',
    ku: 'زیادکردنی ئۆتۆمبێل',
  },
  'vehicles.edit': {
    ar: 'تعديل المركبة',
    en: 'Edit Vehicle',
    nl: 'Voertuig Bewerken',
    ku: 'دەستکاریکردنی ئۆتۆمبێل',
  },
  'vehicles.plateNumber': {
    ar: 'رقم اللوحة',
    en: 'Plate Number',
    nl: 'Kenteken',
    ku: 'ژمارەی پلاکە',
  },
  'vehicles.type': {
    ar: 'النوع',
    en: 'Type',
    nl: 'Type',
    ku: 'جۆر',
  },
  'vehicles.brand': {
    ar: 'الشركة المصنعة',
    en: 'Brand',
    nl: 'Merk',
    ku: 'مۆدێل',
  },
  'vehicles.model': {
    ar: 'الموديل',
    en: 'Model',
    nl: 'Model',
    ku: 'مۆدێل',
  },
  'vehicles.year': {
    ar: 'سنة الصنع',
    en: 'Year',
    nl: 'Bouwjaar',
    ku: 'ساڵی دروستکردن',
  },
  'vehicles.color': {
    ar: 'اللون',
    en: 'Color',
    nl: 'Kleur',
    ku: 'ڕەنگ',
  },
  'vehicles.fuelType': {
    ar: 'نوع الوقود',
    en: 'Fuel Type',
    nl: 'Brandstoftype',
    ku: 'جۆری سوتەمەنی',
  },
  'vehicles.mileage': {
    ar: 'المسافة المقطوعة',
    en: 'Mileage',
    nl: 'Kilometerstand',
    ku: 'مەسافە',
  },
  'vehicles.capacity': {
    ar: 'السعة',
    en: 'Capacity',
    nl: 'Capaciteit',
    ku: 'لەچاو',
  },
  'vehicles.active': {
    ar: 'نشط',
    en: 'Active',
    nl: 'Actief',
    ku: 'چالاک',
  },
  'vehicles.inactive': {
    ar: 'غير نشط',
    en: 'Inactive',
    nl: 'Inactief',
    ku: 'ناچالاک',
  },
  'vehicles.totalFleet': {
    ar: 'إجمالي الأسطول',
    en: 'Total Fleet',
    nl: 'Totaal Wagenpark',
    ku: 'کۆی گشتی',
  },
  'vehicles.activeVehicles': {
    ar: 'المركبات النشطة',
    en: 'Active Vehicles',
    nl: 'Actieve Voertuigen',
    ku: 'ئۆتۆمبێلە چالاکەکان',
  },
  'vehicles.needMaintenance': {
    ar: 'تحتاج صيانة',
    en: 'Need Maintenance',
    nl: 'Onderhoud Nodig',
    ku: 'پێویستی بە چاککردنەوە',
  },
  'vehicles.totalMileage': {
    ar: 'إجمالي المسافة',
    en: 'Total Mileage',
    nl: 'Totale Kilometers',
    ku: 'کۆی مەسافە',
  },
  
  // Maintenance
  'maintenance.title': {
    ar: 'سجلات الصيانة',
    en: 'Maintenance Records',
    nl: 'Onderhoudsrecords',
    ku: 'تۆمارەکانی چاککردنەوە',
  },
  'maintenance.add': {
    ar: 'إضافة سجل صيانة',
    en: 'Add Maintenance',
    nl: 'Onderhoud Toevoegen',
    ku: 'زیادکردنی چاککردنەوە',
  },
  'maintenance.type': {
    ar: 'نوع الصيانة',
    en: 'Maintenance Type',
    nl: 'Onderhoudstype',
    ku: 'جۆری چاککردنەوە',
  },
  'maintenance.routine': {
    ar: 'صيانة دورية',
    en: 'Routine',
    nl: 'Routine',
    ku: 'چاککردنەوەی خولی',
  },
  'maintenance.repair': {
    ar: 'إصلاح',
    en: 'Repair',
    nl: 'Reparatie',
    ku: 'چاککردنەوە',
  },
  'maintenance.emergency': {
    ar: 'طوارئ',
    en: 'Emergency',
    nl: 'Noodgeval',
    ku: 'لەناکاو',
  },
  'maintenance.description': {
    ar: 'الوصف',
    en: 'Description',
    nl: 'Beschrijving',
    ku: 'وەسف',
  },
  'maintenance.cost': {
    ar: 'التكلفة',
    en: 'Cost',
    nl: 'Kosten',
    ku: 'تێچوو',
  },
  'maintenance.garage': {
    ar: 'الورشة',
    en: 'Garage',
    nl: 'Garage',
    ku: 'کارگە',
  },
  'maintenance.startDate': {
    ar: 'تاريخ البدء',
    en: 'Start Date',
    nl: 'Startdatum',
    ku: 'بەرواری دەستپێکردن',
  },
  'maintenance.endDate': {
    ar: 'تاريخ الانتهاء',
    en: 'End Date',
    nl: 'Einddatum',
    ku: 'بەرواری کۆتایی',
  },
  'maintenance.status': {
    ar: 'الحالة',
    en: 'Status',
    nl: 'Status',
    ku: 'دۆخ',
  },
  'maintenance.scheduled': {
    ar: 'مجدول',
    en: 'Scheduled',
    nl: 'Gepland',
    ku: 'بەرنامەڕێزیکراو',
  },
  'maintenance.inProgress': {
    ar: 'قيد التنفيذ',
    en: 'In Progress',
    nl: 'In Uitvoering',
    ku: 'لە جێبەجێکردندا',
  },
  'maintenance.completed': {
    ar: 'مكتمل',
    en: 'Completed',
    nl: 'Voltooid',
    ku: 'تەواوبوو',
  },
  'maintenance.upcoming': {
    ar: 'الصيانة القادمة',
    en: 'Upcoming Maintenance',
    nl: 'Aankomend Onderhoud',
    ku: 'چاککردنەوەی داهاتوو',
  },
  'maintenance.totalCost': {
    ar: 'إجمالي تكاليف الصيانة',
    en: 'Total Maintenance Cost',
    nl: 'Totale Onderhoudskosten',
    ku: 'کۆی تێچووی چاککردنەوە',
  },
  
  // Fuel
  'fuel.title': {
    ar: 'سجلات الوقود',
    en: 'Fuel Records',
    nl: 'Brandstofrecords',
    ku: 'تۆمارەکانی سوتەمەنی',
  },
  'fuel.add': {
    ar: 'إضافة سجل وقود',
    en: 'Add Fuel Record',
    nl: 'Brandstof Toevoegen',
    ku: 'زیادکردنی تۆماری سوتەمەنی',
  },
  'fuel.quantity': {
    ar: 'الكمية (لتر)',
    en: 'Quantity (L)',
    nl: 'Hoeveelheid (L)',
    ku: 'بڕ (لیتر)',
  },
  'fuel.pricePerLiter': {
    ar: 'السعر للتر',
    en: 'Price per Liter',
    nl: 'Prijs per Liter',
    ku: 'نرخی لیتر',
  },
  'fuel.totalCost': {
    ar: 'التكلفة الإجمالية',
    en: 'Total Cost',
    nl: 'Totale Kosten',
    ku: 'تێچووی گشتی',
  },
  'fuel.station': {
    ar: 'المحطة',
    en: 'Station',
    nl: 'Station',
    ku: 'وێستگە',
  },
  'fuel.date': {
    ar: 'التاريخ',
    en: 'Date',
    nl: 'Datum',
    ku: 'بەروار',
  },
  'fuel.totalFuel': {
    ar: 'إجمالي الوقود',
    en: 'Total Fuel',
    nl: 'Totale Brandstof',
    ku: 'کۆی سوتەمەنی',
  },
  'fuel.avgConsumption': {
    ar: 'متوسط الاستهلاك',
    en: 'Avg Consumption',
    nl: 'Gemiddeld Verbruik',
    ku: 'تێکڕای بەکارهێنان',
  },
  'fuel.costPerKm': {
    ar: 'التكلفة لكل كم',
    en: 'Cost per Km',
    nl: 'Kosten per Km',
    ku: 'تێچوو بە کیلۆمەتر',
  },
  
  // Insurance
  'insurance.title': {
    ar: 'سجلات التأمين',
    en: 'Insurance Records',
    nl: 'Verzekeringsrecords',
    ku: 'تۆمارەکانی بیمە',
  },
  'insurance.add': {
    ar: 'إضافة تأمين',
    en: 'Add Insurance',
    nl: 'Verzekering Toevoegen',
    ku: 'زیادکردنی بیمە',
  },
  'insurance.provider': {
    ar: 'شركة التأمين',
    en: 'Insurance Provider',
    nl: 'Verzekeringsmaatschappij',
    ku: 'کۆمپانیای بیمە',
  },
  'insurance.policyNumber': {
    ar: 'رقم البوليصة',
    en: 'Policy Number',
    nl: 'Polisnummer',
    ku: 'ژمارەی بیمە',
  },
  'insurance.type': {
    ar: 'نوع التأمين',
    en: 'Insurance Type',
    nl: 'Verzekeringstype',
    ku: 'جۆری بیمە',
  },
  'insurance.liability': {
    ar: 'مسؤولية',
    en: 'Liability',
    nl: 'Aansprakelijkheid',
    ku: 'بەرپرسیارێتی',
  },
  'insurance.comprehensive': {
    ar: 'شامل',
    en: 'Comprehensive',
    nl: 'Allrisk',
    ku: 'گشتی',
  },
  'insurance.thirdParty': {
    ar: 'تجاه الغير',
    en: 'Third Party',
    nl: 'Derden',
    ku: 'لایەنی سێیەم',
  },
  'insurance.startDate': {
    ar: 'تاريخ البدء',
    en: 'Start Date',
    nl: 'Startdatum',
    ku: 'بەرواری دەستپێکردن',
  },
  'insurance.endDate': {
    ar: 'تاريخ الانتهاء',
    en: 'End Date',
    nl: 'Einddatum',
    ku: 'بەرواری کۆتایی',
  },
  'insurance.premium': {
    ar: 'القسط',
    en: 'Premium',
    nl: 'Premie',
    ku: 'پریمیەم',
  },
  'insurance.active': {
    ar: 'ساري',
    en: 'Active',
    nl: 'Actief',
    ku: 'چالاک',
  },
  'insurance.expired': {
    ar: 'منتهي',
    en: 'Expired',
    nl: 'Verlopen',
    ku: 'بەسەرچوو',
  },
  'insurance.expiringSoon': {
    ar: 'ينتهي قريباً',
    en: 'Expiring Soon',
    nl: 'Verloopt Binnenkort',
    ku: 'بەم زووانە کۆتایی دێت',
  },
  
  // Expenses
  'expenses.title': {
    ar: 'مصاريف المركبات',
    en: 'Vehicle Expenses',
    nl: 'Voertuigkosten',
    ku: 'خەرجییەکانی ئۆتۆمبێل',
  },
  'expenses.add': {
    ar: 'إضافة مصروف',
    en: 'Add Expense',
    nl: 'Kosten Toevoegen',
    ku: 'زیادکردنی خەرجی',
  },
  'expenses.type': {
    ar: 'نوع المصروف',
    en: 'Expense Type',
    nl: 'Kostentype',
    ku: 'جۆری خەرجی',
  },
  'expenses.amount': {
    ar: 'المبلغ',
    en: 'Amount',
    nl: 'Bedrag',
    ku: 'بڕ',
  },
  'expenses.totalExpenses': {
    ar: 'إجمالي المصاريف',
    en: 'Total Expenses',
    nl: 'Totale Kosten',
    ku: 'کۆی خەرجییەکان',
  },
  'expenses.byVehicle': {
    ar: 'حسب المركبة',
    en: 'By Vehicle',
    nl: 'Per Voertuig',
    ku: 'بەپێی ئۆتۆمبێل',
  },
  'expenses.byType': {
    ar: 'حسب النوع',
    en: 'By Type',
    nl: 'Per Type',
    ku: 'بەپێی جۆر',
  },
  'expenses.parking': {
    ar: 'وقوف',
    en: 'Parking',
    nl: 'Parkeren',
    ku: 'وەستاندن',
  },
  'expenses.toll': {
    ar: 'رسوم',
    en: 'Toll',
    nl: 'Tol',
    ku: 'باج',
  },
  'expenses.other': {
    ar: 'أخرى',
    en: 'Other',
    nl: 'Overig',
    ku: 'هیتر',
  },
  
  // Vehicle Types
  'vehicleType.car': {
    ar: 'سيارة',
    en: 'Car',
    nl: 'Auto',
    ku: 'ئۆتۆمبێل',
  },
  'vehicleType.van': {
    ar: 'شاحنة صغيرة',
    en: 'Van',
    nl: 'Bestelauto',
    ku: 'ڤان',
  },
  'vehicleType.truck': {
    ar: 'شاحنة',
    en: 'Truck',
    nl: 'Vrachtwagen',
    ku: 'تراق',
  },
  'vehicleType.motorcycle': {
    ar: 'دراجة نارية',
    en: 'Motorcycle',
    nl: 'Motorfiets',
    ku: 'مۆتۆڕ',
  },
  'vehicleType.bicycle': {
    ar: 'دراجة هوائية',
    en: 'Bicycle',
    nl: 'Fiets',
    ku: 'بایسکل',
  },
  
  // Fuel Types
  'fuelType.petrol': {
    ar: 'بنزين',
    en: 'Petrol',
    nl: 'Benzine',
    ku: 'بەنزین',
  },
  'fuelType.diesel': {
    ar: 'ديزل',
    en: 'Diesel',
    nl: 'Diesel',
    ku: 'دیزل',
  },
  'fuelType.electric': {
    ar: 'كهربائي',
    en: 'Electric',
    nl: 'Elektrisch',
    ku: 'کارەبایی',
  },
  'fuelType.hybrid': {
    ar: 'هجين',
    en: 'Hybrid',
    nl: 'Hybride',
    ku: 'هاوبەش',
  },
  
  // Assign Driver
  'vehicles.assignDriver': {
    ar: 'تعيين سائق',
    en: 'Assign Driver',
    nl: 'Chauffeur Toewijzen',
    ku: 'دەستنیشانکردنی شۆفێر',
  },
  'vehicles.assignedDriver': {
    ar: 'السائق المعين',
    en: 'Assigned Driver',
    nl: 'Toegewezen Chauffeur',
    ku: 'شۆفێری دەستنیشانکراو',
  },
  'vehicles.noDriver': {
    ar: 'لا يوجد سائق',
    en: 'No Driver Assigned',
    nl: 'Geen Chauffeur Toegewezen',
    ku: 'هیچ شۆفێرێک نییە',
  },
  
  // Orders
  'orders.title': {
    ar: 'إدارة الطلبات',
    en: 'Order Management',
    nl: 'Bestellingbeheer',
    ku: 'بەڕێوەبردنی داواکاری',
  },
  'orders.new': {
    ar: 'طلب جديد',
    en: 'New Order',
    nl: 'Nieuwe Bestelling',
    ku: 'داواکاری نوێ',
  },
  'orders.pending': {
    ar: 'قيد الانتظار',
    en: 'Pending',
    nl: 'In afwachting',
    ku: 'لە چاوەڕوانیدا',
  },
  'orders.confirmed': {
    ar: 'مؤكد',
    en: 'Confirmed',
    nl: 'Bevestigd',
    ku: 'پشتڕاستکراوە',
  },
  'orders.inDelivery': {
    ar: 'قيد التوصيل',
    en: 'In Delivery',
    nl: 'In bezorging',
    ku: 'لە ڕێگەدا',
  },
  'orders.delivered': {
    ar: 'تم التوصيل',
    en: 'Delivered',
    nl: 'Bezorgd',
    ku: 'گەیشت',
  },
  'orders.cancelled': {
    ar: 'ملغي',
    en: 'Cancelled',
    nl: 'Geannuleerd',
    ku: 'هەڵوەشاوە',
  },
  'orders.orderNumber': {
    ar: 'رقم الطلب',
    en: 'Order Number',
    nl: 'Bestelnummer',
    ku: 'ژمارەی داواکاری',
  },
  'orders.customer': {
    ar: 'العميل',
    en: 'Customer',
    nl: 'Klant',
    ku: 'کڕیار',
  },
  'orders.driver': {
    ar: 'السائق',
    en: 'Driver',
    nl: 'Chauffeur',
    ku: 'شۆفێر',
  },
  'orders.total': {
    ar: 'المجموع',
    en: 'Total',
    nl: 'Totaal',
    ku: 'کۆ',
  },
  'orders.status': {
    ar: 'الحالة',
    en: 'Status',
    nl: 'Status',
    ku: 'دۆخ',
  },
  'orders.date': {
    ar: 'التاريخ',
    en: 'Date',
    nl: 'Datum',
    ku: 'بەروار',
  },
  'orders.time': {
    ar: 'الوقت',
    en: 'Time',
    nl: 'Tijd',
    ku: 'کات',
  },
  'orders.notes': {
    ar: 'ملاحظات',
    en: 'Notes',
    nl: 'Notities',
    ku: 'تێبینییەکان',
  },
  'orders.items': {
    ar: 'المنتجات',
    en: 'Items',
    nl: 'Artikelen',
    ku: 'بابەتەکان',
  },
  'orders.quantity': {
    ar: 'الكمية',
    en: 'Quantity',
    nl: 'Hoeveelheid',
    ku: 'بڕ',
  },
  'orders.price': {
    ar: 'السعر',
    en: 'Price',
    nl: 'Prijs',
    ku: 'نرخ',
  },
  
  // Products
  'products.title': {
    ar: 'إدارة المنتجات',
    en: 'Product Management',
    nl: 'Productbeheer',
    ku: 'بەڕێوەبردنی بەرهەم',
  },
  'products.add': {
    ar: 'إضافة منتج',
    en: 'Add Product',
    nl: 'Product Toevoegen',
    ku: 'زیادکردنی بەرهەم',
  },
  'products.edit': {
    ar: 'تعديل المنتج',
    en: 'Edit Product',
    nl: 'Product Bewerken',
    ku: 'دەستکاریکردنی بەرهەم',
  },
  'products.nameAr': {
    ar: 'الاسم بالعربية',
    en: 'Arabic Name',
    nl: 'Arabische Naam',
    ku: 'ناو بە عەرەبی',
  },
  'products.nameEn': {
    ar: 'الاسم بالإنجليزية',
    en: 'English Name',
    nl: 'Engelse Naam',
    ku: 'ناو بە ئینگلیزی',
  },
  'products.nameNl': {
    ar: 'الاسم بالهولندية',
    en: 'Dutch Name',
    nl: 'Nederlandse Naam',
    ku: 'ناو بە هۆڵەندی',
  },
  'products.nameKu': {
    ar: 'الاسم بالكردية',
    en: 'Kurdish Name',
    nl: 'Koerdische Naam',
    ku: 'ناو بە کوردی',
  },
  'products.description': {
    ar: 'الوصف',
    en: 'Description',
    nl: 'Beschrijving',
    ku: 'وەسف',
  },
  'products.category': {
    ar: 'الفئة',
    en: 'Category',
    nl: 'Categorie',
    ku: 'پۆل',
  },
  'products.bread': {
    ar: 'خبز',
    en: 'Bread',
    nl: 'Brood',
    ku: 'نان',
  },
  'products.pastry': {
    ar: 'معجنات',
    en: 'Pastry',
    nl: 'Gebak',
    ku: 'شیرینی',
  },
  'products.sweets': {
    ar: 'حلويات',
    en: 'Sweets',
    nl: 'Zoetigheden',
    ku: 'شەکرە',
  },
  'products.stock': {
    ar: 'المخزون',
    en: 'Stock',
    nl: 'Voorraad',
    ku: 'کۆگا',
  },
  'products.active': {
    ar: 'نشط',
    en: 'Active',
    nl: 'Actief',
    ku: 'چالاک',
  },
  
  // Drivers
  'drivers.title': {
    ar: 'إدارة السائقين',
    en: 'Driver Management',
    nl: 'Chauffeursbeheer',
    ku: 'بەڕێوەبردنی شۆفێر',
  },
  'drivers.add': {
    ar: 'إضافة سائق',
    en: 'Add Driver',
    nl: 'Chauffeur Toevoegen',
    ku: 'زیادکردنی شۆفێر',
  },
  'drivers.name': {
    ar: 'الاسم',
    en: 'Name',
    nl: 'Naam',
    ku: 'ناو',
  },
  'drivers.phone': {
    ar: 'الهاتف',
    en: 'Phone',
    nl: 'Telefoon',
    ku: 'مۆبایل',
  },
  'drivers.email': {
    ar: 'البريد الإلكتروني',
    en: 'Email',
    nl: 'E-mail',
    ku: 'ئیمەیڵ',
  },
  'drivers.line': {
    ar: 'خط التوزيع',
    en: 'Delivery Line',
    nl: 'Bezorgroute',
    ku: 'هێڵی دابەشکردن',
  },
  'drivers.location': {
    ar: 'الموقع الحالي',
    en: 'Current Location',
    nl: 'Huidige Locatie',
    ku: 'شوێنی ئێستا',
  },
  'drivers.activeOrders': {
    ar: 'الطلبات النشطة',
    en: 'Active Orders',
    nl: 'Actieve Bestellingen',
    ku: 'داواکارییە چالاکەکان',
  },
  
  // Delivery Lines
  'lines.title': {
    ar: 'خطوط التوزيع',
    en: 'Delivery Lines',
    nl: 'Bezorgroutes',
    ku: 'هێڵەکانی دابەشکردن',
  },
  'lines.add': {
    ar: 'إضافة خط',
    en: 'Add Line',
    nl: 'Route Toevoegen',
    ku: 'زیادکردنی هێڵ',
  },
  'lines.region': {
    ar: 'المنطقة',
    en: 'Region',
    nl: 'Regio',
    ku: 'ناوچە',
  },
  
  // Inventory
  'inventory.title': {
    ar: 'إدارة المخزون',
    en: 'Inventory Management',
    nl: 'Voorraadbeheer',
    ku: 'بەڕێوەبردنی کۆگا',
  },
  'inventory.lowStock': {
    ar: 'مخزون منخفض',
    en: 'Low Stock',
    nl: 'Lage Voorraad',
    ku: 'کۆگا کەم',
  },
  'inventory.update': {
    ar: 'تحديث المخزون',
    en: 'Update Stock',
    nl: 'Voorraad Bijwerken',
    ku: 'نوێکردنەوەی کۆگا',
  },
  
  // Actions
  'actions.save': {
    ar: 'حفظ',
    en: 'Save',
    nl: 'Opslaan',
    ku: 'پاشەکەوتکردن',
  },
  'actions.cancel': {
    ar: 'إلغاء',
    en: 'Cancel',
    nl: 'Annuleren',
    ku: 'هەڵوەشاندنەوە',
  },
  'actions.delete': {
    ar: 'حذف',
    en: 'Delete',
    nl: 'Verwijderen',
    ku: 'سڕینەوە',
  },
  'actions.edit': {
    ar: 'تعديل',
    en: 'Edit',
    nl: 'Bewerken',
    ku: 'دەستکاریکردن',
  },
  'actions.view': {
    ar: 'عرض',
    en: 'View',
    nl: 'Bekijken',
    ku: 'بینین',
  },
  'actions.search': {
    ar: 'بحث',
    en: 'Search',
    nl: 'Zoeken',
    ku: 'گەڕان',
  },
  'actions.filter': {
    ar: 'تصفية',
    en: 'Filter',
    nl: 'Filteren',
    ku: 'فلتەر',
  },
  'actions.refresh': {
    ar: 'تحديث',
    en: 'Refresh',
    nl: 'Vernieuwen',
    ku: 'نوێکردنەوە',
  },
  'actions.confirm': {
    ar: 'تأكيد',
    en: 'Confirm',
    nl: 'Bevestigen',
    ku: 'پشتڕاستکردن',
  },
  'actions.deliver': {
    ar: 'توصيل',
    en: 'Deliver',
    nl: 'Bezorgen',
    ku: 'گەیاندن',
  },
  'actions.markDelivered': {
    ar: 'تحديد كمُسلَّم',
    en: 'Mark as Delivered',
    nl: 'Markeren als Bezorgd',
    ku: 'وەک گەیشتوو نیشانکردن',
  },
  'actions.markReceived': {
    ar: 'تحديد كمُستلَم',
    en: 'Mark as Received',
    nl: 'Markeren als Ontvangen',
    ku: 'وەک وەرگیراو نیشانکردن',
  },
  
  // Stats
  'stats.todayOrders': {
    ar: 'طلبات اليوم',
    en: "Today's Orders",
    nl: 'Bestellingen Vandaag',
    ku: 'داواکارییەکانی ئەمڕۆ',
  },
  'stats.pendingOrders': {
    ar: 'طلبات معلقة',
    en: 'Pending Orders',
    nl: 'Openstaande Bestellingen',
    ku: 'داواکارییەکان لە چاوەڕوانیدا',
  },
  'stats.inDelivery': {
    ar: 'قيد التوصيل',
    en: 'In Delivery',
    nl: 'In Bezorging',
    ku: 'لە ڕێگەدا',
  },
  'stats.totalRevenue': {
    ar: 'إجمالي الإيرادات',
    en: 'Total Revenue',
    nl: 'Totale Omzet',
    ku: 'کۆی داهات',
  },
  
  // Messages
  'messages.noData': {
    ar: 'لا توجد بيانات',
    en: 'No data available',
    nl: 'Geen gegevens beschikbaar',
    ku: 'هیچ داتایەک نییە',
  },
  'messages.loading': {
    ar: 'جاري التحميل...',
    en: 'Loading...',
    nl: 'Laden...',
    ku: 'بارکردن...',
  },
  'messages.success': {
    ar: 'تم بنجاح',
    en: 'Success',
    nl: 'Succes',
    ku: 'سەرکەوتوو',
  },
  'messages.error': {
    ar: 'حدث خطأ',
    en: 'An error occurred',
    nl: 'Er is een fout opgetreden',
    ku: 'هەڵەیەک ڕوویدا',
  },
  'messages.confirmDelete': {
    ar: 'هل أنت متأكد من الحذف؟',
    en: 'Are you sure you want to delete?',
    nl: 'Weet u zeker dat u wilt verwijderen?',
    ku: 'ئایا دڵنیایت لە سڕینەوە؟',
  },
  
  // Accounting
  'accounting.title': {
    ar: 'المحاسبة',
    en: 'Accounting',
    nl: 'Boekhouding',
    ku: 'حسابداری',
  },
  'accounting.dashboard': {
    ar: 'لوحة المالية',
    en: 'Financial Dashboard',
    nl: 'Financieel Dashboard',
    ku: 'داشبۆردی دارایی',
  },
  'accounting.revenue': {
    ar: 'الإيرادات',
    en: 'Revenue',
    nl: 'Omzet',
    ku: 'داهات',
  },
  'accounting.expenses': {
    ar: 'المصروفات',
    en: 'Expenses',
    nl: 'Uitgaven',
    ku: 'خەرجییەکان',
  },
  'accounting.profit': {
    ar: 'الربح/الخسارة',
    en: 'Profit/Loss',
    nl: 'Winst/Verlies',
    ku: 'قازانج/زیان',
  },
  'accounting.cashFlow': {
    ar: 'التدفق النقدي',
    en: 'Cash Flow',
    nl: 'Cashflow',
    ku: 'بازپێچی نەخت',
  },
  'accounting.salaries': {
    ar: 'إدارة الرواتب',
    en: 'Salary Management',
    nl: 'Salarisbeheer',
    ku: 'بەڕێوەبردنی مووچە',
  },
  'accounting.expenseManagement': {
    ar: 'إدارة المصروفات',
    en: 'Expense Management',
    nl: 'Uitgavenbeheer',
    ku: 'بەڕێوەبردنی خەرجییەکان',
  },
  'accounting.taxReports': {
    ar: 'التقارير الضريبية',
    en: 'Tax Reports',
    nl: 'Belastingaangiften',
    ku: 'ڕاپۆرتەکانی باج',
  },
  'accounting.costCenters': {
    ar: 'مراكز التكلفة',
    en: 'Cost Centers',
    nl: 'Kostenplaatsen',
    ku: 'ناوەندەکانی تێچوو',
  },
  'accounting.integrations': {
    ar: 'التكاملات',
    en: 'Integrations',
    nl: 'Integraties',
    ku: 'یەکگرتنەکان',
  },
  'accounting.addSalary': {
    ar: 'إضافة راتب',
    en: 'Add Salary',
    nl: 'Salaris Toevoegen',
    ku: 'زیادکردنی مووچە',
  },
  'accounting.addExpense': {
    ar: 'إضافة مصروف',
    en: 'Add Expense',
    nl: 'Uitgave Toevoegen',
    ku: 'زیادکردنی خەرجی',
  },
  'accounting.category': {
    ar: 'الفئة',
    en: 'Category',
    nl: 'Categorie',
    ku: 'پۆل',
  },
  'accounting.amount': {
    ar: 'المبلغ',
    en: 'Amount',
    nl: 'Bedrag',
    ku: 'بڕ',
  },
  'accounting.date': {
    ar: 'التاريخ',
    en: 'Date',
    nl: 'Datum',
    ku: 'بەروار',
  },
  'accounting.status': {
    ar: 'الحالة',
    en: 'Status',
    nl: 'Status',
    ku: 'دۆخ',
  },
  'accounting.pending': {
    ar: 'قيد الانتظار',
    en: 'Pending',
    nl: 'In afwachting',
    ku: 'لە چاوەڕوانیدا',
  },
  'accounting.approved': {
    ar: 'موافق عليه',
    en: 'Approved',
    nl: 'Goedgekeurd',
    ku: 'پەسەندکراو',
  },
  'accounting.paid': {
    ar: 'مدفوع',
    en: 'Paid',
    nl: 'Betaald',
    ku: 'پارەدراو',
  },
  'accounting.driver': {
    ar: 'السائق',
    en: 'Driver',
    nl: 'Chauffeur',
    ku: 'شۆفێر',
  },
  'accounting.baseSalary': {
    ar: 'الراتب الأساسي',
    en: 'Base Salary',
    nl: 'Basissalaris',
    ku: 'مووچەی بنەڕەت',
  },
  'accounting.deliveries': {
    ar: 'التوصيلات',
    en: 'Deliveries',
    nl: 'Bezorgingen',
    ku: 'گەیاندنەکان',
  },
  'accounting.bonus': {
    ar: 'المكافأة',
    en: 'Bonus',
    nl: 'Bonus',
    ku: 'خەڵات',
  },
  'accounting.deductions': {
    ar: 'الخصومات',
    en: 'Deductions',
    nl: 'Aftrekken',
    ku: 'داشکاندنەکان',
  },
  'accounting.total': {
    ar: 'المجموع',
    en: 'Total',
    nl: 'Totaal',
    ku: 'کۆ',
  },
  'accounting.period': {
    ar: 'الفترة',
    en: 'Period',
    nl: 'Periode',
    ku: 'ماوە',
  },
  'accounting.vendor': {
    ar: 'المورد',
    en: 'Vendor',
    nl: 'Leverancier',
    ku: 'دابینکەر',
  },
  'accounting.invoice': {
    ar: 'الفاتورة',
    en: 'Invoice',
    nl: 'Factuur',
    ku: 'پسوولە',
  },
  'accounting.recurring': {
    ar: 'متكرر',
    en: 'Recurring',
    nl: 'Terugkerend',
    ku: 'دووبارە',
  },
  'accounting.approve': {
    ar: 'موافقة',
    en: 'Approve',
    nl: 'Goedkeuren',
    ku: 'پەسەندکردن',
  },
  'accounting.btwReport': {
    ar: 'تقرير BTW',
    en: 'BTW Report',
    nl: 'BTW Aangifte',
    ku: 'ڕاپۆرتی BTW',
  },
  'accounting.quarter': {
    ar: 'الربع',
    en: 'Quarter',
    nl: 'Kwartaal',
    ku: 'چارەکی ساڵ',
  },
  'accounting.outputVAT': {
    ar: 'ضريبة المخرجات',
    en: 'Output VAT',
    nl: 'Te betalen BTW',
    ku: 'باجی دەرەوە',
  },
  'accounting.inputVAT': {
    ar: 'ضريبة المدخلات',
    en: 'Input VAT',
    nl: 'Voorbelasting',
    ku: 'باجی ناوەوە',
  },
  'accounting.netVAT': {
    ar: 'ضريبة القيمة المضافة الصافية',
    en: 'Net VAT',
    nl: 'Netto BTW',
    ku: 'باجی خاو',
  },
  'accounting.dueDate': {
    ar: 'تاريخ الاستحقاق',
    en: 'Due Date',
    nl: 'Vervaldatum',
    ku: 'بەرواری دان',
  },
  'accounting.submit': {
    ar: 'تقديم',
    en: 'Submit',
    nl: 'Indienen',
    ku: 'پێشکەشکردن',
  },
  'accounting.budget': {
    ar: 'الميزانية',
    en: 'Budget',
    nl: 'Budget',
    ku: 'بوودجە',
  },
  'accounting.actual': {
    ar: 'الفعلي',
    en: 'Actual',
    nl: 'Werkelijk',
    ku: 'ڕاستەقینە',
  },
  'accounting.variance': {
    ar: 'الفرق',
    en: 'Variance',
    nl: 'Afwijking',
    ku: 'جیاوازی',
  },
  'accounting.overBudget': {
    ar: 'تجاوز الميزانية',
    en: 'Over Budget',
    nl: 'Over Budget',
    ku: 'سەرووی بوودجە',
  },
  'accounting.connect': {
    ar: 'ربط',
    en: 'Connect',
    nl: 'Verbinden',
    ku: 'بەستنەوە',
  },
  'accounting.sync': {
    ar: 'مزامنة',
    en: 'Sync',
    nl: 'Synchroniseren',
    ku: 'هاوکاتکردن',
  },
  'accounting.lastSync': {
    ar: 'آخر مزامنة',
    en: 'Last Sync',
    nl: 'Laatste Sync',
    ku: 'دوایین هاوکاتکردن',
  },
  'accounting.connected': {
    ar: 'متصل',
    en: 'Connected',
    nl: 'Verbonden',
    ku: 'بەستراوەتەوە',
  },
  'accounting.disconnected': {
    ar: 'غير متصل',
    en: 'Disconnected',
    nl: 'Niet verbonden',
    ku: 'بەستراوە نییە',
  },
  'accounting.totalRevenue': {
    ar: 'إجمالي الإيرادات',
    en: 'Total Revenue',
    nl: 'Totale Omzet',
    ku: 'کۆی داهات',
  },
  'accounting.totalExpenses': {
    ar: 'إجمالي المصروفات',
    en: 'Total Expenses',
    nl: 'Totale Uitgaven',
    ku: 'کۆی خەرجییەکان',
  },
  'accounting.netProfit': {
    ar: 'صافي الربح',
    en: 'Net Profit',
    nl: 'Netto Winst',
    ku: 'قازانجی خاو',
  },
  'accounting.generateReport': {
    ar: 'إنشاء تقرير',
    en: 'Generate Report',
    nl: 'Rapport Genereren',
    ku: 'دروستکردنی ڕاپۆرت',
  },
  'accounting.exportData': {
    ar: 'تصدير البيانات',
    en: 'Export Data',
    nl: 'Gegevens Exporteren',
    ku: 'هەناردەکردنی داتا',
  },
  'accounting.thisMonth': {
    ar: 'هذا الشهر',
    en: 'This Month',
    nl: 'Deze Maand',
    ku: 'ئەم مانگە',
  },
  'accounting.thisQuarter': {
    ar: 'هذا الربع',
    en: 'This Quarter',
    nl: 'Dit Kwartaal',
    ku: 'ئەم چارەکییە',
  },
  'accounting.thisYear': {
    ar: 'هذه السنة',
    en: 'This Year',
    nl: 'Dit Jaar',
    ku: 'ئەم ساڵە',
  },
  
  // Driver App
  'driver.myOrders': {
    ar: 'طلباتي',
    en: 'My Orders',
    nl: 'Mijn Bestellingen',
    ku: 'داواکارییەکانم',
  },
  'driver.startDelivery': {
    ar: 'بدء التوصيل',
    en: 'Start Delivery',
    nl: 'Start Bezorging',
    ku: 'دەستپێکردنی گەیاندن',
  },
  'driver.completeDelivery': {
    ar: 'إكمال التوصيل',
    en: 'Complete Delivery',
    nl: 'Bezorging Voltooien',
    ku: 'تەواوبوونی گەیاندن',
  },
  'driver.customerInfo': {
    ar: 'معلومات العميل',
    en: 'Customer Info',
    nl: 'Klantinformatie',
    ku: 'زانیاری کڕیار',
  },
  'driver.address': {
    ar: 'العنوان',
    en: 'Address',
    nl: 'Adres',
    ku: 'ناونیشان',
  },
  'driver.city': {
    ar: 'المدينة',
    en: 'City',
    nl: 'Stad',
    ku: 'شار',
  },
  'driver.callCustomer': {
    ar: 'اتصال بالعميل',
    en: 'Call Customer',
    nl: 'Klant Bellen',
    ku: 'پەیوەندی بە کڕیار',
  },
  'driver.navigate': {
    ar: 'التنقل',
    en: 'Navigate',
    nl: 'Navigeren',
    ku: 'ڕێنمایی',
  },
  'driver.updateLocation': {
    ar: 'تحديث الموقع',
    en: 'Update Location',
    nl: 'Locatie Bijwerken',
    ku: 'نوێکردنەوەی شوێن',
  },
  
  // Quality & Safety
  'nav.qualitySafety': {
    ar: 'الجودة والسلامة',
    en: 'Quality & Safety',
    nl: 'Kwaliteit & Veiligheid',
    ku: 'کوالیتێ و پاراستن',
  },
  'quality.title': {
    ar: 'نظام الجودة والسلامة',
    en: 'Quality & Safety System',
    nl: 'Kwaliteit & Veiligheid Systeem',
    ku: 'سیستەمی کوالیتێ و پاراستن',
  },
  'quality.checks': {
    ar: 'فحوصات الجودة',
    en: 'Quality Checks',
    nl: 'Kwaliteitscontroles',
    ku: 'پشکنینەکانی کوالیتێ',
  },
  'quality.todayChecks': {
    ar: 'فحوصات اليوم',
    en: "Today's Checks",
    nl: 'Controles Vandaag',
    ku: 'پشکنینەکانی ئەمڕۆ',
  },
  'quality.passRate': {
    ar: 'نسبة النجاح',
    en: 'Pass Rate',
    nl: 'Slagingspercentage',
    ku: 'ڕێژەی سەرکەوتن',
  },
  'quality.passed': {
    ar: 'نجح',
    en: 'Passed',
    nl: 'Geslaagd',
    ku: 'سەرکەوتوو',
  },
  'quality.failed': {
    ar: 'فشل',
    en: 'Failed',
    nl: 'Mislukt',
    ku: 'شکستی هێنا',
  },
  'quality.recentIssues': {
    ar: 'المشاكل الأخيرة',
    en: 'Recent Issues',
    nl: 'Recente Problemen',
    ku: 'کێشەکانی دوایی',
  },
  'quality.score': {
    ar: 'الدرجة',
    en: 'Score',
    nl: 'Score',
    ku: 'نومار',
  },
  'quality.checklist': {
    ar: 'قائمة الفحص',
    en: 'Checklist',
    nl: 'Controlelijst',
    ku: 'لیستی پشکنین',
  },
  'quality.correctiveAction': {
    ar: 'الإجراء التصحيحي',
    en: 'Corrective Action',
    nl: 'Correctieve Actie',
    ku: 'کرداری چاککردنەوە',
  },
  'quality.addCheck': {
    ar: 'إضافة فحص',
    en: 'Add Check',
    nl: 'Controle Toevoegen',
    ku: 'زیادکردنی پشکنین',
  },
  
  // Check Types
  'quality.incoming': {
    ar: 'فحص المواد الواردة',
    en: 'Incoming Ingredients',
    nl: 'Inkomende Ingrediënten',
    ku: 'پشکنینی مادەی هاتوو',
  },
  'quality.inProcess': {
    ar: 'فحص أثناء الإنتاج',
    en: 'In-Process Check',
    nl: 'Tijdens Proces',
    ku: 'پشکنینی ناو پرۆسە',
  },
  'quality.final': {
    ar: 'فحص المنتج النهائي',
    en: 'Final Product Check',
    nl: 'Eindproduct Controle',
    ku: 'پشکنینی بەرهەمی کۆتایی',
  },
  'quality.delivery': {
    ar: 'فحص التوصيل',
    en: 'Delivery Check',
    nl: 'Bezorging Controle',
    ku: 'پشکنینی گەیاندن',
  },
  
  // Expiry Tracking
  'expiry.title': {
    ar: 'تتبع الصلاحية',
    en: 'Expiry Tracking',
    nl: 'Houdbaarheid Tracking',
    ku: 'بەدواداچوونی بەروار',
  },
  'expiry.approaching': {
    ar: 'يقترب من الانتهاء',
    en: 'Approaching Expiry',
    nl: 'Nadert Vervaldatum',
    ku: 'نزیک دەبێتەوە',
  },
  'expiry.expired': {
    ar: 'منتهي الصلاحية',
    en: 'Expired',
    nl: 'Verlopen',
    ku: 'بەسەرچوو',
  },
  
  // Bakery Management
  'nav.bakery': {
    ar: 'المخبز',
    en: 'Bakery',
    nl: 'Bakkerij',
    ku: 'نووشترگە',
  },
  'bakery.title': {
    ar: 'إدارة المخبز',
    en: 'Bakery Management',
    nl: 'Bakkerijbeheer',
    ku: 'بەڕێوەبردنی نووشترگە',
  },
  'bakery.dashboard': {
    ar: 'لوحة الإنتاج',
    en: 'Production Dashboard',
    nl: 'Productie Dashboard',
    ku: 'داشبۆردی بەرهەمهێنان',
  },
  'bakery.recipes': {
    ar: 'الوصفات',
    en: 'Recipes',
    nl: 'Recepten',
    ku: 'وەسفەکان',
  },
  'bakery.production': {
    ar: 'دفعات الإنتاج',
    en: 'Production Batches',
    nl: 'Productiebatches',
    ku: 'بەچەکانی بەرهەمهێنان',
  },
  'bakery.equipment': {
    ar: 'المعدات',
    en: 'Equipment',
    nl: 'Apparatuur',
    ku: 'ئامێرەکان',
  },
  'bakery.todayBatches': {
    ar: 'دفعة اليوم',
    en: "Today's Batches",
    nl: 'Batches Vandaag',
    ku: 'بەچەکانی ئەمڕۆ',
  },
  'bakery.activeBatches': {
    ar: 'دفعة نشطة',
    en: 'Active Batches',
    nl: 'Actieve Batches',
    ku: 'بەچە چالاکەکان',
  },
  'bakery.mixers': {
    ar: 'العجانات',
    en: 'Mixers',
    nl: 'Mixers',
    ku: 'میکسەرەکان',
  },
  'bakery.ovens': {
    ar: 'الأفران',
    en: 'Ovens',
    nl: 'Ovens',
    ku: 'تەندوورەکان',
  },
  'bakery.addRecipe': {
    ar: 'إضافة وصفة',
    en: 'Add Recipe',
    nl: 'Recept Toevoegen',
    ku: 'زیادکردنی وەسف',
  },
  'bakery.editRecipe': {
    ar: 'تعديل الوصفة',
    en: 'Edit Recipe',
    nl: 'Recept Bewerken',
    ku: 'دەستکاریکردنی وەسف',
  },
  'bakery.recipeName': {
    ar: 'اسم الوصفة',
    en: 'Recipe Name',
    nl: 'Receptnaam',
    ku: 'ناوی وەسف',
  },
  'bakery.ingredients': {
    ar: 'المكونات',
    en: 'Ingredients',
    nl: 'Ingrediënten',
    ku: 'پێکهاتەکان',
  },
  'bakery.yield': {
    ar: 'الإنتاجية',
    en: 'Yield',
    nl: 'Opbrengst',
    ku: 'بەرهەم',
  },
  'bakery.prepTime': {
    ar: 'وقت التحضير',
    en: 'Prep Time',
    nl: 'Voorbereidingstijd',
    ku: 'کاتی ئامادەکردن',
  },
  'bakery.bakeTime': {
    ar: 'وقت الخبز',
    en: 'Bake Time',
    nl: 'Baktijd',
    ku: 'کاتی پێخستن',
  },
  'bakery.bakeTemp': {
    ar: 'درجة الحرارة',
    en: 'Temperature',
    nl: 'Temperatuur',
    ku: 'پلەی گەرمی',
  },
  'bakery.instructions': {
    ar: 'التعليمات',
    en: 'Instructions',
    nl: 'Instructies',
    ku: 'ڕێنماییەکان',
  },
  'bakery.ingredientName': {
    ar: 'اسم المكون',
    en: 'Ingredient Name',
    nl: 'Ingrediëntnaam',
    ku: 'ناوی پێکهاتە',
  },
  'bakery.quantity': {
    ar: 'الكمية',
    en: 'Quantity',
    nl: 'Hoeveelheid',
    ku: 'بڕ',
  },
  'bakery.unit': {
    ar: 'الوحدة',
    en: 'Unit',
    nl: 'Eenheid',
    ku: 'یەکە',
  },
  'bakery.addIngredient': {
    ar: 'إضافة مكون',
    en: 'Add Ingredient',
    nl: 'Ingrediënt Toevoegen',
    ku: 'زیادکردنی پێکهاتە',
  },
  'bakery.addBatch': {
    ar: 'إنشاء دفعة',
    en: 'Create Batch',
    nl: 'Batch Maken',
    ku: 'دروستکردنی بەچ',
  },
  'bakery.batchNumber': {
    ar: 'رقم الدفعة',
    en: 'Batch Number',
    nl: 'Batchnummer',
    ku: 'ژمارەی بەچ',
  },
  'bakery.plannedQty': {
    ar: 'الكمية المخططة',
    en: 'Planned Qty',
    nl: 'Gepland Aantal',
    ku: 'بڕی پلانکراو',
  },
  'bakery.actualQty': {
    ar: 'الكمية الفعلية',
    en: 'Actual Qty',
    nl: 'Werkelijk Aantal',
    ku: 'بڕی ڕاستەقینە',
  },
  'bakery.status': {
    ar: 'الحالة',
    en: 'Status',
    nl: 'Status',
    ku: 'دۆخ',
  },
  'bakery.planned': {
    ar: 'مخطط',
    en: 'Planned',
    nl: 'Gepland',
    ku: 'پلانکراو',
  },
  'bakery.mixing': {
    ar: 'خلط',
    en: 'Mixing',
    nl: 'Mengen',
    ku: 'تێکەڵکردن',
  },
  'bakery.proofing': {
    ar: 'تخمير',
    en: 'Proofing',
    nl: 'Rijzen',
    ku: 'هەواردان',
  },
  'bakery.baking': {
    ar: 'خبز',
    en: 'Baking',
    nl: 'Bakken',
    ku: 'پێخستن',
  },
  'bakery.cooling': {
    ar: 'تبريد',
    en: 'Cooling',
    nl: 'Afkoelen',
    ku: 'ساردکردنەوە',
  },
  'bakery.completed': {
    ar: 'مكتمل',
    en: 'Completed',
    nl: 'Voltooid',
    ku: 'تەواوبوو',
  },
  'bakery.cancelled': {
    ar: 'ملغي',
    en: 'Cancelled',
    nl: 'Geannuleerd',
    ku: 'هەڵوەشاوە',
  },
  'bakery.addMixer': {
    ar: 'إضافة عجانة',
    en: 'Add Mixer',
    nl: 'Mixer Toevoegen',
    ku: 'زیادکردنی میکسەر',
  },
  'bakery.addOven': {
    ar: 'إضافة فرن',
    en: 'Add Oven',
    nl: 'Oven Toevoegen',
    ku: 'زیادکردنی تەندوور',
  },
  'bakery.mixerName': {
    ar: 'اسم العجانة',
    en: 'Mixer Name',
    nl: 'Mixernaam',
    ku: 'ناوی میکسەر',
  },
  'bakery.ovenName': {
    ar: 'اسم الفرن',
    en: 'Oven Name',
    nl: 'Ovennaam',
    ku: 'ناوی تەندوور',
  },
  'bakery.capacity': {
    ar: 'السعة',
    en: 'Capacity',
    nl: 'Capaciteit',
    ku: 'لەچاو',
  },
  'bakery.currentTemp': {
    ar: 'درجة الحرارة الحالية',
    en: 'Current Temp',
    nl: 'Huidige Temp',
    ku: 'پلەی گەرمی ئێستا',
  },
  'bakery.targetTemp': {
    ar: 'درجة الحرارة المستهدفة',
    en: 'Target Temp',
    nl: 'Doeltemp',
    ku: 'پلەی گەرمی ئامانج',
  },
  'bakery.available': {
    ar: 'متاح',
    en: 'Available',
    nl: 'Beschikbaar',
    ku: 'بەردەست',
  },
  'bakery.inUse': {
    ar: 'قيد الاستخدام',
    en: 'In Use',
    nl: 'In Gebruik',
    ku: 'لە بەکارهێناندایە',
  },
  'bakery.ovenType': {
    ar: 'نوع الفرن',
    en: 'Oven Type',
    nl: 'Oventype',
    ku: 'جۆری تەندوور',
  },
  'bakery.electric': {
    ar: 'كهربائي',
    en: 'Electric',
    nl: 'Elektrisch',
    ku: 'کارەبایی',
  },
  'bakery.gas': {
    ar: 'غاز',
    en: 'Gas',
    nl: 'Gas',
    ku: 'گاز',
  },
  'bakery.startBatch': {
    ar: 'بدء الدفعة',
    en: 'Start Batch',
    nl: 'Batch Starten',
    ku: 'دەستپێکردنی بەچ',
  },
  'bakery.advanceStage': {
    ar: 'الانتقال للمرحلة التالية',
    en: 'Advance Stage',
    nl: 'Volgende Fase',
    ku: 'قۆناغی داهاتوو',
  },
  'bakery.completeBatch': {
    ar: 'إكمال الدفعة',
    en: 'Complete Batch',
    nl: 'Batch Voltooien',
    ku: 'تەواوبوونی بەچ',
  },
  'bakery.qualityScore': {
    ar: 'درجة الجودة',
    en: 'Quality Score',
    nl: 'Kwaliteitsscore',
    ku: 'نوماری کوالیتێ',
  },
  'bakery.minTemp': {
    ar: 'الحد الأدنى',
    en: 'Min Temp',
    nl: 'Min Temp',
    ku: 'کەمترین پلە',
  },
  'bakery.maxTemp': {
    ar: 'الحد الأقصى',
    en: 'Max Temp',
    nl: 'Max Temp',
    ku: 'زۆرترین پلە',
  },
  'bakery.trays': {
    ar: 'صواني',
    en: 'Trays',
    nl: 'Bakplaten',
    ku: 'سینیەکان',
  },
  'bakery.kg': {
    ar: 'كغ',
    en: 'kg',
    nl: 'kg',
    ku: 'کگ',
  },
  'bakery.selectRecipe': {
    ar: 'اختر وصفة',
    en: 'Select Recipe',
    nl: 'Selecteer Recept',
    ku: 'وەسف هەڵبژێرە',
  },
  'bakery.selectMixer': {
    ar: 'اختر عجانة',
    en: 'Select Mixer',
    nl: 'Selecteer Mixer',
    ku: 'میکسەر هەڵبژێرە',
  },
  'bakery.selectOven': {
    ar: 'اختر فرن',
    en: 'Select Oven',
    nl: 'Selecteer Oven',
    ku: 'تەندوور هەڵبژێرە',
  },
  'bakery.minutes': {
    ar: 'دقيقة',
    en: 'min',
    nl: 'min',
    ku: 'خولەک',
  },
  'bakery.celsius': {
    ar: '°م',
    en: '°C',
    nl: '°C',
    ku: '°C',
  },
  'bakery.noRecipes': {
    ar: 'لا توجد وصفات',
    en: 'No recipes found',
    nl: 'Geen recepten gevonden',
    ku: 'هیچ وەسفێک نییە',
  },
  'bakery.noBatches': {
    ar: 'لا توجد دفعات',
    en: 'No batches found',
    nl: 'Geen batches gevonden',
    ku: 'هیچ بەچێک نییە',
  },
  'bakery.noEquipment': {
    ar: 'لا توجد معدات',
    en: 'No equipment found',
    nl: 'Geen apparatuur gevonden',
    ku: 'هیچ ئامێرێک نییە',
  },
  'bakery.grams': {
    ar: 'غرام',
    en: 'g',
    nl: 'g',
    ku: 'گرام',
  },
  'bakery.liters': {
    ar: 'لتر',
    en: 'L',
    nl: 'L',
    ku: 'لیتر',
  },
  'bakery.pieces': {
    ar: 'قطعة',
    en: 'pcs',
    nl: 'st',
    ku: 'دانە',
  },
  'expiry.fresh': {
    ar: 'طازج',
    en: 'Fresh',
    nl: 'Vers',
    ku: 'تازە',
  },
  'expiry.daysToExpiry': {
    ar: 'أيام حتى الانتهاء',
    en: 'Days to Expiry',
    nl: 'Dagen tot Vervaldatum',
    ku: 'ڕۆژ تا کۆتایی',
  },
  'expiry.discount': {
    ar: 'خصم مقترح',
    en: 'Suggested Discount',
    nl: 'Voorgestelde Korting',
    ku: 'داشکاندنی پێشنیارکراو',
  },
  'expiry.batchNumber': {
    ar: 'رقم الدفعة',
    en: 'Batch Number',
    nl: 'Partijnummer',
    ku: 'ژمارەی بەش',
  },
  'expiry.productionDate': {
    ar: 'تاريخ الإنتاج',
    en: 'Production Date',
    nl: 'Productiedatum',
    ku: 'بەرواری بەرهەمهێنان',
  },
  'expiry.expiryDate': {
    ar: 'تاريخ الانتهاء',
    en: 'Expiry Date',
    nl: 'Vervaldatum',
    ku: 'بەرواری کۆتایی',
  },
  'expiry.addTracking': {
    ar: 'إضافة تتبع',
    en: 'Add Tracking',
    nl: 'Tracking Toevoegen',
    ku: 'زیادکردنی بەدواداچوون',
  },
  
  // Certificates
  'cert.title': {
    ar: 'الشهادات الصحية',
    en: 'Health Certificates',
    nl: 'Gezondheidscertificaten',
    ku: 'بڕوانامەی تەندروستی',
  },
  'cert.employee': {
    ar: 'شهادة موظف',
    en: 'Employee Certificate',
    nl: 'Medewerker Certificaat',
    ku: 'بڕوانامەی کارمەند',
  },
  'cert.vehicle': {
    ar: 'شهادة مركبة',
    en: 'Vehicle Certificate',
    nl: 'Voertuig Certificaat',
    ku: 'بڕوانامەی ئۆتۆمبێل',
  },
  'cert.facility': {
    ar: 'شهادة منشأة',
    en: 'Facility Certificate',
    nl: 'Faciliteit Certificaat',
    ku: 'بڕوانامەی دامەزراوە',
  },
  'cert.valid': {
    ar: 'ساري',
    en: 'Valid',
    nl: 'Geldig',
    ku: 'ڕەوا',
  },
  'cert.expired': {
    ar: 'منتهي',
    en: 'Expired',
    nl: 'Verlopen',
    ku: 'بەسەرچوو',
  },
  'cert.expiringSoon': {
    ar: 'ينتهي قريباً',
    en: 'Expiring Soon',
    nl: 'Verloopt Binnenkort',
    ku: 'بەم زووانە کۆتایی دێت',
  },
  'cert.certNumber': {
    ar: 'رقم الشهادة',
    en: 'Certificate Number',
    nl: 'Certificaatnummer',
    ku: 'ژمارەی بڕوانامە',
  },
  'cert.issueDate': {
    ar: 'تاريخ الإصدار',
    en: 'Issue Date',
    nl: 'Uitgiftedatum',
    ku: 'بەرواری دەرچوون',
  },
  'cert.expiryDate': {
    ar: 'تاريخ الانتهاء',
    en: 'Expiry Date',
    nl: 'Vervaldatum',
    ku: 'بەرواری کۆتایی',
  },
  'cert.issuingAuthority': {
    ar: 'الجهة المصدرة',
    en: 'Issuing Authority',
    nl: 'Uitgevende Instantie',
    ku: 'دەزگای دەرکردن',
  },
  'cert.addCert': {
    ar: 'إضافة شهادة',
    en: 'Add Certificate',
    nl: 'Certificaat Toevoegen',
    ku: 'زیادکردنی بڕوانامە',
  },
  
  // Safety
  'safety.title': {
    ar: 'فحوصات السلامة',
    en: 'Safety Checks',
    nl: 'Veiligheidscontroles',
    ku: 'پشکنینەکانی پاراستن',
  },
  'safety.facility': {
    ar: 'فحص المنشأة',
    en: 'Facility Check',
    nl: 'Faciliteit Controle',
    ku: 'پشکنینی دامەزراوە',
  },
  'safety.equipment': {
    ar: 'فحص المعدات',
    en: 'Equipment Check',
    nl: 'Apparatuur Controle',
    ku: 'پشکنینی ئامێرەکان',
  },
  'safety.vehicle': {
    ar: 'فحص المركبة',
    en: 'Vehicle Check',
    nl: 'Voertuig Controle',
    ku: 'پشکنینی ئۆتۆمبێل',
  },
  'safety.daily': {
    ar: 'فحص يومي',
    en: 'Daily Check',
    nl: 'Dagelijkse Controle',
    ku: 'پشکنینی ڕۆژانە',
  },
  'safety.issues': {
    ar: 'مشاكل السلامة',
    en: 'Safety Issues',
    nl: 'Veiligheidsproblemen',
    ku: 'کێشەکانی پاراستن',
  },
  'safety.addSafetyCheck': {
    ar: 'إضافة فحص سلامة',
    en: 'Add Safety Check',
    nl: 'Veiligheidscontrole Toevoegen',
    ku: 'زیادکردنی پشکنینی پاراستن',
  },
  'safety.nextCheckDate': {
    ar: 'تاريخ الفحص القادم',
    en: 'Next Check Date',
    nl: 'Volgende Controle Datum',
    ku: 'بەرواری پشکنینی داهاتوو',
  },
  
  // Bakery
  'nav.bakery': {
    ar: 'المخبز',
    en: 'Bakery',
    nl: 'Bakkerij',
    ku: 'نووشترگە',
  },
  'bakery.title': {
    ar: 'إدارة المخبز',
    en: 'Bakery Management',
    nl: 'Bakkerijbeheer',
    ku: 'بەڕێوەبردنی نووشترگە',
  },
  'bakery.dashboard': {
    ar: 'لوحة الإنتاج',
    en: 'Production Dashboard',
    nl: 'Productie Dashboard',
    ku: 'داشبۆردی بەرهەمهێنان',
  },
  'bakery.recipes': {
    ar: 'الوصفات',
    en: 'Recipes',
    nl: 'Recepten',
    ku: 'وەسفەکان',
  },
  'bakery.production': {
    ar: 'دفعات الإنتاج',
    en: 'Production Batches',
    nl: 'Productie Batches',
    ku: 'خشتەکانی بەرهەمهێنان',
  },
  'bakery.equipment': {
    ar: 'المعدات',
    en: 'Equipment',
    nl: 'Apparatuur',
    ku: 'ئامێرەکان',
  },
  'bakery.schedule': {
    ar: 'جدول الإنتاج',
    en: 'Production Schedule',
    nl: 'Productieschema',
    ku: 'خشتی بەرهەمهێنان',
  },
  'bakery.todayProduction': {
    ar: 'إنتاج اليوم',
    en: "Today's Production",
    nl: 'Productie Vandaag',
    ku: 'بەرهەمهێنانی ئەمڕۆ',
  },
  'bakery.activeBatches': {
    ar: 'دفعات نشطة',
    en: 'Active Batches',
    nl: 'Actieve Batches',
    ku: 'خشتە چالاکەکان',
  },
  'bakery.mixerUtilization': {
    ar: 'استخدام العجانات',
    en: 'Mixer Utilization',
    nl: 'Menger Gebruik',
    ku: 'بەکارهێنانی تێکەڵکەر',
  },
  'bakery.ovenUtilization': {
    ar: 'استخدام الأفران',
    en: 'Oven Utilization',
    nl: 'Oven Gebruik',
    ku: 'بەکارهێنانی تەندوور',
  },
  'bakery.addRecipe': {
    ar: 'إضافة وصفة',
    en: 'Add Recipe',
    nl: 'Recept Toevoegen',
    ku: 'زیادکردنی وەسف',
  },
  'customers.newSubscriptions': {
    ar: 'اشتراكات جديدة',
    en: 'New Subscriptions',
    nl: 'Nieuwe Abonnementen',
    ku: 'بەشدارییە نوێیەکان',
  },
  
  // Pre-orders Navigation
  'nav.preorders': {
    ar: 'الطلبات المسبقة',
    en: 'Pre-orders',
    nl: 'Voorbestellingen',
    ku: 'پێشداواکارییەکان',
  },
  
  // Pre-orders
  'preorders.title': {
    ar: 'نظام الطلبات المسبقة',
    en: 'Pre-order System',
    nl: 'Voorbestelsysteem',
    ku: 'سیستەمی پێشداواکاری',
  },
  'preorders.totalOrders': {
    ar: 'إجمالي الطلبات',
    en: 'Total Orders',
    nl: 'Totaal Bestellingen',
    ku: 'کۆی داواکارییەکان',
  },
  'preorders.add': {
    ar: 'إضافة طلب مسبق',
    en: 'Add Pre-order',
    nl: 'Voorbestelling Toevoegen',
    ku: 'زیادکردنی پێشداواکاری',
  },
  'preorders.addRecurring': {
    ar: 'إضافة طلب متكرر',
    en: 'Add Recurring Order',
    nl: 'Terugkerende Bestelling Toevoegen',
    ku: 'زیادکردنی داواکاری دووبارە',
  },
  'preorders.advanceOrders': {
    ar: 'الطلبات المسبقة',
    en: 'Advance Orders',
    nl: 'Voorbestellingen',
    ku: 'پێشداواکارییەکان',
  },
  'preorders.recurringOrders': {
    ar: 'الطلبات المتكررة',
    en: 'Recurring Orders',
    nl: 'Terugkerende Bestellingen',
    ku: 'داواکارییە دووبارەکان',
  },
  'preorders.calendar': {
    ar: 'عرض التقويم',
    en: 'Calendar View',
    nl: 'Kalenderweergave',
    ku: 'پیشاندانی ڕۆژژمار',
  },
  'preorders.pending': {
    ar: 'قيد الانتظار',
    en: 'Pending',
    nl: 'In afwachting',
    ku: 'لە چاوەڕوانیدا',
  },
  'preorders.confirmed': {
    ar: 'مؤكد',
    en: 'Confirmed',
    nl: 'Bevestigd',
    ku: 'پشتڕاستکراوە',
  },
  'preorders.processing': {
    ar: 'قيد المعالجة',
    en: 'Processing',
    nl: 'In verwerking',
    ku: 'لە پرۆسەداندایە',
  },
  'preorders.completed': {
    ar: 'مكتمل',
    en: 'Completed',
    nl: 'Voltooid',
    ku: 'تەواوبوو',
  },
  'preorders.cancelled': {
    ar: 'ملغي',
    en: 'Cancelled',
    nl: 'Geannuleerd',
    ku: 'هەڵوەشاوە',
  },
  'preorders.normal': {
    ar: 'عادي',
    en: 'Normal',
    nl: 'Normaal',
    ku: 'ئاسایی',
  },
  'preorders.high': {
    ar: 'مهم',
    en: 'High',
    nl: 'Hoog',
    ku: 'گرنگ',
  },
  'preorders.urgent': {
    ar: 'عاجل',
    en: 'Urgent',
    nl: 'Urgent',
    ku: 'لەناکاو',
  },
  'preorders.status': {
    ar: 'الحالة',
    en: 'Status',
    nl: 'Status',
    ku: 'دۆخ',
  },
  'preorders.deposit': {
    ar: 'العربية',
    en: 'Deposit',
    nl: 'Aanbetaling',
    ku: 'پارەی پێشەکی',
  },
  'preorders.reminderSent': {
    ar: 'تم إرسال التذكير',
    en: 'Reminder Sent',
    nl: 'Herinnering Verzonden',
    ku: 'بیرخەرەوە نێردرا',
  },
  'preorders.convertToOrder': {
    ar: 'تحويل إلى طلب',
    en: 'Convert to Order',
    nl: 'Omzetten naar Bestelling',
    ku: 'گۆڕین بۆ داواکاری',
  },
  'preorders.totalRevenue': {
    ar: 'إجمالي الإيرادات',
    en: 'Total Revenue',
    nl: 'Totale Omzet',
    ku: 'کۆی داهات',
  },
  'preorders.activeRecurring': {
    ar: 'الطلبات المتكررة النشطة',
    en: 'Active Recurring',
    nl: 'Actieve Terugkerende',
    ku: 'داواکاری دووبارە چالاک',
  },
  'preorders.monthlyEstimate': {
    ar: 'التقدير الشهري',
    en: 'Monthly Estimate',
    nl: 'Maandelijkse Schatting',
    ku: 'خەمڵاندنی مانگانە',
  },
  'preorders.weekly': {
    ar: 'أسبوعي',
    en: 'Weekly',
    nl: 'Wekelijks',
    ku: 'هەفتانە',
  },
  'preorders.biweekly': {
    ar: 'كل أسبوعين',
    en: 'Bi-weekly',
    nl: 'Tweewekelijks',
    ku: 'هەموو دوو هەفتەیەک',
  },
  'preorders.monthly': {
    ar: 'شهري',
    en: 'Monthly',
    nl: 'Maandelijks',
    ku: 'مانگانە',
  },
  'preorders.active': {
    ar: 'نشط',
    en: 'Active',
    nl: 'Actief',
    ku: 'چالاک',
  },
  'preorders.paused': {
    ar: 'متوقف',
    en: 'Paused',
    nl: 'Gepauzeerd',
    ku: 'وەستاو',
  },
  'preorders.deliveries': {
    ar: 'توصيلات',
    en: 'Deliveries',
    nl: 'Bezorgingen',
    ku: 'گەیاندنەکان',
  },
  'preorders.discount': {
    ar: 'خصم',
    en: 'Discount',
    nl: 'Korting',
    ku: 'داشکاندن',
  },
  'preorders.nextDelivery': {
    ar: 'التوصيل القادم',
    en: 'Next Delivery',
    nl: 'Volgende Bezorging',
    ku: 'گەیاندنی داهاتوو',
  },
  'preorders.generateOrder': {
    ar: 'إنشاء طلب',
    en: 'Generate Order',
    nl: 'Bestelling Genereren',
    ku: 'دروستکردنی داواکاری',
  },
  'preorders.selectCustomer': {
    ar: 'اختر العميل',
    en: 'Select Customer',
    nl: 'Selecteer Klant',
    ku: 'کڕیار هەڵبژێرە',
  },
  'preorders.selectProducts': {
    ar: 'اختر المنتجات',
    en: 'Select Products',
    nl: 'Selecteer Producten',
    ku: 'بەرهەمەکان هەڵبژێرە',
  },
  'preorders.deliveryDate': {
    ar: 'تاريخ التوصيل',
    en: 'Delivery Date',
    nl: 'Bezorgdatum',
    ku: 'بەرواری گەیاندن',
  },
  'preorders.deliveryTime': {
    ar: 'وقت التوصيل',
    en: 'Delivery Time',
    nl: 'Bezorgtijd',
    ku: 'کاتی گەیاندن',
  },
  'preorders.priority': {
    ar: 'الأولوية',
    en: 'Priority',
    nl: 'Prioriteit',
    ku: 'پێشەنگی',
  },
  'preorders.notes': {
    ar: 'ملاحظات',
    en: 'Notes',
    nl: 'Notities',
    ku: 'تێبینییەکان',
  },
  'preorders.items': {
    ar: 'المنتجات',
    en: 'Items',
    nl: 'Artikelen',
    ku: 'بابەتەکان',
  },
  'preorders.recurringName': {
    ar: 'اسم الطلب المتكرر',
    en: 'Recurring Order Name',
    nl: 'Naam Terugkerende Bestelling',
    ku: 'ناوی داواکاری دووبارە',
  },
  'preorders.frequency': {
    ar: 'التكرار',
    en: 'Frequency',
    nl: 'Frequentie',
    ku: 'دووبارەبوون',
  },
  'preorders.daysOfWeek': {
    ar: 'أيام الأسبوع',
    en: 'Days of Week',
    nl: 'Dagen van de Week',
    ku: 'ڕۆژەکانی هەفتە',
  },
  'preorders.dayOfMonth': {
    ar: 'يوم الشهر',
    en: 'Day of Month',
    nl: 'Dag van de Maand',
    ku: 'ڕۆژی مانگ',
  },
  'preorders.preferredTime': {
    ar: 'الوقت المفضل',
    en: 'Preferred Time',
    nl: 'Voorkeurstijd',
    ku: 'کاتی پەسەندکراو',
  },
  'preorders.startDate': {
    ar: 'تاريخ البدء',
    en: 'Start Date',
    nl: 'Startdatum',
    ku: 'بەرواری دەستپێکردن',
  },
  'preorders.endDate': {
    ar: 'تاريخ الانتهاء',
    en: 'End Date',
    nl: 'Einddatum',
    ku: 'بەرواری کۆتایی',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ar');

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && ['ar', 'en', 'nl', 'ku'].includes(savedLang)) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) return key;
    return translation[language] || translation.en || key;
  };

  const isRTL = language === 'ar' || language === 'ku';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export type { Language };
