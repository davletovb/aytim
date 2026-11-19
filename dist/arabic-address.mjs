import { text } from './catalog.mjs';

// The affected forms in each phrase, in the order they appear. Show the
// feminine singular in the lesson's existing pronunciation support.
const feminineAddressee = {
  'greetings-3': 'حالكِ (ḥāluki)',
  'greetings-5': 'بلقائكِ (biliqāʾiki)',
  'greetings-6': 'أراكِ (arāki)',
  'introductions-2': 'اسمكِ (ismuki)',
  'introductions-3': 'أنتِ (anti)',
  'cafe-2': 'من فضلكِ (min faḍliki)',
  'cafe-5': 'من فضلكِ (min faḍliki)',
  'directions-2': 'انعطفي (inʿaṭifī)',
  'directions-3': 'تابعي (tābiʿī)',
  'directions-6': 'توقّفي (tawaqqafī)، من فضلكِ (min faḍliki)',
  'plans-1': 'لديكِ (ladayki)',
  'plans-4': 'ستأتين (sataʾtīna)',
  'plans-5': 'بكِ (biki)',
  'family-5': 'عائلتكِ (ʿāʾilatuki)',
  'market-1': 'من فضلكِ (min faḍliki)',
  'opinions-2': 'أوافقكِ (uwāfiquki)',
  'opinions-6': 'يمكنكِ (yumkinuki)، أن تعطيني (an tuʿṭīnī)',
  'problems-3': 'يمكنكِ (yumkinuki)',
  'problems-6': 'أخبريني (akhbirīnī)، تعرفين (taʿrifīna)',
  'travel-6': 'لكِ (laki)',
  'work-3': 'يمكنكِ (yumkinuki)',
  'work-6': 'أخبريني (akhbirīnī)',
  'messages-2': 'يمكنكِ (yumkinuki)',
  'messages-3': 'تمكّنتِ (tamakkanti)',
  'messages-4': 'لكِ (laki)',
  'numbers-4': 'هاتفكِ (hātifiki)',
  'numbers-5': 'يمكنكِ (yumkinuki)',
  'numbers-6': 'اكتبيه (uktubīhi)، من فضلكِ (min faḍliki)',
  'apartment-6': 'يمكنكِ (yumkinuki)',
  'meal-1': 'تنصحين (tanṣaḥīna)',
  'meal-2': 'من فضلكِ (min faḍliki)',
  'meal-5': 'يمكنكِ (yumkinuki)',
  'appointment-4': 'لديكِ (ladayki)',
  'compare-4': 'كنتِ ستختارين (kunti satakhtārīna)، لديكِ (ladayki)',
  'instructions-1': 'فاستخدمي (fa-stakhdimī)',
  'instructions-2': 'أن تبدئي (an tabdaʾī)، تأكّدي (taʾakkadī)، معكِ (maʿaki)',
  'instructions-3': 'أرسليها (arsilīhā)',
  'instructions-4': 'أن تغيّري (an tughayyirī)',
  'instructions-5': 'واجهتِ (wājahti)، فأخبريني (fa-akhbirīnī)',
  'instructions-6': 'يمكنكِ (yumkinuki)، أن تريني (an turīnī)، فعلتِ (faʿalti)',
  'classroom-phrases-5': 'يمكنكِ (yumkinuki)، من فضلكِ (min faḍliki)',
  'free-time-4': 'تفعلين (tafʿalīna)، فراغكِ (farāghiki)',
  'cooking-2': 'يمكنكِ (yumkinuki)',
  'cooking-3': 'قطّعي (qaṭṭiʿī)',
  'cooking-4': 'أضيفي (aḍīfī)',
  'cooking-6': 'ضعي (ḍaʿī)',
  'phone-call-4': 'يمكنكِ (yumkinuki)',
  'phone-call-5': 'أسمعكِ (asmaʿuki)',
  'post-office-4': 'يمكنكِ (yumkinuki)',
  'post-office-5': 'اكتبي (uktubī)، من فضلكِ (min faḍliki)',
  'delivery-problem-2': 'يمكنكِ (yumkinuki)',
  'delivery-problem-4': 'لم تتمكّني (lam tatamakkanī)، يمكنكِ (yumkinuki)',
  'delivery-problem-5': 'أكّدي (akkidī)، من فضلكِ (min faḍliki)',
  'delivery-problem-6': 'احتجتِ (iḥtajti)',
  'feedback-2': 'عرضتِ (ʿaraḍti)',
  'colors-4': 'من فضلكِ (min faḍliki)',
  'bakery-2': 'من فضلكِ (min faḍliki)',
  'bakery-4': 'يمكنكِ (yumkinuki)',
  'bakery-6': 'ضعي (ḍaʿī)، من فضلكِ (min faḍliki)',
  'polite-requests-1': 'ساعديني (sāʿidīnī)، من فضلكِ (min faḍliki)',
  'polite-requests-5': 'قولي (qūlī)، من فضلكِ (min faḍliki)',
  'polite-requests-6': 'من فضلكِ (min faḍliki)',
  'belongings-2': 'قلمكِ (qalamuki)',
  'belongings-4': 'لكِ (laki)',
  'home-chores-4': 'يمكنكِ (yumkinuki)',
  'dietary-needs-3': 'يمكنكِ (yumkinuki)',
  'dietary-needs-5': 'من فضلكِ (min faḍliki)',
  'hosting-meal-1': 'تعالَيْ (taʿālay)',
  'hosting-meal-3': 'ضعي (ḍaʿī)',
  'hosting-meal-4': 'تريدين (turīdīna)',
  'city-services-6': 'اكتبي (uktubī)، من فضلكِ (min faḍliki)',
  'changing-plans-6': 'سأخبركِ (sa-ukhbiruki)',
  'telling-time-6': 'تنتهين (tantahīna)',
  'takeaway-2': 'ضعيه (ḍaʿīhi)، من فضلكِ (min faḍliki)',
  'takeaway-5': 'أعطيني (aʿṭīnī)، من فضلكِ (min faḍliki)',
  'inside-a-building-4': 'اصعدي (iṣʿadī)',
  'paying-for-things-3': 'يمكنكِ (yumkinuki)',
  'paying-for-things-5': 'أعطيني (aʿṭīnī)، من فضلكِ (min faḍliki)',
  'describing-people-6': 'صديقكِ (ṣadīqiki)',
  'apologising-6': 'سأخبركِ (sa-ukhbiruki)',
  'dialogue-routine-1': 'تذهبين (tadhhabīna)',
  'dialogue-wellbeing-1': 'تريدين (turīdīna)',
  'dialogue-cafe-1': 'تريدين (turīdīna)',
  'dialogue-hosting-meal-1': 'من فضلكِ (min faḍliki)',
  'dialogue-library-visit-1': 'يمكنكِ (yumkinuki)',
  'dialogue-paying-for-things-1': 'يمكنكِ (yumkinuki)',
  'dialogue-problems-1': 'حجزكِ (ḥajziki)',
  'dialogue-delivery-problem-1': 'دعيني (daʿīnī)'
};

