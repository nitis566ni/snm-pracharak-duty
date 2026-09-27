import { Language } from '../types';

export const translations = {
  en: {
    // Brand & App
    appName: 'Sant Nirankari Mission',
    zoneTitle: 'Zone 34, Pune',
    appSubtitle: 'Pracharak Duty Management System',
    missionMotto: 'Dhan Nirankar Ji',
    workingProductivity: 'Duty Management & Schedule',
    checkProgress: 'Zone 34 Satsang scheduling and Pracharak allocations',
    
    // Navigation
    navDashboard: 'Dashboard',
    navCalendar: 'Monthly Schedule',
    navApprovals: 'Duty Approvals',
    navMasters: 'Master Data',
    navReports: 'Duty Charts & Reports',
    navBulkUpload: 'Excel Bulk Import',
    navSettings: 'Settings & Audit',

    // Role switcher
    activeRole: 'Active Role',
    zoneAdmin: 'Zone Admin',
    branchMukhi: 'Branch Mukhi / Sanyojak',
    switchRole: 'Switch Role / User',
    restrictedBranch: 'Scoped to Branch',
    allBranches: 'All Branches (Zone 34)',

    // Common actions & buttons
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    add: 'Add New',
    searchPlaceholder: 'Search pracharaks, branches, duties...',
    exportExcel: 'Export Excel',
    exportPdf: 'Print / Save PDF',
    freezeMonth: 'Freeze & Publish Month',
    unfreezeMonth: 'Unfreeze Month',
    autoAllocate: 'Auto-Allocate Duties',
    approve: 'Approve',
    reject: 'Reject',
    approveAll: 'Approve All Pending',
    filterBySector: 'Filter by Sector',
    filterByBranch: 'Filter by Branch',
    filterByCategory: 'Filter by Category',
    month: 'Month',
    year: 'Year',
    status: 'Status',
    actions: 'Actions',

    // Duty types
    duty_pracharak: 'Pracharak Duty',
    duty_vichar: 'Satguru Mata Ji Vichar',
    duty_local: 'Local Pracharak',
    duty_other_zone: 'Other-Zone Pracharak',
    duty_no_satsang: 'No Satsang',
    duty_unfilled: 'Unallocated',

    // Statuses
    status_approved: 'Approved',
    status_pending: 'Pending Approval',
    status_rejected: 'Rejected',
    status_present: 'Present',
    status_absent: 'Absent',
    status_unmarked: 'Unmarked',

    // Dashboard stats
    totalAllocated: 'Duties Allocated',
    vicharCount: 'Vichar Weeks',
    pendingApprovals: 'Pending Approvals',
    fulfillmentRate: 'Allocation Rate',
    activeBranches: 'Active Branches',
    activePracharaks: 'Active Pracharaks',
    upcomingSatsangs: 'Upcoming Satsangs',
    todaySchedules: 'Scheduled Duties',
    seeAllActivity: 'Manage All Duties',
    workingHours: 'Satsang Hours',

    // Calendar & Matrix
    monthFrozenNotice: 'This month is frozen and published. Changes are locked.',
    mukhiRestrictedNotice: 'Branch Mukhi can only assign duties during permitted weeks:',
    allocateModalTitle: 'Allocate Pracharak Duty',
    selectDutyType: 'Duty Type',
    selectPracharak: 'Select Pracharak',
    onHoldNotice: 'Pracharaks on Hold are hidden for this date.',
    ruleViolation: 'Rule Constraint Warning',
    overrideReason: 'Admin Override Reason',

    // Attendance & Feedback
    markAttendance: 'Attendance & Feedback',
    dutyConductedBy: 'Duty Conducted By',
    whoPerformedInstead: 'Actual Performer (Substitute)',
    feedbackNotes: 'Feedback & Sangat Notes',
    markedBy: 'Marked By',

    // Masters
    tabSectors: 'Sectors',
    tabBranches: 'Branches',
    tabPracharaks: 'Pracharaks',
    tabDesignations: 'Designations',
    tabSatsangs: 'Satsangs',
    tabHolds: 'Pracharak Holds',

    // Reports
    pracharakChartTitle: 'Pracharak-wise Duty Chart',
    satsangChartTitle: 'Branch-wise Satsang Duty Chart',
    serialNo: 'S.No',
    pracharakName: 'Pracharak Name',
    category: 'Category',
    branchName: 'Branch / Sangat',
    satsangDayTime: 'Weekday & Time',
    address: 'Address / Satsang Bhavan',

    // Bulk upload
    downloadTemplate: 'Download Excel Template',
    uploadPrompt: 'Drag and drop .xlsx file or browse to upload',
    previewAndApprove: 'Upload Preview & Conflict Resolution',
    totalRows: 'Total Rows',
    newRows: 'New Records',
    conflictRows: 'Existing Conflicts',
    errorRows: 'Errors / Skipped',
    applyImport: 'Apply Verified Changes',

    // Language names
    langEn: 'English',
    langHi: 'हिंदी (Hindi)',
    langMr: 'मराठी (Marathi)',
  },

  hi: {
    // Brand & App
    appName: 'संत निरंकारी मिशन',
    zoneTitle: 'ज़ोन ३४, पुणे',
    appSubtitle: 'प्रचारक ड्यूटी प्रबंधन प्रणाली',
    missionMotto: 'धन निरंकार जी',
    workingProductivity: 'ड्यूटी प्रबंधन एवं समय सारणी',
    checkProgress: 'ज़ोन ३४ सत्संग आयोजन एवं प्रचारक ड्यूटी आवंटन',

    // Navigation
    navDashboard: 'डैशबोर्ड',
    navCalendar: 'मासिक कैलेंडर',
    navApprovals: 'ड्यूटी अनुमोदन',
    navMasters: 'मास्टर डेटा',
    navReports: 'ड्यूटी चार्ट एवं रिपोर्ट',
    navBulkUpload: 'एक्सेल बल्क आयात',
    navSettings: 'सेटिंग्स व ऑडिट',

    // Role switcher
    activeRole: 'सक्रिय भूमिका',
    zoneAdmin: 'ज़ोन एडमिन',
    branchMukhi: 'ब्रांच मुखी / संयोजक',
    switchRole: 'भूमिका बदलें',
    restrictedBranch: 'संबंधित ब्रांच',
    allBranches: 'समस्त ब्रांच (ज़ोन ३४)',

    // Common actions & buttons
    save: 'सुरक्षित करें',
    cancel: 'रद्द करें',
    edit: 'संपादित करें',
    delete: 'हटाएं',
    add: 'नया जोड़ें',
    searchPlaceholder: 'प्रचारक, ब्रांच या ड्यूटी खोजें...',
    exportExcel: 'एक्सेल डाउनलोड',
    exportPdf: 'प्रिंट / पीडीएफ़ सेव करें',
    freezeMonth: 'माह फ्रीज व प्रकाशित करें',
    unfreezeMonth: 'माह अनफ्रीज करें',
    autoAllocate: 'स्वतः आवंटन (Auto-Allocate)',
    approve: 'स्वीकृत करें',
    reject: 'अस्वीकार करें',
    approveAll: 'सभी लंबित स्वीकृत करें',
    filterBySector: 'सेक्टर अनुसार',
    filterByBranch: 'ब्रांच अनुसार',
    filterByCategory: 'श्रेणी अनुसार',
    month: 'माह',
    year: 'वर्ष',
    status: 'स्थिति',
    actions: 'कार्य',

    // Duty types
    duty_pracharak: 'प्रचारक ड्यूटी',
    duty_vichar: 'सतगुरु माता जी विचार',
    duty_local: 'स्थानीय प्रचारक',
    duty_other_zone: 'अन्य ज़ोन प्रचारक',
    duty_no_satsang: 'सत्संग स्थगित / अवकाश',
    duty_unfilled: 'आवंटित नहीं',

    // Statuses
    status_approved: 'स्वीकृत',
    status_pending: 'अनुमोदन लंबित',
    status_rejected: 'अस्वीकृत',
    status_present: 'उपस्थित',
    status_absent: 'अनुपस्थित',
    status_unmarked: 'अचिह्नित',

    // Dashboard stats
    totalAllocated: 'आवंटित ड्यूटियाँ',
    vicharCount: 'विचार सप्ताह',
    pendingApprovals: 'लंबित अनुमोदन',
    fulfillmentRate: 'आवंटन दर',
    activeBranches: 'सक्रिय शाखाएं',
    activePracharaks: 'सक्रिय प्रचारक',
    upcomingSatsangs: 'आगामी सत्संग',
    todaySchedules: 'निर्धारित ड्यूटियाँ',
    seeAllActivity: 'समस्त ड्यूटियाँ देखें',
    workingHours: 'सत्संग समय',

    // Calendar & Matrix
    monthFrozenNotice: 'यह माह फ्रीज एवं प्रकाशित है। संपादन लॉक है।',
    mukhiRestrictedNotice: 'ब्रांच मुखी केवल निर्धारित सप्ताहों में ड्यूटी भर सकते हैं:',
    allocateModalTitle: 'प्रचारक ड्यूटी आवंटन',
    selectDutyType: 'ड्यूटी प्रकार',
    selectPracharak: 'प्रचारक चुनें',
    onHoldNotice: 'अवकाश (Hold) पर उपस्थित प्रचारक इस तिथि पर उपलब्ध नहीं हैं।',
    ruleViolation: 'नियम चेतावनी',
    overrideReason: 'एडमिन ओवरराइड कारण',

    // Attendance & Feedback
    markAttendance: 'उपस्थिति एवं विचार फीडबैक',
    dutyConductedBy: 'ड्यूटी किसके द्वारा सम्पन्न हुई',
    whoPerformedInstead: 'वास्तविक प्रचारक (यदि अनुपस्थित थे)',
    feedbackNotes: 'सत्संग फीडबैक विवरण',
    markedBy: 'दर्ज कर्ता',

    // Masters
    tabSectors: 'सेक्टर',
    tabBranches: 'शाखाएं (ब्रांच)',
    tabPracharaks: 'प्रचारक सूची',
    tabDesignations: 'पदनाम (Designations)',
    tabSatsangs: 'सत्संग विवरण',
    tabHolds: 'प्रचारक अवकाश (Holds)',

    // Reports
    pracharakChartTitle: 'प्रचारक-वार मासिक ड्यूटी चार्ट',
    satsangChartTitle: 'ब्रांच-वार सत्संग ड्यूटी चार्ट',
    serialNo: 'क्र.',
    pracharakName: 'प्रचारक का नाम',
    category: 'श्रेणी',
    branchName: 'शाखा / संगत',
    satsangDayTime: 'वार एवं समय',
    address: 'सत्संग भवन पता',

    // Bulk upload
    downloadTemplate: 'एक्सेल टेम्पलेट डाउनलोड',
    uploadPrompt: 'एक्सेल (.xlsx) फाइल यहाँ खींचें या चुनें',
    previewAndApprove: 'अपलोड पूर्वावलोकन व समाधान',
    totalRows: 'कुल पंक्तियाँ',
    newRows: 'नये रिकॉर्ड',
    conflictRows: 'विवाद / पहले से मौजूद',
    errorRows: 'त्रुटिपूर्ण पंक्तियाँ',
    applyImport: 'स्वीकृत रिकॉर्ड सहेजें',

    // Language names
    langEn: 'English',
    langHi: 'हिंदी',
    langMr: 'मराठी',
  },

  mr: {
    // Brand & App
    appName: 'संत निरंकारी मिशन',
    zoneTitle: 'झोन ३४, पुणे',
    appSubtitle: 'प्रचारक ड्युटी व्यवस्थापन प्रणाली',
    missionMotto: 'धन निरंकार जी',
    workingProductivity: 'ड्युटी व्यवस्थापन व वेळापत्रक',
    checkProgress: 'झोन ३४ सत्संग आयोजन आणि प्रचारक ड्युटी वाटप',

    // Navigation
    navDashboard: 'डॅशबोर्ड',
    navCalendar: 'मासिक वेळापत्रक',
    navApprovals: 'ड्युटी मंजुरी',
    navMasters: 'मास्टर डेटा',
    navReports: 'ड्युटी चार्ट व अहवाल',
    navBulkUpload: 'एक्सेल बल्क आयात',
    navSettings: 'सेटिंग्ज व ऑडिट',

    // Role switcher
    activeRole: 'सक्रिय भूमिका',
    zoneAdmin: 'झोन ॲडमिन',
    branchMukhi: 'शाखा मुखी / संयोजक',
    switchRole: 'भूमिका बदला',
    restrictedBranch: 'संबंधित शाखा',
    allBranches: 'सर्व शाखा (झोन ३४)',

    // Common actions & buttons
    save: 'जतन करा',
    cancel: 'रद्द करा',
    edit: 'संपादित करा',
    delete: 'हटवा',
    add: 'नवीन जोडा',
    searchPlaceholder: 'प्रचारक, शाखा किंवा ड्युटी शोधा...',
    exportExcel: 'एक्सेल डाउनलोड',
    exportPdf: 'प्रिंट / पीडीएफ सेव्ह',
    freezeMonth: 'महिना फ्रीज व प्रसिद्ध करा',
    unfreezeMonth: 'महिना अनफ्रीज करा',
    autoAllocate: 'स्वयं वाटप (Auto-Allocate)',
    approve: 'मंजूर करा',
    reject: 'नाकारा',
    approveAll: 'सर्व प्रलंबित मंजूर करा',
    filterBySector: 'सेक्टरनुसार',
    filterByBranch: 'शाखेनुसार',
    filterByCategory: 'श्रेणीनुसार',
    month: 'महिना',
    year: 'वर्ष',
    status: 'स्थिती',
    actions: 'कृती',

    // Duty types
    duty_pracharak: 'प्रचारक ड्युटी',
    duty_vichar: 'सतगुरु माता जी विचार',
    duty_local: 'स्थानिक प्रचारक',
    duty_other_zone: 'इतर झोन प्रचारक',
    duty_no_satsang: 'सत्संग नाही / सुट्टी',
    duty_unfilled: 'वाटप झालेले नाही',

    // Statuses
    status_approved: 'मंजूर',
    status_pending: 'मंजुरी प्रलंबित',
    status_rejected: 'नाकारले',
    status_present: 'हजर',
    status_absent: 'गैरहजर',
    status_unmarked: 'नोंद नाही',

    // Dashboard stats
    totalAllocated: 'वाटप केलेल्या ड्युट्या',
    vicharCount: 'विचार आठवडे',
    pendingApprovals: 'प्रलंबित मंजुऱ्या',
    fulfillmentRate: 'वाटप प्रमाण',
    activeBranches: 'सक्रिय शाखा',
    activePracharaks: 'सक्रिय प्रचारक',
    upcomingSatsangs: 'आगामी सत्संग',
    todaySchedules: 'नियोजित ड्युट्या',
    seeAllActivity: 'सर्व ड्युट्या पहा',
    workingHours: 'सत्संग वेळ',

    // Calendar & Matrix
    monthFrozenNotice: 'हा महिना फ्रीज व प्रसिद्ध केलेला आहे. बदल प्रतिबंधित आहेत.',
    mukhiRestrictedNotice: 'शाखा मुखी फक्त मंजूर आठवड्यांतच ड्युटी भरू शकतात:',
    allocateModalTitle: 'प्रचारक ड्युटी वाटप',
    selectDutyType: 'ड्युटी प्रकार',
    selectPracharak: 'प्रचारक निवडा',
    onHoldNotice: 'रजेवर असलेले प्रचारक या तारखेसाठी उपलब्ध नाहीत.',
    ruleViolation: 'नियम चेतावणी',
    overrideReason: 'ॲडमिन ओव्हरराइड कारण',

    // Attendance & Feedback
    markAttendance: 'हजेरी व सत्संग अभिप्राय',
    dutyConductedBy: 'ड्युटी कोणाद्वारे पूर्ण झाली',
    whoPerformedInstead: 'पर्यायी प्रचारक (गैरहजर असल्यास)',
    feedbackNotes: 'सत्संग अभिप्राय नोंद',
    markedBy: 'नोंदणीकर्ता',

    // Masters
    tabSectors: 'सेक्टर्स',
    tabBranches: 'शाखा (Branches)',
    tabPracharaks: 'प्रचारक यादी',
    tabDesignations: 'पदनाम (Designations)',
    tabSatsangs: 'सत्संग तपशील',
    tabHolds: 'प्रचारक रजा (Holds)',

    // Reports
    pracharakChartTitle: 'प्रचारक-निहाय मासिक ड्युटी चार्ट',
    satsangChartTitle: 'शाखा-निहाय सत्संग ड्युटी चार्ट',
    serialNo: 'अ.क्र.',
    pracharakName: 'प्रचारकाचे नाव',
    category: 'श्रेणी',
    branchName: 'शाखा / संगत',
    satsangDayTime: 'वार व वेळ',
    address: 'सत्संग भवन पत्ता',

    // Bulk upload
    downloadTemplate: 'एक्सेल टेम्पलेट डाउनलोड',
    uploadPrompt: 'एक्सेल (.xlsx) फाईल येथे ड्रॅग करा किंवा निवडा',
    previewAndApprove: 'अपलोड पूर्वदृश्य व निवारण',
    totalRows: 'एकूण ओळी',
    newRows: 'नवीन नोंदी',
    conflictRows: 'विवाद / अस्तित्वातील',
    errorRows: 'त्रुटी असलेल्या ओळी',
    applyImport: 'मंजूर नोंदी जतन करा',

    // Language names
    langEn: 'English',
    langHi: 'हिंदी',
    langMr: 'मराठी',
  },
};

/**
 * Fallback translator: Marathi -> Hindi -> English
 */
export function getTranslation(key: keyof typeof translations.en, lang: Language): string {
  const langDict = translations[lang];
  if (langDict && (langDict as any)[key]) {
    return (langDict as any)[key];
  }
  // Fallback to Hindi if Marathi missing
  if (lang === 'mr' && (translations.hi as any)[key]) {
    return (translations.hi as any)[key];
  }
  // Ultimate fallback to English
  return translations.en[key] || (key as string);
}
