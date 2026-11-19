// Other natural word orders accepted when a learner builds a lesson sentence
// from word tiles. Keys are phrase IDs; each alternative must use exactly the
// same words as the reference sentence. Where the speaker's gender changes the
// wording (speaker-forms.mjs), both versions are listed and only the one that
// matches the current form applies. The list covers natural alternatives in
// both writing and dictation, plus short sentences used in Telegram practice.
export const alternativeOrders = {
  'greetings-3': { ru: ['Как дела у вас?'] },
  'greetings-4': {
    ar: ['شكرًا، أنا بخير.'],
    uz: ['Rahmat, yaxshiman.'],
    en: ['Thanks, I’m fine.'],
    ru: ['Спасибо, хорошо.'],
    tr: ['Teşekkür ederim, iyiyim.'],
    de: ['Danke, gut.']
  },
  'cafe-1': {
    ru: ['Я бы хотел чай.', 'Я бы хотела чай.'],
    de: ['Einen Tee hätte ich gern.'],
    uz: ['Iltimos, choy bersangiz.']
  },
  'plans-1': {
    ar: ['هل لديك غدًا وقت؟'],
    ru: ['Завтра у вас есть время?'],
    tr: ['Vaktiniz var mı yarın?']
  },
  'plans-3': {
    ru: ['У меня есть время после работы.'],
    de: ['Ich habe nach der Arbeit Zeit.']
  },
  'family-4': {
    ar: ['في عطلة نهاية الأسبوع نتناول الطعام معًا.'],
    ru: ['Мы едим вместе по выходным.']
  },
  'family-6': {
    en: ['I visit my parents often.'],
    ru: ['Я навещаю родителей часто.'],
    de: ['Ich besuche oft meine Eltern.'],
    tr: ['Sık sık anne babamı ziyaret ederim.']
  },
  'routine-1': {
    de: ['Meistens stehe ich um sieben auf.', 'Um sieben stehe ich meistens auf.'],
    ru: ['Обычно я встаю в семь.'],
    ar: ['أنهض عادةً في الساعة السابعة.'],
    tr: ['Saat yedide kalkarım genellikle.']
  },
  'routine-3': {
    ru: ['Я пешком хожу на работу.'],
    de: ['Zu Fuß gehe ich zur Arbeit.'],
    ar: ['أذهب مشيًا على الأقدام إلى العمل.']
  },
  'routine-4': { ru: ['В полдень начинается мой обеденный перерыв.'] },
  'routine-5': { en: ['In the evening I read a book.'] },
  'market-1': {
    uz: ['Iltimos, bir kilo olma bering.'],
    tr: ['Lütfen bir kilo elma.'],
    ar: ['من فضلك، كيلوغرامًا من التفاح.']
  },
  'market-3': {
    ru: ['Ещё я возьму две буханки хлеба.'],
    ar: ['سآخذ أيضًا رغيفين من الخبز.']
  },
  'shopping-1': { ru: ['Есть у вас размер поменьше?'] },
  'story-2': {
    de: ['Es fing an zu regnen, während ich wartete.'],
    uz: ['Yomg‘ir kutib turganimda yog‘a boshladi.'],
    en: ['It started to rain while I was waiting.'],
    ar: ['بدأ المطر يهطل بينما كنت أنتظر.']
  },
  'story-3': { ru: ['Я в конце концов взял такси.', 'Я в конце концов взяла такси.'] },
  'story-4': {
    en: ['The shop had closed by the time I arrived.'],
    ru: ['Магазин уже закрылся к моему приходу.'],
    de: ['Das Geschäft hatte schon geschlossen, als ich ankam.']
  },
  'story-5': { ar: ['لم أكن أعرف ماذا أفعل في البداية.'] },
  'story-6': { tr: ['Neyse ki bana biri yardım etti.'] },
  'reflection-2': {
    en: ['When I speak, I’d like to feel more confident.'],
    ar: ['عندما أتكلّم، أودّ أن أشعر بثقة أكبر.']
  },
  'reflection-6': {
    ru: ['Надеюсь, я однажды смогу использовать этот язык на работе.'],
    de: ['Ich hoffe, dass ich irgendwann die Sprache bei der Arbeit einsetzen kann.'],
    uz: ['Bu tilni bir kuni ishda ishlata olaman deb umid qilaman.'],
    ar: ['آمل أن أتمكّن يومًا ما من استخدامها في العمل.'],
    en: ['I hope I can use it someday at work.'],
    tr: ['Bir gün bu dili işte kullanabilirim umarım.']
  },
  'travel-3': { ru: ['Мне нужно в другом городе пересесть на другой поезд?'] },
  'work-3': {
    ru: ['Не могли бы вы объяснить эту часть ещё раз?'],
    uz: ['Yana bir bor shu qismini tushuntirib bera olasizmi?'],
    tr: ['Bir daha bu kısmı açıklayabilir misiniz?']
  },
  'messages-2': { ru: ['Не могли бы вы ещё раз отправить ссылку?'] },
  'messages-3': {
    de: ['Konnten Sie die Datei, die ich geschickt habe, öffnen?'],
    ru: ['Удалось вам открыть файл, который я отправил?', 'Удалось вам открыть файл, который я отправила?']
  },
  'messages-5': {
    uz: ['Yana bir bor vaqtni tasdiqlab qo‘yaylik.'],
    tr: ['Bir kez daha saati teyit edelim.']
  },
  'numbers-5': {
    uz: ['Yana bir bor raqamni ayta olasizmi?'],
    tr: ['Tekrar numarayı söyler misiniz?']
  },
  'meal-5': {
    ru: ['Не могли бы вы нам принести две ложки?'],
    uz: ['Ikkita qoshiq bizga olib kela olasizmi?'],
    tr: ['İki kaşık getirir misiniz bize?']
  },
  'meal-6': { de: ['Die Nachspeisen suchen wir uns später aus.', 'Später suchen wir uns die Nachspeisen aus.'] },
  'appointment-1': {
    en: ['On Tuesday at three I have an appointment.', 'I have an appointment at three on Tuesday.'],
    de: ['Am Dienstag um drei habe ich einen Termin.', 'Ich habe einen Termin am Dienstag um drei.'],
    ar: ['يوم الثلاثاء في الساعة الثالثة لديّ موعد.'],
    ru: ['Во вторник в три у меня встреча.'],
    tr: ['Saat üçte randevum var salı günü.']
  },
  'appointment-5': { uz: ['Menga chorshanba kuni soat to‘qqiz to‘g‘ri keladi.'] },
  'hotel-1': { ru: ['У меня на две ночи забронирован номер.'] },
  'hotel-6': {
    en: ['If one is available, could I have a quieter room?'],
    de: ['Falls eines frei ist, könnte ich ein ruhigeres Zimmer bekommen?'],
    uz: ['O‘shani olsam bo‘ladimi, tinchroq xona bo‘lsa?'],
    tr: ['Daha sessiz bir oda alabilir miyim, varsa?'],
    ar: ['إن توفّرت، هل يمكنني الحصول على غرفة أهدأ؟']
  },
  'compare-2': {
    de: ['Um den Stau zu vermeiden, würde ich lieber früher losfahren.'],
    ru: ['Чтобы избежать пробок, я предпочёл бы выехать пораньше.', 'Чтобы избежать пробок, я предпочла бы выехать пораньше.']
  },
  'compare-4': {
    en: ['If you had more time, which option would you choose?'],
    ru: ['Если бы у вас было больше времени, какой вариант вы бы выбрали?'],
    ar: ['لو كان لديك وقت أطول، أيّ خيار كنت ستختار؟'],
    de: ['Wenn Sie mehr Zeit hätten, welche Möglichkeit würden Sie wählen?']
  },
  'instructions-1': {
    en: ['Use the entrance on the other side if the door is locked.'],
    de: ['Benutzen Sie den Eingang auf der anderen Seite, wenn die Tür abgeschlossen ist.']
  },
  'decisions-4': {
    ar: ['إذا اتّفقنا على المسؤول عن كلّ خطوة، يمكنني دعم ذلك.'],
    en: ['If we agree on who is responsible for each step, I could support that.'],
    de: ['Wenn wir klären, wer für jeden Schritt verantwortlich ist, könnte ich das unterstützen.']
  },
  'classroom-phrases-5': {
    uz: ['Sekinroq gapira olasizmi, iltimos?'],
    tr: ['Lütfen biraz daha yavaş konuşabilir misiniz?'],
    ar: ['من فضلك، هل يمكنك التحدّث ببطء أكثر؟'],
    de: ['Könnten Sie langsamer sprechen, bitte?']
  },
  'free-time-3': {
    ru: ['На гитаре играет моя старшая сестра.'],
    de: ['Gitarre spielt meine ältere Schwester.']
  },
  'phone-call-4': {
    ru: ['Не могли бы вы мне перезвонить после пяти?'],
    uz: ['Menga soat beshdan keyin qayta qo‘ng‘iroq qila olasizmi?'],
    tr: ['Beni saat beşten sonra geri arayabilir misiniz?']
  },
  'post-office-1': {
    ru: ['Я бы хотел отправить эту посылку в Германию.', 'Я бы хотела отправить эту посылку в Германию.'],
    tr: ['Almanya’ya bu paketi göndermek istiyorum.']
  },
  'post-office-3': {
    ar: ['هل يصل الطرد في غضون أسبوع عادةً؟'],
    uz: ['Bir hafta ichida yetib boradimi odatda?']
  },
  'describing-change-1': {
    ar: ['لم أكن أعرف أحدًا عندما انتقلت إلى هنا في البداية.'],
    en: ['I didn’t know anyone when I first moved here.'],
    ru: ['Я никого не знал, когда я только переехал сюда.', 'Я никого не знала, когда я только переехала сюда.']
  },
  'describing-change-4': {
    ru: ['С тех пор я стал ездить на автобусе на работу.', 'С тех пор я стала ездить на автобусе на работу.'],
    tr: ['O zamandan beri otobüsle işe gitmeye başladım.']
  },
  'delivery-problem-6': {
    en: ['I can send a copy of the receipt if you need more details.'],
    ar: ['يمكنني إرسال نسخة من الإيصال إذا احتجت إلى مزيد من التفاصيل.'],
    de: ['Ich kann Ihnen eine Kopie der Quittung schicken, falls Sie weitere Angaben brauchen.']
  },
  'feedback-2': {
    ru: ['Мне стало трудно следить за мыслью, когда вы перешли ко второму примеру.'],
    ar: ['عندما عرضت المثال الثاني، وجدت صعوبة في متابعة الفكرة.'],
    en: ['When you introduced the second example, I found it hard to follow.'],
    tr: ['Konuyu takip etmekte zorlandım ikinci örneğe geçtiğinizde.']
  },
  'feedback-4': {
    en: ['If we added a concrete example, this section would be easier to follow.'],
    de: ['Wenn wir ein konkretes Beispiel hinzufügen würden, wäre dieser Abschnitt leichter zu verstehen.'],
    uz: ['Bu bo‘limni tushunish osonlashardi, aniq misol qo‘shsak.'],
    ru: ['Если бы мы добавили конкретный пример, этот раздел было бы легче понять.'],
    ar: ['إذا أضفنا مثالًا محدّدًا، سيكون هذا القسم أسهل فهمًا.']
  },
  'colors-4': {
    tr: ['Lütfen beyaz çantayı alabilir miyim?'],
    ar: ['من فضلك، الحقيبة البيضاء.']
  },
  'outdoors-4': {
    en: ['Shall we sit for a while in the shade?'],
    ar: ['هل نجلس في الظلّ قليلًا؟'],
    tr: ['Gölgede biraz oturalım mı?']
  },
  'outdoors-6': { ru: ['Мы вернёмся домой, если пойдёт дождь.'] },
  'bakery-2': { uz: ['Iltimos, menga ikkita kruassan bering.'] },
  'bakery-6': {
    ru: ['Пожалуйста, положите всё в бумажный пакет.'],
    ar: ['من فضلك، ضع كلّ شيء في كيس ورقيّ.'],
    de: ['Bitte packen Sie alles in eine Papiertüte.']
  },
  'library-visit-3': {
    ru: ['Можно взять на две недели эту книгу?'],
    tr: ['İki haftalığına bu kitabı ödünç alabilir miyim?'],
    de: ['Kann ich für zwei Wochen dieses Buch ausleihen?']
  },
  'library-visit-6': {
    de: ['Wenn die Bibliothek geschlossen ist, wo kann ich Bücher zurückgeben?'],
    uz: ['Kitoblarni kutubxona yopilgandan keyin qayerga topshirsam bo‘ladi?'],
    ar: ['أين يمكنني بعد إغلاق المكتبة إعادة الكتب؟'],
    tr: ['Kitapları kütüphane kapandıktan sonra nereye iade edebilirim?']
  },
  'community-garden-2': {
    ru: ['Рассада медленно росла, потому что ей не хватало солнца.'],
    tr: ['Yeterince güneş almadığı için fideler yavaş büyüdü.']
  },
  'community-garden-3': {
    de: ['Wir haben deshalb die Setzlinge an einen sonnigeren Platz umgesetzt.'],
    uz: ['Shuning uchun quyosh ko‘proq tushadigan joyga ko‘chatlarni ko‘chirdik.']
  },
  'community-garden-4': {
    en: ['We don’t need to water today if the soil is damp.'],
    de: ['Wir müssen heute nicht gießen, wenn die Erde feucht ist.']
  },
  'polite-requests-1': {
    ru: ['Пожалуйста, помогите мне.'],
    tr: ['Bana yardım edin, lütfen.'],
    ar: ['من فضلك، ساعدني.'],
    de: ['Helfen Sie mir bitte.']
  },
  'polite-requests-5': {
    de: ['Bitte sagen Sie es noch einmal.'],
    uz: ['Iltimos, yana bir marta ayting.'],
    ar: ['من فضلك، قل ذلك مرّة أخرى.'],
    en: ['Please say it again.']
  },
  'home-chores-1': {
    ru: ['Я каждый день мою посуду.', 'Каждый день я мою посуду.'],
    uz: ['Har kuni men idishlarni yuvaman.', 'Men idishlarni har kuni yuvaman.'],
    tr: ['Bulaşıkları her gün yıkarım.'],
    en: ['Every day I wash the dishes.'],
    ar: ['كلّ يوم أغسل الأطباق.'],
    de: ['Jeden Tag spüle ich das Geschirr.']
  },
  'wellbeing-1': {
    ru: ['Я сегодня хорошо себя чувствую.', 'Сегодня я чувствую себя хорошо.'],
    de: ['Ich fühle mich heute gut.'],
    uz: ['O‘zimni bugun yaxshi his qilyapman.'],
    ar: ['اليوم أشعر أنّني بخير.'],
    tr: ['Kendimi bugün iyi hissediyorum.']
  },
  'dietary-needs-5': { uz: ['Iltimos, menga yarim porsiya bering.'] },
  'hosting-meal-1': {
    uz: ['Kechki ovqatga yakshanba kuni keling.'],
    ar: ['تعالَ يوم الأحد لتناول العشاء.'],
    ru: ['В воскресенье приходите на ужин.'],
    tr: ['Akşam yemeğine pazar günü gelin.'],
    de: ['Kommen Sie zum Abendessen am Sonntag.']
  },
  'hosting-meal-3': {
    ru: ['Поставьте ещё две тарелки на стол.'],
    uz: ['Yana ikkita likopcha stolga qo‘ying.']
  },
  'changing-plans-1': {
    en: ['Because the bus is delayed, I will be late.'],
    de: ['Weil der Bus Verspätung hat, komme ich später.'],
    tr: ['Geç kalacağım, otobüs geciktiği için.']
  },
  'airport-help-4': {
    en: ['Because the first flight was delayed, I missed my connection.'],
    ru: ['Из-за задержки первого рейса я опоздал на пересадку.', 'Из-за задержки первого рейса я опоздала на пересадку.'],
    de: ['Ich habe meinen Anschluss wegen der Verspätung des ersten Fluges verpasst.'],
    ar: ['بسبب تأخّر الرحلة الأولى فاتتني رحلة الربط.'],
    tr: ['Aktarma uçuşunu kaçırdım, ilk uçuş geciktiği için.']
  },
  'travel-options-2': {
    ru: ['Можно ли выбрать другой рейс с этим билетом?'],
    ar: ['هل يمكنني بهذه التذكرة تغيير الرحلة؟'],
    tr: ['Başka bir sefere bu biletle geçebilir miyim?']
  },
  'travel-options-5': {
    en: ['Who will meet us if we arrive in the evening?'],
    uz: ['Kechqurun yetib borsak, kim bizni kutib oladi?']
  },
  'memories-1': {
    en: ['We used to visit the village every summer when I was a child.'],
    ar: ['كنّا نزور القرية كلّ صيف عندما كنت طفلًا.', 'كنّا نزور القرية كلّ صيف عندما كنت طفلةً.'],
    de: ['Wir fuhren jeden Sommer ins Dorf, als ich ein Kind war.']
  },
  'memories-5': {
    ru: ['Мы часто общаемся, хотя теперь мы живём далеко друг от друга.'],
    de: ['Wir sprechen oft miteinander, obwohl wir jetzt weit auseinander wohnen.'],
    ar: ['نتحدّث كثيرًا رغم أنّنا نسكن بعيدًا عن بعضنا الآن.']
  },
  'news-reports-4': {
    en: ['The date has not been confirmed yet on the official website.'],
    de: ['Der Termin ist auf der offiziellen Website noch nicht bestätigt.']
  },
  'formal-requests-5': {
    uz: ['Uch ish kuni ichida yozma javob bering, iltimos.'],
    tr: ['Üç iş günü içinde yazılı yanıt verin, lütfen.']
  },
  'learning-strategies-1': {
    de: ['Es fällt mir schwer, mich frei auszudrücken, obwohl ich den Text verstehe.'],
    ar: ['أجد صعوبة في التعبير بحرّيّة رغم أنّني أفهم النصّ.'],
    uz: ['Fikrimni erkin aytishga qiynalaman, matnni tushunsam ham.']
  },
  'learning-strategies-4': {
    en: ['It will be easier to stick to the plan if I set aside ten minutes a day.'],
    de: ['Ich kann den Plan leichter einhalten, wenn ich täglich zehn Minuten einplane.']
  },
  'negotiating-priorities-2': {
    de: ['Wir können die Qualität halten, wenn wir den Umfang der ersten Phase verringern.'],
    ar: ['يمكننا الحفاظ على الجودة إذا قلّلنا نطاق المرحلة الأولى.'],
    en: ['We can maintain quality if we reduce the scope of the first phase.']
  },
  'negotiating-priorities-6': {
    en: ['We will review the outcome on Friday and agree on the next phase together.'],
    uz: ['Juma kuni natijani ko‘rib, birgalikda keyingi bosqichni belgilaymiz.'],
    ru: ['Мы в пятницу оценим результат и определим следующий этап вместе.'],
    ar: ['يوم الجمعة سنراجع النتيجة ونتّفق على المرحلة التالية معًا.'],
    tr: ['Sonucu cuma günü değerlendirip bir sonraki aşamayı birlikte belirleyeceğiz.'],
    de: ['Wir prüfen am Freitag das Ergebnis und legen die nächste Phase gemeinsam fest.']
  },
  'directions-6': {
    uz: ['Iltimos, shu yerda to‘xtang.'],
    de: ['Bitte halten Sie hier an.']
  },
  'plans-5': { uz: ['Sizga keyinroq qo‘ng‘iroq qilaman.'] },
  'family-3': { uz: ['Yaqin atrofda do‘stim yashaydi.'] },
  'shopping-4': {
    uz: ['Bugun bu do‘kon ochiqmi?'],
    ru: ['Сегодня этот магазин открыт?'],
    tr: ['Bugün bu mağaza açık mı?']
  },
  'opinions-1': {
    uz: ['Bu, menimcha, yaxshi fikr.'],
    en: ['This is a good idea, in my opinion.'],
    tr: ['Bu bence iyi bir fikir.']
  },
  'reflection-1': { uz: ['Bir yildan beri bu tilni o‘rganyapman.'] },
  'travel-2': {
    uz: ['Qachon jo‘naydi keyingi poyezd?'],
    tr: ['Ne zaman kalkıyor bir sonraki tren?']
  },
  'work-1': {
    uz: ['Qachongacha bu vazifani tugatish kerak?'],
    ru: ['К какому сроку эту задачу нужно выполнить?'],
    tr: ['Ne zaman bu görevin teslim tarihi?']
  },
  'messages-1': { uz: ['Uzr, kech javob berganim uchun.'] },
  'numbers-2': {
    uz: ['O‘n kishi bor bu yerda.'],
    tr: ['On kişi var burada.']
  },
  'apartment-1': {
    uz: ['Kichik xonadonda men yashayman.'],
    ru: ['В небольшой квартире я живу.'],
    de: ['In einer kleinen Wohnung wohne ich.']
  },
  'instructions-2': {
    uz: ['Barcha hujjatlar yoningizda ekanini boshlashdan oldin tekshiring.'],
    ru: ['Убедитесь, что у вас есть все документы, прежде чем начать.'],
    ar: ['تأكّد من أن جميع الوثائق معك قبل أن تبدأ.']
  },
  'decisions-3': { uz: ['Kichikroq variantdan boshlab, uni ikki haftadan keyin ko‘rib chiqsak-chi?'] },
  'classroom-phrases-6': {
    uz: ['Nimani anglatadi bu so‘z?'],
    tr: ['Ne anlama geliyor bu kelime?']
  },
  'phone-call-2': {
    uz: ['Hozir u ish joyida emas.'],
    ru: ['Сейчас её нет на рабочем месте.']
  },
  'delivery-problem-1': {
    uz: ['Jo‘natma kecha yetkazilgani kuzatish sahifasida yozilgan.'],
    tr: ['Paketin dün teslim edildiği takip sayfasında yazıyor.']
  },
  'colors-1': { uz: ['Qanday rangda bu piyola?'] },
  'coach-trip-3': {
    uz: ['Keyingi qatnovga chiptamni almashtirsam bo‘ladimi?'],
    de: ['Kann ich auf die nächste Fahrt mein Ticket umbuchen?']
  },
  'community-garden-6': {
    uz: ['Kelasi bahorda ham, menimcha, shu usulni qo‘llashimiz kerak.'],
    en: ['I think next spring we should use the same method.']
  },
  'maintenance-6': {
    uz: ['Ta’mir qancha turishini ishni boshlashdan oldin ayta olasizmi?'],
    ru: ['Не могли бы вы до начала работ назвать стоимость ремонта?'],
    ar: ['هل يمكنكم قبل أن تبدؤوا العمل إخباري بتكلفة الإصلاح؟'],
    tr: ['Ne kadara mal olacağını onarıma başlamadan önce söyleyebilir misiniz?'],
  },
  'meeting-summary-1': { uz: ['Bu taklifni jamoa muhokama qildi, lekin hali bir qarorga kelmadi.'] },
  'belongings-1': { uz: ['Mening sumkam bu.'] },
  'home-chores-6': {
    uz: ['Ishimiz tugadi, dam olamiz endi.'],
    de: ['Wir sind fertig; wir können uns jetzt ausruhen.']
  },
  'wellbeing-4': { uz: ['Bir stakan suv kerak menga.'] },
  'dietary-needs-1': { uz: ['Yong‘oqqa allergiya bor menda.'] },
  'changing-plans-2': {
    uz: ['Yetib boraman yigirma daqiqadan keyin.'],
    ru: ['Через двадцать минут я приеду.']
  },
  'memories-2': {
    uz: ['Bu ko‘chada ilgari mashinalar kamroq edi.'],
    tr: ['Bu sokakta eskiden daha az araba vardı.']
  },
  'news-reports-2': {
    uz: ['Xabarga ko‘ra, kelasi oy qurilish tugaydi.'],
    tr: ['Habere göre gelecek ay inşaat bitecek.']
  },
  'formal-requests-1': {
    uz: ['Kelishilgan sanada buyurtmam yetib kelmagani yuzasidan yozyapman.'],
    de: ['Weil meine Bestellung nicht zum vereinbarten Termin eingetroffen ist, schreibe ich Ihnen.']
  },
  'where-things-are-1': {
    uz: ['Daftar ustida ruchka.'],
    de: ['Auf dem Heft liegt der Stift.']
  },
  'telling-time-3': {
    uz: ['Soat beshda dars boshlanadi.'],
    en: ['At five the lesson starts.'],
    ar: ['في الساعة الخامسة يبدأ الدرس.']
  },
  'takeaway-5': {
    uz: ['Iltimos, menga qoshiq ham bering.'],
    ar: ['من فضلك، أعطني ملعقة أيضًا.'],
    tr: ['Lütfen, bana bir de kaşık verin.'],
    de: ['Geben Sie mir auch einen Löffel, bitte.']
  },
  'inside-a-building-1': {
    uz: ['Qaysi qavatda bu bo‘lim?'],
    tr: ['Hangi katta bu bölüm?']
  },
  'paying-for-things-2': {
    uz: ['Bankomat bormi yaqin atrofda?'],
    tr: ['Bankamatik var mı yakınlarda?'],
    de: ['Gibt es einen Geldautomaten in der Nähe?']
  },
  'describing-people-2': { uz: ['Juda xotirjam odam u.'] },
  'apologising-6': {
    uz: ['Oldindan xabar beraman bundan keyin.'],
    ar: ['سأخبرك مسبقًا من الآن فصاعدًا.'],
    tr: ['Önceden haber vereceğim bundan sonra.'],
    de: ['Ich sage von jetzt an vorher Bescheid.']
  },
  'market-6': { en: ['Thanks, I don’t need a bag.'] },
  'apartment-4': {
    uz: ['Ikkita stul bor deraza yonida.'],
    en: ['By the window there are two chairs.'],
    tr: ['İki sandalye var pencerenin yanında.']
  },
  'instructions-3': {
    en: ['Send it to this address once you’ve filled out the form.'],
    de: ['Schicken Sie es an diese Adresse, wenn Sie das Formular ausgefüllt haben.']
  },
  'free-time-2': { en: ['On Sundays I go for a walk.'] },
  'delivery-problem-3': { en: ['I’ve asked my neighbors already, but none of them received it.'] },
  'meeting-summary-2': { en: ['Until we’ve checked which rooms are available, we can’t confirm the date.'] },
  'changing-plans-6': {
    en: ['If anything changes, I will let you know.'],
    de: ['Falls sich etwas ändert, gebe ich Ihnen Bescheid.']
  },
  'memories-6': { en: ['I would like to see my old friends next time I visit.'] },
  'learning-strategies-5': { en: ['I will check my progress and adjust my method after a week.'] },
  'evaluating-evidence-6': { en: ['In light of the available evidence, we need to phrase our conclusion cautiously.'] },
  'short-update-6': {
    en: ['At the next meeting, I would like five minutes.'],
    ar: ['في الاجتماع المقبل أطلب خمس دقائق.'],
    tr: ['Beş dakika rica ediyorum bir sonraki toplantıda.'],
    de: ['In der nächsten Besprechung hätte ich gern fünf Minuten.']
  },
  'cafe-2': {
    ru: ['Пожалуйста, без сахара.'],
    ar: ['من فضلك، بدون سكر.']
  },
  'opinions-2': { ru: ['Я с вами согласен в этом.', 'Я с вами согласна в этом.'] },
  'problems-2': { ru: ['Номер с двумя кроватями я просил.', 'Номер с двумя кроватями я просила.'] },
  'travel-5': { ru: ['На встречу я немного опоздаю.'] },
  'numbers-4': { ru: ['У вас какой номер телефона?'] },
  'hotel-5': {
    ru: ['Есть балкон в номере, который я забронировал.', 'Есть балкон в номере, который я забронировала.'],
    de: ['Einen Balkon hat das Zimmer, das ich gebucht habe.']
  },
  'decisions-5': { ru: ['Чтобы у всех была одна и та же информация, давайте запишем наше решение.'] },
  'classroom-phrases-1': { ru: ['Есть у меня вопрос.'] },
  'free-time-4': {
    ru: ['В свободное время чем вы занимаетесь?'],
    ar: ['في وقت فراغك ماذا تفعل؟'],
    tr: ['Ne yaparsınız boş zamanınızda?']
  },
  'cooking-1': {
    uz: ['Uchta pomidor kerak bizga.'],
    ru: ['Три помидора нам нужны.']
  },
  'post-office-4': { ru: ['Не могли бы вы мне дать номер отслеживания?'] },
  'delivery-problem-4': { ru: ['Не могли бы вы отправить замену, если посылку не удастся найти?'] },
  'outdoors-5': { ru: ['Давайте ещё и зонт возьмём.'] },
  'library-visit-4': { ru: ['В какой день мне нужно вернуть её?'] },
  'coach-trip-1': {
    ru: ['По пути этот автобус делает остановки?'],
    ar: ['هل هذه الحافلة تتوقّف في الطريق؟'],
    tr: ['Yol üzerinde bu otobüs duruyor mu?']
  },
  'community-garden-5': { ru: ['Мы собрали в этом году больше помидоров, чем раньше.'] },
  'belongings-6': {
    uz: ['Meniki emas bu daftar.'],
    ru: ['Не моя эта тетрадь.'],
    de: ['Mir gehört dieses Heft nicht.']
  },
  'home-chores-2': { ru: ['Я убираю свою комнату сегодня.'] },
  'wellbeing-6': { ru: ['Я бы хотел немного отдохнуть.', 'Я бы хотела немного отдохнуть.'] },
  'dietary-needs-2': { ru: ['Мясо я не ем.'] },
  'city-services-2': {
    uz: ['Soat nechada yopiladi bu yer?'],
    ru: ['Здесь во сколько закрываются?'],
    ar: ['يغلق هذا المكان في أيّ ساعة؟']
  },
  'airport-help-2': {
    ru: ['На багажной ленте не появился мой чемодан.'],
    de: ['Auf dem Gepäckband ist mein Koffer nicht angekommen.']
  },
  'travel-options-4': {
    ru: ['Одна пересадка нужна в более дешёвом варианте.'],
    de: ['Man muss bei der günstigeren Verbindung einmal umsteigen.']
  },
  'memories-3': { ru: ['Район сильно изменился с тех пор, как я уехал.', 'Район сильно изменился с тех пор, как я уехала.'] },
  'formal-requests-4': { ru: ['Прошу вернуть деньги, если товара нет в наличии.'] },
  'learning-strategies-2': {
    ru: ['Новые слова я повторяю в предложениях, а не по отдельности.'],
    tr: ['Yeni kelimeleri cümle içinde tekrar ediyorum, tek başına değil.']
  },
  'where-things-are-4': {
    uz: ['Eshik oldida mushuk turibdi.'],
    ru: ['Перед дверью стоит кот.'],
    ar: ['تقف القطّة أمام الباب.'],
    tr: ['Kapının önünde kedi duruyor.']
  },
  'telling-time-5': { ru: ['Немного времени мне нужно.'] },
  'takeaway-1': { ru: ['Я это возьму с собой.'] },
  'paying-for-things-4': {
    ru: ['В цену включён налог?'],
    de: ['Ist im Preis die Steuer enthalten?']
  },
  'apologising-4': { ru: ['Я сегодня же исправлю это.'] },
  'short-update-2': {
    uz: ['Ikki narsa o‘tgan haftadan beri o‘zgardi.'],
    ru: ['Две вещи изменились с прошлой недели.'],
    tr: ['İki şey geçen haftadan beri değişti.'],
    de: ['Zwei Dinge haben sich seit letzter Woche geändert.']
  },
  'introductions-3': { ar: ['أنت من أين؟'] },
  'plans-2': { ar: ['في الساعة السادسة لنلتقِ.'] },
  'family-2': {
    ar: ['تذهب أختي الصغرى إلى المدرسة.'],
    tr: ['Okula küçük kız kardeşim gidiyor.'],
    de: ['Zur Schule geht meine jüngere Schwester.']
  },
  'problems-5': { ar: ['إذا لزم الأمر، يمكنني الانتظار.'] },
  'compare-5': { ar: ['إذا استقللنا سيارة أجرة واحدة، يمكننا توفير المال.'] },
  'changing-plans-5': { ar: ['لنلتقِ إذًا في الساعة العاشرة.'] },
  'directions-1': { tr: ['Nerede tren istasyonu?'] },
  'directions-5': {
    uz: ['Markazga qaysi avtobus boradi?'],
    tr: ['Şehir merkezine hangi otobüs gider?']
  },
  'instructions-5': { tr: ['Ne olduğunu bana bildirin, bir sorunla karşılaşırsanız.'] },
  'phone-call-3': { tr: ['Bir mesaj bırakabilir miyim ona?'] },
  'home-chores-3': { tr: ['Çamaşır yıkarız cumartesi günleri.'] },
  'city-services-1': { tr: ['Nerede en yakın eczane?'] },
  'formal-requests-6': { tr: ['Şimdiden bu konuyu çözmekteki yardımınız için teşekkür ederim.'] },
  'evaluating-evidence-2': { tr: ['Genel bir sonuca tek bir örneğe dayanarak varmamalıyız.'] },
  'takeaway-2': {
    ar: ['من فضلك، ضعه في علبة منفصلة.'],
    tr: ['Ayrı bir kaba koyun, lütfen.'],
    de: ['Tun Sie es bitte in eine eigene Schachtel.']
  },
  'meal-3': { tr: ['Kuruyemiş var mı bu yemekte?'] },
  'describing-people-1': { tr: ['Benden uzun küçük kız kardeşim.'] },
  'apologising-1': { tr: ['Özür dilerim gecikme için.'] },
  'shopping-6': { de: ['Danke, ich schaue mich nur um.'] },
  'belongings-3': { de: ['Auf dem Tisch liegt das Buch.'] },
  'inside-a-building-5': { de: ['Am Ende des Flurs ist die Tür.'] },
  'problems-6': { de: ['Sobald Sie etwas erfahren, geben Sie mir Bescheid.'] },
  'travel-6': { de: ['Wenn ich angekommen bin, schreibe ich Ihnen.'] },
  'work-6': { de: ['Falls sich etwas ändert, sagen Sie mir Bescheid.'] },
  'appointment-2': { de: ['Etwas ist mir dazwischengekommen. Ich kann nicht kommen.'] },
  'apartment-2': { de: ['Neben dem Wohnzimmer ist die Küche.'] },
  'phone-call-1': { de: ['Könnte ich mit Mira sprechen, bitte?'] },
  'feedback-6': { de: ['Bevor wir sie abschicken, schauen wir uns die überarbeitete Fassung gemeinsam an.'] },
  'meeting-summary-6': { de: ['Setzen Sie ihn auf die Tagesordnung der nächsten Besprechung, falls ein Punkt noch offen ist.'] },
  'where-things-are-2': { de: ['Unter dem Tisch ist die Tasche.'] },
  'telling-time-4': { de: ['Eine halbe Stunde haben wir gewartet.'] }
};