const pluralAddressee = new Set([
  'shopping-1', 'decisions-3', 'dietary-needs-4', 'paying-for-things-1',
  'maintenance-3', 'maintenance-5', 'maintenance-6',
  'formal-requests-1', 'formal-requests-3', 'formal-requests-6',
  'meeting-summary-4', 'meeting-summary-5', 'meeting-summary-6', 'negotiating-priorities-1'
]);

const toWoman = text('Ayolga murojaat qilganda', 'When addressing a woman', 'При обращении к женщине',
  'عند مخاطبة امرأة', 'Bir kadına hitap ederken', 'Bei der Anrede einer Frau');

const addressContext = {
  singular: text('bir erkakka', 'speaking to one man', 'обращение к одному мужчине', 'مخاطبة رجل واحد', 'bir erkeğe hitap', 'Anrede eines Mannes'),
  plural: text('guruh yoki tashkilotga', 'addressing a group or organization', 'обращение к группе или организации',
    'مخاطبة مجموعة أو مؤسسة', 'bir gruba veya kuruma hitap', 'Anrede einer Gruppe oder Organisation')
};

export function arabicAddressee(entry) {
  if (Object.hasOwn(feminineAddressee, entry.id)) return 'singular';
  return pluralAddressee.has(entry.id) ? 'plural' : null;
}

export function arabicAddressContext(entry, base) {
  return addressContext[arabicAddressee(entry)]?.[base] ?? '';
}

export function arabicUsage(entry) {
  const example = feminineAddressee[entry.id];
  if (example) return Object.fromEntries(Object.entries(toWoman).map(([code, label]) => [code, label + ' — ' + example]));
  if (pluralAddressee.has(entry.id)) return addressContext.plural;
  return undefined;
}
