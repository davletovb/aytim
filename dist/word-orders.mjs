// Other natural word orders accepted when a learner builds a lesson sentence
// from word tiles. Keys are phrase IDs; each alternative must use exactly the
// same words as the reference sentence. Where the speaker's gender changes the
// wording (speaker-forms.mjs), both versions are listed and only the one that
// matches the current form applies. Writing tasks use the longest phrase
// of each lesson, so those sentences are covered for every target language.
export const alternativeOrders = {
  'greetings-3': { ru: ['Как дела у вас?'] },
  'greetings-4': { ar: ['شكرًا، أنا بخير.'] },
  'cafe-1': { ru: ['Я бы хотел чай.', 'Я бы хотела чай.'], de: ['Einen Tee hätte ich gern.'], uz: ['Iltimos, choy bersangiz.'] },
  'plans-1': { ar: ['هل لديك غدًا وقت؟'] },
  'plans-3': { ru: ['У меня есть время после работы.'], de: ['Ich habe nach der Arbeit Zeit.'] },
  'family-4': { ar: ['في عطلة نهاية الأسبوع نتناول الطعام معًا.'] },
  'family-6': {
    en: ['I visit my parents often.'], ru: ['Я навещаю родителей часто.'],
    de: ['Ich besuche oft meine Eltern.'], tr: ['Sık sık anne babamı ziyaret ederim.']
  },
  'routine-1': { de: ['Meistens stehe ich um sieben auf.', 'Um sieben stehe ich meistens auf.'] },
  'routine-3': { ru: ['Я пешком хожу на работу.'] },
  'routine-4': { ru: ['В полдень начинается мой обеденный перерыв.'] },
  'routine-5': { en: ['In the evening I read a book.'] },
  'market-1': { uz: ['Iltimos, bir kilo olma bering.'], tr: ['Lütfen bir kilo elma.'], ar: ['من فضلك، كيلوغرامًا من التفاح.'] },
  'market-3': { ru: ['Ещё я возьму две буханки хлеба.'] },
  'shopping-1': { ru: ['Есть у вас размер поменьше?'] },
  'story-2': { de: ['Es fing an zu regnen, während ich wartete.'] },
  'story-3': { ru: ['Я в конце концов взял такси.', 'Я в конце концов взяла такси.'] },
  'story-4': { en: ['The shop had closed by the time I arrived.'] },
  'story-5': { ar: ['لم أكن أعرف ماذا أفعل في البداية.'] },
  'story-6': { tr: ['Neyse ki bana biri yardım etti.'] },
  'reflection-2': { en: ['When I speak, I’d like to feel more confident.'] },
  'reflection-6': {
    ru: ['Надеюсь, я однажды смогу использовать этот язык на работе.'],
    de: ['Ich hoffe, dass ich irgendwann die Sprache bei der Arbeit einsetzen kann.'],
    uz: ['Bu tilni bir kuni ishda ishlata olaman deb umid qilaman.'],
    ar: ['آمل أن أتمكّن يومًا ما من استخدامها في العمل.']
  },
  'travel-3': { ru: ['Мне нужно в другом городе пересесть на другой поезд?'] },
  'work-3': { ru: ['Не могли бы вы объяснить эту часть ещё раз?'], uz: ['Yana bir bor shu qismini tushuntirib bera olasizmi?'] },
  'messages-2': { ru: ['Не могли бы вы ещё раз отправить ссылку?'] },
  'messages-3': { de: ['Konnten Sie die Datei, die ich geschickt habe, öffnen?'] },
  'messages-5': { uz: ['Yana bir bor vaqtni tasdiqlab qo‘yaylik.'] },
  'numbers-5': { uz: ['Yana bir bor raqamni ayta olasizmi?'] },
  'meal-5': { ru: ['Не могли бы вы нам принести две ложки?'] },
  'meal-6': { de: ['Die Nachspeisen suchen wir uns später aus.', 'Später suchen wir uns die Nachspeisen aus.'] },
  'appointment-1': {
    en: ['On Tuesday at three I have an appointment.', 'I have an appointment at three on Tuesday.'],
    de: ['Am Dienstag um drei habe ich einen Termin.', 'Ich habe einen Termin am Dienstag um drei.'],
    ar: ['يوم الثلاثاء في الساعة الثالثة لديّ موعد.']
  },
  'appointment-5': { uz: ['Menga chorshanba kuni soat to‘qqiz to‘g‘ri keladi.'] },
  'hotel-1': { ru: ['У меня на две ночи забронирован номер.'] },
  'hotel-6': {
    en: ['If one is available, could I have a quieter room?'],
    de: ['Falls eines frei ist, könnte ich ein ruhigeres Zimmer bekommen?']
  },
  'compare-2': { de: ['Um den Stau zu vermeiden, würde ich lieber früher losfahren.'] },
  'compare-4': {
    en: ['If you had more time, which option would you choose?'],
    ru: ['Если бы у вас было больше времени, какой вариант вы бы выбрали?'],
    ar: ['لو كان لديك وقت أطول، أيّ خيار ستختار؟']
  },
  'instructions-1': {
    en: ['Use the entrance on the other side if the door is locked.'],
    de: ['Benutzen Sie den Eingang auf der anderen Seite, wenn die Tür abgeschlossen ist.']
  },
  'decisions-4': { ar: ['إذا اتّفقنا على المسؤول عن كلّ خطوة، يمكنني دعم ذلك.'] },
  'classroom-phrases-5': {
    uz: ['Sekinroq gapira olasizmi, iltimos?'],
    tr: ['Lütfen biraz daha yavaş konuşabilir misiniz?'],
    ar: ['من فضلك، هل يمكنك التحدّث ببطء أكثر؟']
  },
  'free-time-3': { ru: ['На гитаре играет моя старшая сестра.'] },
  'phone-call-4': {
    ru: ['Не могли бы вы мне перезвонить после пяти?'],
    uz: ['Menga soat beshdan keyin qayta qo‘ng‘iroq qila olasizmi?'],
    tr: ['Beni saat beşten sonra geri arayabilir misiniz?']
  },
  'post-office-1': { ru: ['Я бы хотел отправить эту посылку в Германию.', 'Я бы хотела отправить эту посылку в Германию.'] },
  'post-office-3': { ar: ['هل يصل الطرد في غضون أسبوع عادةً؟'] },
  'describing-change-1': { ar: ['لم أكن أعرف أحدًا عندما انتقلت إلى هنا في البداية.'] },
  'describing-change-4': { ru: ['С тех пор я стал ездить на автобусе на работу.', 'С тех пор я стала ездить на автобусе на работу.'] },
  'delivery-problem-6': { en: ['I can send a copy of the receipt if you need more details.'] },
  'feedback-2': {
    ru: ['Мне стало трудно следить за мыслью, когда вы перешли ко второму примеру.'],
    ar: ['عندما عرضت المثال الثاني، وجدت صعوبة في متابعة الفكرة.']
  },
  'feedback-4': {
    en: ['If we added a concrete example, this section would be easier to follow.'],
    de: ['Wenn wir ein konkretes Beispiel hinzufügen würden, wäre dieser Abschnitt leichter zu verstehen.']
  },
  'colors-4': { tr: ['Lütfen beyaz çantayı alabilir miyim?'], ar: ['من فضلك، الحقيبة البيضاء.'] },
  'outdoors-4': { en: ['Shall we sit for a while in the shade?'], ar: ['هل نجلس في الظلّ قليلًا؟'] },
  'outdoors-6': { ru: ['Мы вернёмся домой, если пойдёт дождь.'] },
  'bakery-2': { uz: ['Iltimos, menga ikkita kruassan bering.'] },
  'bakery-6': { ru: ['Пожалуйста, положите всё в бумажный пакет.'], ar: ['من فضلك، ضع كلّ شيء في كيس ورقيّ.'] },
  'library-visit-3': { ru: ['Можно взять на две недели эту книгу?'], tr: ['İki haftalığına bu kitabı ödünç alabilir miyim?'] },
  'library-visit-6': { de: ['Wenn die Bibliothek geschlossen ist, wo kann ich Bücher zurückgeben?'] },
  'community-garden-2': { ru: ['Рассада медленно росла, потому что ей не хватало солнца.'] },
  'community-garden-3': {
    de: ['Wir haben deshalb die Setzlinge an einen sonnigeren Platz umgesetzt.'],
    uz: ['Shuning uchun quyosh ko‘proq tushadigan joyga ko‘chatlarni ko‘chirdik.']
  },
  'community-garden-4': { en: ['We don’t need to water today if the soil is damp.'] },
  'polite-requests-1': { ru: ['Пожалуйста, помогите мне.'], tr: ['Bana yardım edin, lütfen.'] },
  'polite-requests-5': { de: ['Bitte sagen Sie es noch einmal.'], uz: ['Iltimos, yana bir marta ayting.'], ar: ['من فضلك، قل ذلك مرّة أخرى.'] },
  'home-chores-1': {
    ru: ['Я каждый день мою посуду.', 'Каждый день я мою посуду.'],
    uz: ['Har kuni men idishlarni yuvaman.', 'Men idishlarni har kuni yuvaman.'],
    tr: ['Bulaşıkları her gün yıkarım.']
  },
  'wellbeing-1': {
    ru: ['Я сегодня хорошо себя чувствую.', 'Сегодня я чувствую себя хорошо.'],
    de: ['Ich fühle mich heute gut.'],
    uz: ['O‘zimni bugun yaxshi his qilyapman.']
  },
  'dietary-needs-5': { uz: ['Iltimos, menga yarim porsiya bering.'] },
  'hosting-meal-1': { uz: ['Kechki ovqatga yakshanba kuni keling.'], ar: ['تعال يوم الأحد لتناول العشاء.'] },
  'hosting-meal-3': { ru: ['Поставьте ещё две тарелки на стол.'] },
  'changing-plans-1': {
    en: ['Because the bus is delayed, I will be late.'],
    de: ['Weil der Bus Verspätung hat, komme ich später.']
  },
  'airport-help-4': {
    en: ['Because the first flight was delayed, I missed my connection.'],
    ru: ['Из-за задержки первого рейса я опоздал на пересадку.', 'Из-за задержки первого рейса я опоздала на пересадку.'],
    de: ['Ich habe meinen Anschluss wegen der Verspätung des ersten Fluges verpasst.'],
    ar: ['بسبب تأخّر الرحلة الأولى فاتتني رحلة الربط.']
  },
  'travel-options-2': { ru: ['Можно ли выбрать другой рейс с этим билетом?'] },
  'travel-options-5': { en: ['Who will meet us if we arrive in the evening?'] },
  'memories-1': { en: ['We used to visit the village every summer when I was a child.'] },
  'memories-5': {
    ru: ['Мы часто общаемся, хотя теперь мы живём далеко друг от друга.'],
    de: ['Wir sprechen oft miteinander, obwohl wir jetzt weit auseinander wohnen.'],
    ar: ['نتحدّث كثيرًا رغم أنّنا نسكن بعيدًا عن بعضنا الآن.']
  },
  'news-reports-4': {
    en: ['The date has not been confirmed yet on the official website.'],
    de: ['Der Termin ist auf der offiziellen Website noch nicht bestätigt.']
  },
  'formal-requests-5': { uz: ['Uch ish kuni ichida yozma javob bering, iltimos.'], tr: ['Üç iş günü içinde yazılı yanıt verin, lütfen.'] },
  'learning-strategies-1': {
    de: ['Es fällt mir schwer, mich frei auszudrücken, obwohl ich den Text verstehe.'],
    ar: ['أجد صعوبة في التعبير بحرّيّة رغم أنّني أفهم النصّ.']
  },
  'learning-strategies-4': { en: ['It will be easier to stick to the plan if I set aside ten minutes a day.'] },
  'negotiating-priorities-2': {
    de: ['Wir können die Qualität halten, wenn wir den Umfang der ersten Phase verringern.'],
    ar: ['يمكننا الحفاظ على الجودة إذا قلّلنا نطاق المرحلة الأولى.']
  },
  'negotiating-priorities-6': { en: ['We will review the outcome on Friday and agree on the next phase together.'] }
};
