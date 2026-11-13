// F01: curated, speaker-to-speaker exchanges only. A consecutive sentence
// from the same speaker is not automatically a conversational answer.
// Each numeric reply reuses a vetted lesson phrase. A custom response includes
// all six languages and an Arabic reading aid. Cue indices are 1-based.
// References: docs/content-quality-audit-2026-11-13.md and docs/f01-f03-slice.md.
const response = (cue, uz, en, ru, ar, tr, de, romanization) =>
  [cue, { text: { uz, en, ru, ar, tr, de }, romanization }];

export const exchanges = {
  'greetings': [[3, 4]],
  'introductions': [
    [2, 1],
    response(3, 'Men O‘zbekistondanman.', 'I’m from Uzbekistan.', 'Я из Узбекистана.',
      'أنا من أوزبكستان.', 'Özbekistanlıyım.', 'Ich komme aus Usbekistan.', 'Anā min Ūzbakistān.')
  ],
  'classroom-phrases': [
    response(4, 'Albatta, sekinroq gapiraman.', 'Of course, I’ll speak more slowly.',
      'Конечно, я буду говорить медленнее.', 'بالطبع، سأتحدث ببطء أكثر.',
      'Elbette, daha yavaş konuşacağım.', 'Natürlich, ich spreche langsamer.',
      'Bi-ṭ-ṭabʿi, sa-ataḥaddathu bi-buṭʾin akthar.')
  ],
  'colors': [
    response(1, 'U ko‘k rangda.', 'It’s blue.', 'Она синяя.',
      'لونها أزرق.', 'Mavi.', 'Sie ist blau.', 'Lawnuhā azraq.')
  ],
  'polite-requests': [[3, 4], [1, 6]],
  'routine': [
    response(1, 'Ishga soat nechada ketasiz?', 'What time do you leave for work?',
      'Во сколько вы уходите на работу?', 'متى تذهب إلى العمل؟',
      'İşe saat kaçta çıkıyorsunuz?', 'Wann gehen Sie zur Arbeit?', 'Matā tadhhabu ilā al-ʿamal?')
  ],
  'outdoors': [
    response(5, 'Yaxshi fikr. Yomg‘ir yog‘ishi mumkin.', 'Good idea. It might rain.',
      'Хорошая мысль. Может пойти дождь.', 'فكرة جيدة. قد تمطر.',
      'İyi fikir. Yağmur yağabilir.', 'Gute Idee. Es könnte regnen.', 'Fikra jayyida. Qad tumṭir.')
  ],
  'wellbeing': [
    response(3, 'Suv ichishni xohlaysizmi?', 'Would you like some water?',
      'Хотите воды?', 'هل تريد بعض الماء؟', 'Biraz su ister misiniz?',
      'Möchten Sie etwas Wasser?', 'Hal turīdu baʿḍa al-māʾ?')
  ],
  'cafe': [
    response(1, 'Shakar qo‘shaymi?', 'Would you like sugar?', 'Вам сахар?',
      'هل تريد السكر؟', 'Şeker ister misiniz?', 'Möchten Sie Zucker?', 'Hal turīdu as-sukkar?')
  ],
  'meal': [
    response(1, 'Sabzavotli sho‘rvani tavsiya qilaman.', 'I recommend the vegetable soup.',
      'Советую овощной суп.', 'أنصحك بحساء الخضار.', 'Sebze çorbasını öneririm.',
      'Ich empfehle die Gemüsesuppe.', 'Anṣaḥuka bi-ḥasāʾi al-khuḍār.')
  ],
  'cooking': [
    response(2, 'Albatta, hozir yuvaman.', 'Of course, I’ll wash them now.',
      'Конечно, сейчас помою.', 'بالطبع، سأغسلها الآن.',
      'Tabii, şimdi yıkayacağım.', 'Natürlich, ich wasche sie jetzt.',
      'Bi-ṭ-ṭabʿi, sa-aghsiluhā al-ān.')
  ],
  'hosting-meal': [
    response(4, 'Ha, iltimos.', 'Yes, please.', 'Да, пожалуйста.',
      'نعم، من فضلك.', 'Evet, lütfen.', 'Ja, bitte.', 'Naʿam, min faḍlika.')
  ],
  'takeaway': [
    response(3, 'Taxminan o‘n daqiqa.', 'About ten minutes.', 'Примерно десять минут.',
      'حوالي عشر دقائق.', 'Yaklaşık on dakika.', 'Ungefähr zehn Minuten.',
      'Ḥawālī ʿashri daqāʾiq.')
  ],
  'bakery': [
    response(1, 'Ha, bugun ertalab yopilgan.', 'Yes, it was baked this morning.',
      'Да, его испекли сегодня утром.', 'نعم، خُبز هذا الصباح.',
      'Evet, bu sabah pişirildi.', 'Ja, es wurde heute Morgen gebacken.',
      'Naʿam, khubiza hādhā aṣ-ṣabāḥ.')
  ],
  'appointment': [[4, 5]],
  'phone-call': [[1, 2], [2, 3]],
  'changing-plans': [[4, 5]],
  'inside-a-building': [
    [1, 2],
    response(3, 'Ha, zinapoya yonida.', 'Yes, next to the stairs.',
      'Да, рядом с лестницей.', 'نعم، بجانب الدرج.',
      'Evet, merdivenin yanında.', 'Ja, neben der Treppe.', 'Naʿam, bi-jānibi ad-daraj.')
  ],
  'library-visit': [
    response(3, 'Ha, ikki haftadan keyin qaytarishingiz mumkin.',
      'Yes, you can return it in two weeks.', 'Да, можете вернуть через две недели.',
      'نعم، يمكنك إعادته بعد أسبوعين.', 'Evet, iki hafta sonra iade edebilirsiniz.',
      'Ja, Sie können es in zwei Wochen zurückgeben.',
      'Naʿam, yumkinuka iʿādatuhu baʿda usbūʿayn.')
  ],
  'travel-options': [[1, 6]],
  'travel': [
    response(1, 'Afsus. Keyingi poyezd soat to‘qqizda.',
      'I’m sorry. The next train is at nine.', 'Сожалею. Следующий поезд в девять.',
      'آسف، القطار التالي الساعة التاسعة.', 'Üzgünüm. Sonraki tren saat dokuzda.',
      'Das tut mir leid. Der nächste Zug fährt um neun.',
      'Āsif, al-qiṭār at-tālī as-sāʿa at-tāsiʿa.')
  ],
  'post-office': [
    response(2, 'O‘n yevro turadi.', 'It costs ten euros.', 'Это стоит десять евро.',
      'تكلف عشرة يوروهات.', 'On avro tutuyor.', 'Das kostet zehn Euro.',
      'Taklufu ʿasharata yūrūhāt.')
  ],
  'airport-help': [
    response(5, 'Eng yaqin bo‘sh reys ertaga ertalab uchadi.',
      'The next available flight leaves tomorrow morning.',
      'Ближайший рейс со свободными местами вылетает завтра утром.',
      'الرحلة التالية المتاحة تقلع صباح الغد.',
      'Yer olan ilk uçuş yarın sabah kalkıyor.',
      'Der nächste Flug mit freien Plätzen startet morgen früh.',
      'Ar-riḥla at-tāliya al-mutāḥa tuqliʿu ṣabāḥa al-ghad.')
  ],
  'coach-trip': [
    response(4, 'Yo‘q, qo‘shimcha to‘lov yo‘q.', 'No, there is no extra fee.',
      'Нет, доплачивать не нужно.', 'لا، لا توجد رسوم إضافية.',
      'Hayır, ek ücret yok.', 'Nein, es fällt keine zusätzliche Gebühr an.',
      'Lā, lā tūjadu rusūm iḍāfiyya.')
  ],
  'paying-for-things': [
    response(1, 'Ha, karta bilan to‘lashingiz mumkin.', 'Yes, you can pay by card.',
      'Да, можете оплатить картой.', 'نعم، يمكنك الدفع بالبطاقة.',
      'Evet, kartla ödeyebilirsiniz.', 'Ja, Sie können mit Karte bezahlen.',
      'Naʿam, yumkinuka ad-dafʿu bi-l-biṭāqa.')
  ],
  'opinions': [[1, 2]],
  'news-reports': [[1, 3]],
  'memories': [
    response(3, 'Eng katta o‘zgarish nima?', 'What has changed the most?',
      'Что изменилось больше всего?', 'ما الذي تغيّر أكثر شيء؟',
      'En çok ne değişti?', 'Was hat sich am meisten verändert?',
      'Mā alladhī taghayyara akthara shayʾ?')
  ],
  'community-garden': [
    response(4, 'To‘g‘ri. Ertaga yana tekshiramiz.', 'You’re right. Let’s check again tomorrow.',
      'Верно. Давайте проверим ещё раз завтра.', 'أنت محقّ. لنتحقّق مجددًا غدًا.',
      'Haklısınız. Yarın tekrar kontrol edelim.',
      'Stimmt. Prüfen wir es morgen noch einmal.',
      'Anta muḥiqq. Li-nataḥaqqaq mujaddadan ghadan.')
  ],
  'describing-change': [
    response(3, 'Bu yaxshi-ku.', 'That sounds nice.', 'Звучит приятно.',
      'يبدو هذا جميلًا.', 'Kulağa hoş geliyor.', 'Das klingt schön.',
      'Yabdū hādhā jamīlan.')
  ],
  'problems': [
    response(2, 'Kechirasiz, bandlovingizni tekshiraman.',
      'I’m sorry, I’ll check your reservation.',
      'Извините, я проверю ваше бронирование.',
      'آسف، سأتحقّق من حجزك.', 'Üzgünüm, rezervasyonunuzu kontrol edeceğim.',
      'Entschuldigung, ich prüfe Ihre Reservierung.',
      'Āsif, sa-ataḥaqqaq min ḥajzika.')
  ],
  'delivery-problem': [
    response(1, 'Yetkazilgan manzilni tekshirib ko‘raman.',
      'Let me check the delivery address.',
      'Сейчас проверю адрес доставки.',
      'دعني أتحقّق من عنوان التسليم.',
      'Teslimat adresini kontrol edeyim.', 'Ich prüfe die Lieferadresse.',
      'Daʿnī ataḥaqqaq min ʿunwān at-taslīm.')
  ],
  'maintenance': [
    response(1, 'Ustani yuborishni tashkil qilaman.',
      'I’ll arrange for a technician to come.',
      'Я организую визит мастера.',
      'سأرتّب زيارة فنّي.', 'Bir teknisyenin gelmesini ayarlayacağım.',
      'Ich organisiere einen Termin mit einem Techniker.',
      'Sa-urattibu ziyārata fannī.')
  ],
  'formal-requests': [
    response(3, 'Mahsulot hozir omborda yo‘q.',
      'The item is currently out of stock.', 'Сейчас товара нет на складе.',
      'المنتج غير متوفّر حاليًا.', 'Ürün şu anda stokta yok.',
      'Der Artikel ist derzeit nicht auf Lager.',
      'Al-muntaj ghayru mutawaffir ḥāliyyan.')
  ],
  'apologising': [
    response(1, 'Muammo yo‘q, xabar berganingiz uchun rahmat.',
      'No problem, thanks for letting me know.',
      'Ничего страшного, спасибо, что сообщили.',
      'لا بأس، شكرًا لإخباري.', 'Sorun değil, haber verdiğiniz için teşekkürler.',
      'Kein Problem, danke für die Information.',
      'Lā baʾs, shukran li-ikhbārī.')
  ],
  'work': [[1, 4]],
  'messages': [[4, 6]],
  'decisions': [[2, 3], [3, 4]],
  'meeting-summary': [[2, 3]],
  'evaluating-evidence': [[3, 4]],
  'negotiating-priorities': [[1, 2]]
};

// Stable lesson source identities are kept. New reply IDs are separate from
// lesson phrases, so introducing authentic replies cannot change lesson scores,
// vocabulary unlocks or the catalog's 384 source phrases.
export function lessonExchanges(unit) {
  return (exchanges[unit?.id] ?? []).map(([cueIndex, reply], index) => {
    const cue = unit.phrases[cueIndex - 1];
    const answer = Number.isInteger(reply) ? unit.phrases[reply - 1] : {
      ...reply,
      id: 'dialogue-' + unit.id + '-' + (index + 1),
      level: unit.level
    };
    if (!cue || !answer || cue === answer || cue.id === answer.id) {
      throw new RangeError('Invalid curated dialogue for ' + unit.id);
    }
    return { cue, reply: answer };
  });
}
