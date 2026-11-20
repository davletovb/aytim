import { arabicUsage } from './arabic-address.mjs';
import { phrases } from './content.mjs';

const phraseById = new Map(phrases.map(entry => [entry.id, entry]));

// F01: curated, speaker-to-speaker exchanges only. A consecutive sentence
// from the same speaker is not automatically a conversational answer.
// Each numeric reply reuses a vetted lesson phrase. A custom response includes
// all six languages and an Arabic reading aid. Cue indices are 1-based.
// References: docs/content-quality-audit-2026-11-13.md and docs/f01-f03-slice.md.
const response = (cue, uz, en, ru, ar, tr, de, romanization, distractorIndices) =>
  [cue, { text: { uz, en, ru, ar, tr, de }, romanization }, distractorIndices];

export const exchanges = {
  'greetings': [[3, 4]],
  'introductions': [
    [2, 1],
    response(3, 'Men O‘zbekistondanman.', 'I’m from Uzbekistan.', 'Я из Узбекистана.',
      'أنا من أوزبكستان.', 'Özbekistanlıyım.', 'Ich komme aus Usbekistan.', 'Anā min Ūzbakistān.')
  ],
  'numbers': [
    response(5, 'Albatta: nol, besh, ikki, to‘qqiz.', 'Of course: zero, five, two, nine.',
      'Конечно: ноль, пять, два, девять.', 'بالطبع: صفر، خمسة، اثنان، تسعة.',
      'Elbette: sıfır, beş, iki, dokuz.', 'Natürlich: null, fünf, zwei, neun.',
      'Bi-ṭ-ṭabʿ: ṣifr, khamsa, ithnān, tisʿa.', [2, 3, 4])
  ],
  'classroom-phrases': [
    response(5, 'Albatta, sekinroq gapiraman.', 'Of course, I’ll speak more slowly.',
      'Конечно, я буду говорить медленнее.', 'بالطبع، سأتحدّث ببطء أكثر.',
      'Elbette, daha yavaş konuşacağım.', 'Natürlich, ich spreche langsamer.',
      'Bi-ṭ-ṭabʿi, sa-ataḥaddathu bi-buṭʾin akthar.')
  ],
  'colors': [
    response(1, 'U ko‘k rangda.', 'It’s blue.', 'Она синяя.',
      'لونه أزرق.', 'Mavi.', 'Sie ist blau.', 'Lawnuhu azraq.', [3, 4, 6])
  ],
  'polite-requests': [[3, 4], [1, 6]],
  'belongings': [
    response(4, 'Ha, bu meniki. Rahmat!', 'Yes, it’s mine. Thank you!',
      'Да, это мой. Спасибо!', 'نعم، هو لي. شكرًا!',
      'Evet, benim. Teşekkürler!', 'Ja, der gehört mir. Danke!',
      'Naʿam, huwa lī. Shukran!', [1, 2, 3, 5])
  ],
  'where-things-are': [
    response(6, 'U quti yonida.', 'It’s next to the box.',
      'Он рядом с коробкой.', 'هو بجانب الصندوق.',
      'Kutunun yanında.', 'Er liegt neben der Schachtel.',
      'Huwa bi-jānibi aṣ-ṣundūq.', [2, 3, 4, 5])
  ],
  'family': [
    response(5, 'Ular boshqa shaharda yashashadi.', 'They live in another city.',
      'Они живут в другом городе.', 'يعيشون في مدينة أخرى.',
      'Başka bir şehirde yaşıyorlar.', 'Sie wohnen in einer anderen Stadt.',
      'Yaʿīshūna fī madīnatin ukhrā.', [1, 2, 4, 6])
  ],
  'routine': [
    response(1, 'Ishga soat nechada ketasiz?', 'What time do you leave for work?',
      'Во сколько вы уходите на работу?', 'متى تذهب إلى العمل؟',
      'İşe saat kaçta çıkıyorsunuz?', 'Wann gehen Sie zur Arbeit?', 'Matā tadhhabu ilā al-ʿamal?')
  ],
  'apartment': [
    response(6, 'Albatta, hozir yopaman.', 'Of course, I’ll close it now.',
      'Конечно, сейчас закрою.', 'بالطبع، سأغلقه الآن.',
      'Elbette, şimdi kapatıyorum.', 'Natürlich, ich schließe sie jetzt.',
      'Bi-ṭ-ṭabʿi, sa-ughliquhu al-ān.')
  ],
  'free-time': [
    response(6, 'Ajoyib! Qayerda mashq qilasiz?', 'That’s great! Where do you practice?',
      'Здорово! Где вы занимаетесь?', 'هذا رائع! أين تتدرّب؟',
      'Harika! Nerede pratik yapıyorsunuz?', 'Das ist toll! Wo üben Sie?',
      'Hādhā rāʾiʿ! Ayna tatadarrab?', [1, 2, 3, 5])
  ],
  'outdoors': [
    response(5, 'Yaxshi fikr. Yomg‘ir yog‘ishi mumkin.', 'Good idea. It might rain.',
      'Хорошая мысль. Может пойти дождь.', 'فكرة جيّدة. قد تمطر.',
      'İyi fikir. Yağmur yağabilir.', 'Gute Idee. Es könnte regnen.', 'Fikra jayyida. Qad tumṭir.')
  ],
  'home-chores': [
    response(4, 'Albatta, hoziroq olib chiqaman.', 'Sure, I’ll do it right away.',
      'Конечно, сейчас вынесу.', 'بالتأكيد، سأفعل ذلك فورًا.',
      'Tabii, hemen çıkarıyorum.', 'Gern, ich mache das sofort.',
      'Bi-t-taʾkīd, sa-afʿalu dhālika fawran.', [1, 3, 5])
  ],
  'wellbeing': [
    response(3, 'Suv ichishni xohlaysizmi?', 'Would you like some water?',
      'Хотите воды?', 'هل تريد بعض الماء؟', 'Biraz su ister misiniz?',
      'Möchten Sie etwas Wasser?', 'Hal turīdu baʿḍa al-māʾ?')
  ],
  'telling-time': [
    response(6, 'Soat oltida bo‘shayman.', 'I finish at six o’clock.',
      'Я освобождаюсь в шесть часов.', 'أنتهي في الساعة السادسة.',
      'Saat altıda bitiriyorum.', 'Ich bin um sechs Uhr fertig.',
      'Antahī fī as-sāʿati as-sādisa.', [1, 2, 3, 4])
  ],
  'cafe': [
    response(1, 'Shakar qo‘shaymi?', 'Would you like sugar?', 'Вам с сахаром?',
      'هل تريد السكر؟', 'Şeker ister misiniz?', 'Möchten Sie Zucker?', 'Hal turīdu as-sukkar?')
  ],
  'market': [
    response(2, 'Ha, bugun ertalab kelgan.', 'Yes, they arrived this morning.',
      'Да, их привезли сегодня утром.', 'نعم، وصلت هذا الصباح.',
      'Evet, bu sabah geldi.', 'Ja, sie sind heute Morgen angekommen.',
      'Naʿam, waṣalat hādhā aṣ-ṣabāḥ.')
  ],
  'meal': [
    response(1, 'Sabzavotli sho‘rvani tavsiya qilaman.', 'I recommend the vegetable soup.',
      'Советую овощной суп.', 'أنصح بحساء الخضار.', 'Sebze çorbasını öneririm.',
      'Ich empfehle die Gemüsesuppe.', 'Anṣaḥu bi-ḥasāʾi al-khuḍār.')
  ],
  'cooking': [
    response(2, 'Albatta, hozir yuvaman.', 'Of course, I’ll wash them now.',
      'Конечно, сейчас помою.', 'بالطبع، سأغسلها الآن.',
      'Tabii, şimdi yıkayacağım.', 'Natürlich, ich wasche sie jetzt.',
      'Bi-ṭ-ṭabʿi, sa-aghsiluhā al-ān.')
  ],
  'dietary-needs': [
    response(4, 'Ha, sabzavotli sho‘rva achchiq emas.', 'Yes, the vegetable soup is not spicy.',
      'Да, овощной суп неострый.', 'نعم، حساء الخضار غير حارّ.',
      'Evet, sebze çorbası acı değil.', 'Ja, die Gemüsesuppe ist nicht scharf.',
      'Naʿam, ḥasāʾu al-khuḍāri ghayru ḥārr.')
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
  'directions': [
    response(4, 'Yo‘q, piyoda taxminan besh daqiqa.', 'No, it’s about a five-minute walk.',
      'Нет, пешком примерно пять минут.', 'لا، حوالي خمس دقائق سيرًا على الأقدام.',
      'Hayır, yürüyerek yaklaşık beş dakika.', 'Nein, zu Fuß sind es ungefähr fünf Minuten.',
      'Lā, ḥawālī khamsi daqāʾiqa sayran ʿalā al-aqdām.')
  ],
  'plans': [[1, 3, [4, 6, 'appointment-6']]],
  'appointment': [[4, 5]],
  'phone-call': [[1, 2], [2, 3]],
  'city-services': [
    response(4, 'Yo‘q, xizmat oynasida navbatda turishingiz mumkin.',
      'No, you can wait in line at the counter.',
      'Нет, вы можете встать в очередь у стойки.',
      'لا، يمكنك الانتظار في الطابور عند الشبّاك.',
      'Hayır, gişede sıraya girebilirsiniz.', 'Nein, Sie können am Schalter anstehen.',
      'Lā, yumkinuka al-intiẓāru fī aṭ-ṭābūri ʿinda ash-shubbāk.')
  ],
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
  'shopping': [
    response(1, 'Siz uchun ombordan tekshirib ko‘ray.', 'Let me check in the back for you.',
      'Сейчас проверю для вас на складе.', 'دعني أتحقّق لك في المخزن.',
      'Sizin için depoya bakayım.', 'Ich schaue gern für Sie im Lager nach.',
      'Daʿnī ataḥaqqaqu laka fī al-makhzan.')
  ],
  'hotel': [
    response(2, 'Ha, soat yettidan o‘ngacha beriladi.', 'Yes, it is served from seven to ten.',
      'Да, его подают с семи до десяти.', 'نعم، يُقدَّم من السابعة إلى العاشرة.',
      'Evet, saat yediden ona kadar servis ediliyor.', 'Ja, es wird von sieben bis zehn serviert.',
      'Naʿam, yuqaddamu mina as-sābiʿati ilā al-ʿāshira.')
  ],
  'travel-options': [[1, 6]],
  'travel': [
    response(1, 'Afsus. Keyingi poyezd soat to‘qqizda.',
      'I’m sorry. The next train is at nine.', 'Сожалею. Следующий поезд в девять.',
      'عذرًا، القطار التالي الساعة التاسعة.', 'Üzgünüm. Sonraki tren saat dokuzda.',
      'Das tut mir leid. Der nächste Zug fährt um neun.',
      'ʿUdhran, al-qiṭār at-tālī as-sāʿa at-tāsiʿa.')
  ],
  'post-office': [
    response(2, 'O‘n yevro turadi.', 'It costs ten euros.', 'Это стоит десять евро.',
      'يكلّف عشرة يوروهات.', 'On avro tutuyor.', 'Das kostet zehn Euro.',
      'Yukallifu ʿasharata yūrūhāt.')
  ],
  'airport-help': [
    response(5, 'Bo‘sh o‘rinlari bor keyingi reys ertaga ertalab uchadi.',
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
  'story': [
    response(1, 'Voy, oxiri qanday yetib oldingiz?', 'Oh no, how did you get there in the end?',
      'Ой, как вы в итоге добрались?', 'يا للأسف! كيف وصلت في النهاية؟',
      'Eyvah, sonunda oraya nasıl ulaştınız?', 'Oh nein, wie sind Sie am Ende hingekommen?',
      'Yā li-l-asaf! Kayfa waṣalta fī an-nihāya?')
  ],
  'opinions': [[1, 2]],
  'compare': [
    response(4, 'Vaqtim ko‘proq bo‘lsa, arzonroq bo‘lgani uchun avtobusni tanlardim.',
      'If I had more time, I’d take the bus because it’s cheaper.',
      'Если есть больше времени, лучше поехать на автобусе, потому что он дешевле.',
      'لو كان لديّ وقت أطول، لاخترت الحافلة لأنّها أرخص.',
      'Daha fazla vaktim olsa daha ucuz olduğu için otobüsü seçerdim.',
      'Wenn ich mehr Zeit hätte, würde ich den Bus nehmen, weil er günstiger ist.',
      'Law kāna ladayya waqtun aṭwal, la-khtartu al-ḥāfilata li-annahā arkhaṣ.', [2, 3, 5])
  ],
  'news-reports': [[2, 4, [1, 5, 'memories-4']]],
  'memories': [
    response(3, 'Eng katta o‘zgarish nima?', 'What has changed the most?',
      'Что изменилось больше всего?', 'ما أكثر شيء تغيّر؟',
      'En çok ne değişti?', 'Was hat sich am meisten verändert?',
      'Mā aktharu shayʾin taghayyara?')
  ],
  'community-garden': [
    response(4, 'To‘g‘ri. Ertaga yana tekshiramiz.', 'You’re right. Let’s check again tomorrow.',
      'Верно. Давайте проверим ещё раз завтра.', 'هذا صحيح. لنتحقّق مجددًا غدًا.',
      'Haklısınız. Yarın tekrar kontrol edelim.',
      'Stimmt. Prüfen wir es morgen noch einmal.',
      'Hādhā ṣaḥīḥ. Li-nataḥaqqaq mujaddadan ghadan.')
  ],
  'describing-change': [
    response(3, 'Bu yaxshi-ku.', 'That sounds nice.', 'Звучит приятно.',
      'يبدو هذا جميلًا.', 'Kulağa hoş geliyor.', 'Das klingt schön.',
      'Yabdū hādhā jamīlan.')
  ],
  'describing-people': [
    response(5, 'Ha, lekin yaqindan tanishsangiz, ochilib ketadi.',
      'Yes, but he opens up once you get to know him.',
      'Да, но когда вы узнаете его получше, он раскрывается.',
      'نعم، لكنّه ينفتح عندما تتعرّف إليه.',
      'Evet, ama onu tanıdıkça açılıyor.',
      'Ja, aber er taut auf, sobald Sie ihn besser kennen.',
      'Naʿam, lākinnahu yanfatiḥu ʿindamā tataʿarrafu ilayh.', [1, 3, 6])
  ],
  'problems': [
    response(2, 'Kechirasiz, broningizni tekshiraman.',
      'I’m sorry, I’ll check your reservation.',
      'Извините, я проверю ваше бронирование.',
      'عذرًا، سأتحقّق من حجزك.', 'Üzgünüm, rezervasyonunuzu kontrol edeceğim.',
      'Entschuldigung, ich prüfe Ihre Reservierung.',
      'ʿUdhran, sa-ataḥaqqaq min ḥajzika.')
  ],
  'reflection': [
    response(2, 'Har kuni oz-ozdan mashq qilish bunga chindan ham yordam beradi.',
      'Practicing a little every day really helps with that.',
      'Ежедневная небольшая практика действительно помогает в этом.',
      'التدرّب قليلًا كلّ يوم يساعد فعلًا في ذلك.',
      'Her gün biraz pratik yapmak buna gerçekten yardımcı olur.',
      'Jeden Tag ein wenig zu üben hilft dabei wirklich.',
      'At-tadarrubu qalīlan kulla yawmin yusāʿidu fiʿlan fī dhālik.', [1, 3, 6])
  ],
  'instructions': [
    response(6, 'Albatta, buni sizga bosqichma-bosqich ko‘rsatib beraman.',
      'Sure, I’ll walk you through it step by step.',
      'Конечно, я покажу вам всё шаг за шагом.',
      'بالتأكيد، سأشرح لك ذلك خطوةً بخطوة.',
      'Tabii, size adım adım göstereyim.',
      'Gern, ich gehe es Schritt für Schritt mit Ihnen durch.',
      'Bi-t-taʾkīd, sa-ashraḥu laka dhālika khuṭwatan bi-khuṭwa.', [1, 5, 'formal-requests-2'])
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
  'learning-strategies': [
    response(1, 'Har bir xatboshini o‘z so‘zlaringiz bilan ovoz chiqarib qisqacha aytib ko‘ring.',
      'Try summarizing each paragraph aloud in your own words.',
      'Попробуйте вслух пересказать каждый абзац своими словами.',
      'جرّب أن تلخّص كلّ فقرة بصوت عالٍ بكلماتك الخاصّة.',
      'Her paragrafı kendi sözlerinizle sesli olarak özetlemeyi deneyin.',
      'Versuchen Sie, jeden Absatz laut in eigenen Worten zusammenzufassen.',
      'Jarrib an tulakhkhiṣa kulla fiqratin bi-ṣawtin ʿālin bi-kalimātika al-khāṣṣa.',
      ['reflection-1', 'reflection-6', 'formal-requests-5'])
  ],
  'apologising': [
    response(1, 'Muammo yo‘q, xabar berganingiz uchun rahmat.',
      'No problem, thanks for letting me know.',
      'Ничего страшного, спасибо, что сообщили.',
      'لا بأس، شكرًا لإخباري.', 'Sorun değil, haber verdiğiniz için teşekkürler.',
      'Kein Problem, danke, dass Sie mir Bescheid gesagt haben.',
      'Lā baʾs, shukran li-ikhbārī.')
  ],
  'work': [
    response(1, 'Juma kunigacha topshirish kerak.', 'It’s due on Friday.',
      'Сдать нужно к пятнице.', 'الموعد النهائي يوم الجمعة.',
      'Son teslim tarihi cuma.', 'Die Frist endet am Freitag.',
      'Al-mawʿid an-nihāʾī yawm al-jumuʿa.')
  ],
  'messages': [[4, 6]],
  'decisions': [[2, 3], [3, 4]],
  'feedback': [
    response(3, 'Ha, bu tuzilmani ancha tushunarliroq qiladi.',
      'Yes, that will make the structure much clearer.',
      'Да, это сделает структуру намного яснее.',
      'نعم، سيجعل ذلك البنية أكثر وضوحًا بكثير.',
      'Evet, bu yapıyı çok daha anlaşılır kılacaktır.',
      'Ja, dadurch wird der Aufbau viel klarer.',
      'Naʿam, sa-yajʿalu dhālika al-binyata akthara wuḍūḥan bi-kathīr.', [2, 4, 'messages-3'])
  ],
  'meeting-summary': [[2, 3]],
  'evaluating-evidence': [[3, 4, [1, 2, 5]]],
  'negotiating-priorities': [[1, 2, [3, 5, 6]]],
  'short-update': [
    response(6, 'Albatta, xabaringizni kun tartibiga qo‘shib qo‘yaman.',
      'Sure, I’ll add your update to the agenda.',
      'Конечно, я внесу ваше сообщение в повестку дня.',
      'بالتأكيد، سأضيف تحديثك إلى جدول الأعمال.',
      'Tabii, güncellemenizi gündeme ekleyeceğim.',
      'Gern, ich nehme Ihr Update in die Tagesordnung auf.',
      'Bi-t-taʾkīd, sa-uḍīfu taḥdīthaka ilā jadwali al-aʿmāl.', [1, 2, 3, 4])
  ]
};

// Stable lesson source identities are kept. New reply IDs are separate from
// lesson phrases, so introducing authentic replies cannot change lesson scores,
// vocabulary unlocks or the catalog's 384 source phrases.
export function lessonExchanges(unit) {
  return (exchanges[unit?.id] ?? []).map(([cueIndex, reply, distractorIndices], index) => {
    const cue = unit.phrases[cueIndex - 1];
    const answer = Number.isInteger(reply) ? unit.phrases[reply - 1] : {
      ...reply,
      id: 'dialogue-' + unit.id + '-' + (index + 1),
      level: unit.level
    };
    if (!Number.isInteger(reply)) {
      const usage = arabicUsage(answer);
      if (usage && !answer.usage?.ar) answer.usage = { ...answer.usage, ar: usage };
    }
    if (!cue || !answer || cue === answer || cue.id === answer.id) {
      throw new RangeError('Invalid curated dialogue for ' + unit.id);
    }
    const candidates = distractorIndices?.map(item =>
      typeof item === 'string' ? phraseById.get(item) : unit.phrases[item - 1]
    ) ?? unit.phrases;
    const distractors = candidates.filter(entry => entry && entry !== cue && entry !== answer);
    if (distractorIndices && distractors.length < distractorIndices.length) {
      throw new RangeError('Invalid curated distractors for ' + unit.id);
    }
    return { cue, reply: answer, distractors };
  });
}
