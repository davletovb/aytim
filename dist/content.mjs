import { moreLessons } from './more-lessons.mjs';
import { extraLessons } from './extra-lessons.mjs';

export const languages = {
  uz: { name: 'O‘zbekcha', mark: 'O‘', locale: 'uz-UZ', tone: 'mint' },
  en: { name: 'English', mark: 'Aa', locale: 'en-US', tone: 'lilac' },
  ru: { name: 'Русский', mark: 'Я', locale: 'ru-RU', tone: 'sky' },
  ar: { name: 'العربية', mark: 'ع', locale: 'ar', tone: 'peach', direction: 'rtl' },
  tr: { name: 'Türkçe', mark: 'Ş', locale: 'tr-TR', tone: 'rose' },
  de: { name: 'Deutsch', mark: 'Ä', locale: 'de-DE', tone: 'sand' }
};

export const codes = Object.keys(languages);

export function localized(uz, en, ru, ar, tr, de) {
  return { uz, en, ru, ar, tr, de };
}

export function phrase(uz, en, ru, ar, tr, de, romanization) {
  return { text: localized(uz, en, ru, ar, tr, de), romanization };
}

export const units = [
  {
    id: 'greetings', level: 1, icon: 'spark', tone: 'mint',
    title: localized('Ilk iboralar', 'First words', 'Первые фразы', 'العبارات الأولى', 'İlk ifadeler', 'Erste Sätze'),
    description: localized(
      'Salomlashing, hol-ahvol so‘rang va xayrlashing.',
      'Say hello, ask how someone is, and say goodbye.',
      'Поздоровайтесь, спросите, как дела, и попрощайтесь.',
      'ألقِ التحية واسأل عن الحال وودّع من تتحدث إليه.',
      'Selam ver, hâl hatır sor ve vedalaş.',
      'Begrüße jemanden, frag nach dem Befinden und verabschiede dich.'
    ),
    phrases: [
      phrase('Salom!', 'Hello!', 'Привет!', 'مرحبًا!', 'Merhaba!', 'Hallo!', 'Marḥaban!'),
      phrase('Xayrli tong!', 'Good morning!', 'Доброе утро!', 'صباح الخير!', 'Günaydın!', 'Guten Morgen!', 'Ṣabāḥ al-khayr!'),
      phrase('Qalaysiz?', 'How are you?', 'Как у вас дела?', 'كيف حالك؟', 'Nasılsınız?', 'Wie geht es Ihnen?', 'Kayfa ḥāluka?'),
      phrase('Yaxshiman, rahmat.', 'I’m fine, thanks.', 'Хорошо, спасибо.', 'أنا بخير، شكرًا.', 'İyiyim, teşekkür ederim.', 'Gut, danke.', 'Anā bikhayr, shukran.'),
      phrase('Tanishganimdan xursandman.', 'Nice to meet you.', 'Приятно познакомиться.', 'تشرّفت بلقائك.', 'Tanıştığımıza memnun oldum.', 'Freut mich, Sie kennenzulernen.', 'Tasharraftu biliqāʾika.'),
      phrase('Ertagacha!', 'See you tomorrow!', 'До завтра!', 'أراك غدًا!', 'Yarın görüşürüz!', 'Bis morgen!', 'Arāka ghadan!')
    ]
  },
  {
    id: 'introductions', level: 1, icon: 'person', tone: 'lilac',
    title: localized('Tanishuv', 'Introductions', 'Знакомство', 'التعارف', 'Tanışma', 'Sich vorstellen'),
    description: localized(
      'Ismingizni ayting va o‘zingiz haqingizda gapiring.',
      'Share your name and a little about yourself.',
      'Назовите своё имя и немного расскажите о себе.',
      'اذكر اسمك وتحدّث قليلًا عن نفسك.',
      'Adını söyle ve kendinden kısaca bahset.',
      'Sag deinen Namen und erzähle ein bisschen von dir.'
    ),
    phrases: [
      phrase('Mening ismim Nuri.', 'My name is Nuri.', 'Меня зовут Нури.', 'اسمي نوري.', 'Benim adım Nuri.', 'Ich heiße Nuri.', 'Ismī Nūrī.'),
      phrase('Ismingiz nima?', 'What’s your name?', 'Как вас зовут?', 'ما اسمك؟', 'Adınız ne?', 'Wie heißen Sie?', 'Mā ismuka?'),
      phrase('Qayerdansiz?', 'Where are you from?', 'Откуда вы?', 'من أين أنت؟', 'Nerelisiniz?', 'Woher kommen Sie?', 'Min ayna anta?'),
      phrase('Men shu yerda yashayman.', 'I live here.', 'Я живу здесь.', 'أنا أسكن هنا.', 'Burada yaşıyorum.', 'Ich wohne hier.', 'Anā askunu hunā.'),
      phrase('Men talabaman.', 'I’m a student.', 'Я студент.', 'أنا طالب.', 'Öğrenciyim.', 'Ich bin Student.', 'Anā ṭālib.'),
      phrase('Men yangi til o‘rganyapman.', 'I’m learning a new language.', 'Я учу новый язык.', 'أنا أتعلّم لغة جديدة.', 'Yeni bir dil öğreniyorum.', 'Ich lerne eine neue Sprache.', 'Anā ataʿallamu lughatan jadīdatan.')
    ]
  },
  {
    id: 'cafe', level: 3, icon: 'cup', tone: 'peach',
    title: localized('Kafeda', 'At the café', 'В кафе', 'في المقهى', 'Kafede', 'Im Café'),
    description: localized(
      'Ichimlik buyurtma qiling va hisobni so‘rang.',
      'Order a drink and ask for the bill.',
      'Закажите напиток и попросите счёт.',
      'اطلب مشروبًا ثم اطلب الحساب.',
      'İçecek sipariş et ve hesabı iste.',
      'Bestelle ein Getränk und bitte um die Rechnung.'
    ),
    phrases: [
      phrase('Choy bersangiz, iltimos.', 'I’d like some tea.', 'Я хотел бы чай.', 'أودّ بعض الشاي.', 'Çay alabilir miyim?', 'Ich hätte gern einen Tee.', 'Awaddu baʿḍa ash-shāy.'),
      phrase('Iltimos, shakarsiz.', 'Without sugar, please.', 'Без сахара, пожалуйста.', 'بدون سكر، من فضلك.', 'Şekersiz, lütfen.', 'Ohne Zucker, bitte.', 'Bidūni sukkar, min faḍlika.'),
      phrase('Bu qancha turadi?', 'How much is this?', 'Сколько это стоит?', 'كم سعر هذا؟', 'Bu ne kadar?', 'Wie viel kostet das?', 'Kam siʿru hādhā?'),
      phrase('Menyuni ko‘rsam bo‘ladimi?', 'May I see the menu?', 'Можно посмотреть меню?', 'هل يمكنني الاطّلاع على قائمة الطعام؟', 'Menüye bakabilir miyim?', 'Darf ich die Speisekarte sehen?', 'Hal yumkinunī al-iṭṭilāʿu ʿalā qāʾimati aṭ-ṭaʿām?'),
      phrase('Hisobni bering, iltimos.', 'The bill, please.', 'Счёт, пожалуйста.', 'الحساب، من فضلك.', 'Hesabı alabilir miyim?', 'Die Rechnung, bitte.', 'Al-ḥisāb, min faḍlika.'),
      phrase('Karta bilan to‘layman.', 'I’ll pay by card.', 'Я заплачу картой.', 'سأدفع بالبطاقة.', 'Kartla ödeyeceğim.', 'Ich zahle mit Karte.', 'Sa-adfaʿu bil-biṭāqa.')
    ]
  },
  {
    id: 'directions', level: 4, icon: 'compass', tone: 'sky',
    title: localized('Yo‘l so‘rash', 'Getting around', 'Как добраться', 'السؤال عن الطريق', 'Yol tarifi', 'Unterwegs'),
    description: localized(
      'Yo‘l so‘rang va oddiy ko‘rsatmalarni tushuning.',
      'Ask for directions and follow simple instructions.',
      'Спросите дорогу и поймите простые указания.',
      'اسأل عن الطريق وافهم الإرشادات البسيطة.',
      'Yol sor ve basit tarifleri anla.',
      'Frag nach dem Weg und verstehe einfache Anweisungen.'
    ),
    phrases: [
      phrase('Vokzal qayerda?', 'Where’s the train station?', 'Где железнодорожный вокзал?', 'أين محطة القطار؟', 'Tren istasyonu nerede?', 'Wo ist der Bahnhof?', 'Ayna maḥaṭṭatu al-qiṭār?'),
      phrase('Chapga buriling.', 'Turn left.', 'Поверните налево.', 'انعطف يسارًا.', 'Sola dönün.', 'Biegen Sie links ab.', 'Inʿaṭif yasāran.'),
      phrase('To‘g‘riga yuring.', 'Go straight ahead.', 'Идите прямо.', 'تابع السير إلى الأمام.', 'Dümdüz gidin.', 'Gehen Sie geradeaus.', 'Tābiʿ as-sayra ilā al-amām.'),
      phrase('Uzoqmi?', 'Is it far?', 'Это далеко?', 'هل هو بعيد؟', 'Uzak mı?', 'Ist es weit?', 'Hal huwa baʿīd?'),
      phrase('Qaysi avtobus markazga boradi?', 'Which bus goes to the city centre?', 'Какой автобус идёт в центр?', 'أيّ حافلة تذهب إلى وسط المدينة؟', 'Hangi otobüs şehir merkezine gider?', 'Welcher Bus fährt ins Stadtzentrum?', 'Ayyu ḥāfilatin tadhhabu ilā wasaṭi al-madīna?'),
      phrase('Shu yerda to‘xtang, iltimos.', 'Stop here, please.', 'Остановитесь здесь, пожалуйста.', 'توقّف هنا، من فضلك.', 'Burada durun, lütfen.', 'Halten Sie bitte hier an.', 'Tawaqqaf hunā, min faḍlika.')
    ]
  },
  {
    id: 'plans', level: 4, icon: 'calendar', tone: 'rose',
    title: localized('Rejalar tuzish', 'Making plans', 'Строим планы', 'ترتيب المواعيد', 'Plan yapmak', 'Pläne machen'),
    description: localized(
      'Uchrashuv vaqtini kelishib oling.',
      'Find a time that works and arrange to meet.',
      'Выберите удобное время и договоритесь о встрече.',
      'اختر وقتًا مناسبًا واتّفق على موعد للقاء.',
      'Uygun bir saat bul ve buluşma ayarla.',
      'Finde eine passende Uhrzeit und verabrede dich.'
    ),
    phrases: [
      phrase('Ertaga vaqtingiz bormi?', 'Do you have time tomorrow?', 'У вас есть время завтра?', 'هل لديك وقت غدًا؟', 'Yarın vaktiniz var mı?', 'Haben Sie morgen Zeit?', 'Hal ladayka waqtun ghadan?'),
      phrase('Keling, soat oltida uchrashaylik.', 'Let’s meet at six.', 'Давайте встретимся в шесть.', 'لنلتقِ في الساعة السادسة.', 'Saat altıda buluşalım.', 'Treffen wir uns um sechs.', 'Linaltaqi fī as-sāʿati as-sādisa.'),
      phrase('Ishdan keyin bo‘shman.', 'I’m free after work.', 'После работы у меня есть время.', 'لديّ وقت بعد العمل.', 'İşten sonra müsaitim.', 'Nach der Arbeit habe ich Zeit.', 'Ladayya waqtun baʿda al-ʿamal.'),
      phrase('Siz ham kelasizmi?', 'Are you coming too?', 'Вы тоже придёте?', 'هل ستأتي أيضًا؟', 'Siz de gelecek misiniz?', 'Kommen Sie auch?', 'Hal sataʾtī ayḍan?'),
      phrase('Keyinroq sizga qo‘ng‘iroq qilaman.', 'I’ll call you later.', 'Я позвоню вам позже.', 'سأتّصل بك لاحقًا.', 'Sizi daha sonra arayacağım.', 'Ich rufe Sie später an.', 'Sa-attaṣilu bika lāḥiqan.'),
      phrase('Birga borishimiz mumkin.', 'We can go together.', 'Мы можем пойти вместе.', 'يمكننا الذهاب معًا.', 'Birlikte gidebiliriz.', 'Wir können zusammen hingehen.', 'Yumkinunā adh-dhahābu maʿan.')
    ]
  },
  {
    id: 'shopping', level: 5, icon: 'bag', tone: 'sand',
    title: localized('Do‘konda', 'At the shop', 'В магазине', 'في المتجر', 'Mağazada', 'Im Geschäft'),
    description: localized(
      'O‘lchamni so‘rang, kiyimni sinab ko‘ring va chek oling.',
      'Ask for a size, try something on, and get a receipt.',
      'Уточните размер, примерьте вещь и попросите чек.',
      'اسأل عن المقاس وجرّب الملابس واطلب الإيصال.',
      'Beden sor, bir şey dene ve fiş iste.',
      'Frag nach der Größe, probiere etwas an und bitte um den Kassenbon.'
    ),
    phrases: [
      phrase('Kichikroq o‘lchami bormi?', 'Do you have a smaller size?', 'У вас есть размер поменьше?', 'هل لديكم مقاس أصغر؟', 'Daha küçük bedeni var mı?', 'Haben Sie eine kleinere Größe?', 'Hal ladaykum maqāsun aṣghar?'),
      phrase('Menga chek kerak.', 'I need a receipt.', 'Мне нужен чек.', 'أحتاج إلى إيصال.', 'Fişe ihtiyacım var.', 'Ich brauche einen Kassenbon.', 'Aḥtāju ilā īṣāl.'),
      phrase('Buni qaytarib bersam bo‘ladimi?', 'Can I return this?', 'Можно это вернуть?', 'هل يمكنني إرجاع هذا؟', 'Bunu iade edebilir miyim?', 'Kann ich das zurückgeben?', 'Hal yumkinunī irjāʿu hādhā?'),
      phrase('Bu do‘kon bugun ochiqmi?', 'Is this shop open today?', 'Этот магазин сегодня открыт?', 'هل هذا المتجر مفتوح اليوم؟', 'Bu mağaza bugün açık mı?', 'Ist dieses Geschäft heute geöffnet?', 'Hal hādhā al-matjaru maftūḥun al-yawm?'),
      phrase('Buni kiyib ko‘rsam bo‘ladimi?', 'Can I try this on?', 'Можно это примерить?', 'هل يمكنني أن أجرّب هذا؟', 'Bunu deneyebilir miyim?', 'Darf ich das anprobieren?', 'Hal yumkinunī an ujarriba hādhā?'),
      phrase('Shunchaki ko‘rib yuribman, rahmat.', 'I’m just looking, thanks.', 'Я просто смотрю, спасибо.', 'ألقي نظرة فقط، شكرًا.', 'Sadece bakıyorum, teşekkürler.', 'Ich schaue mich nur um, danke.', 'Ulqī naẓratan faqaṭ, shukran.')
    ]
  },
  {
    id: 'story', level: 6, icon: 'book', tone: 'lilac',
    title: localized('Bir voqeani aytib berish', 'Telling a story', 'Рассказ о событиях', 'سرد قصة', 'Hikâye anlatmak', 'Eine Geschichte erzählen'),
    description: localized(
      'Voqealar ketma-ketligini ifodalang.',
      'Link past events and show what happened when.',
      'Свяжите события и покажите, что за чем произошло.',
      'اربط بين أحداث الماضي ووضّح ترتيبها.',
      'Geçmiş olayları sıraya koy ve birbirine bağla.',
      'Verbinde vergangene Ereignisse und beschreibe ihre Reihenfolge.'
    ),
    phrases: [
      phrase('Kecha avtobusga yetolmadim.', 'Yesterday I missed the bus.', 'Вчера я опоздал на автобус.', 'أمس فاتتني الحافلة.', 'Dün otobüsü kaçırdım.', 'Gestern habe ich den Bus verpasst.', 'Amsi fātatnī al-ḥāfila.'),
      phrase('Kutib turganimda yomg‘ir yog‘a boshladi.', 'While I was waiting, it started to rain.', 'Пока я ждал, начался дождь.', 'بينما كنت أنتظر، بدأ المطر يهطل.', 'Beklerken yağmur yağmaya başladı.', 'Während ich wartete, fing es an zu regnen.', 'Baynamā kuntu antaẓiru, badaʾa al-maṭaru yahṭilu.'),
      phrase('Oxiri taksida ketdim.', 'In the end, I took a taxi.', 'В конце концов я взял такси.', 'في النهاية، أخذت سيارة أجرة.', 'Sonunda taksiye bindim.', 'Schließlich nahm ich ein Taxi.', 'Fī an-nihāya, akhadhtu sayyārata ujra.'),
      phrase('Yetib kelganimda do‘kon yopilib bo‘lgan edi.', 'By the time I arrived, the shop had closed.', 'К моему приходу магазин уже закрылся.', 'عندما وصلت، كان المتجر قد أغلق.', 'Vardığımda mağaza çoktan kapanmıştı.', 'Als ich ankam, hatte das Geschäft schon geschlossen.', 'ʿIndamā waṣaltu, kāna al-matjaru qad aghlaqa.'),
      phrase('Avvaliga nima qilishni bilmadim.', 'At first, I didn’t know what to do.', 'Сначала я не знал, что делать.', 'في البداية، لم أكن أعرف ماذا أفعل.', 'Başta ne yapacağımı bilmiyordum.', 'Zuerst wusste ich nicht, was ich tun sollte.', 'Fī al-bidāya, lam akun aʿrifu mādhā afʿalu.'),
      phrase('Yaxshiyamki, kimdir menga yordam berdi.', 'Fortunately, someone helped me.', 'К счастью, мне кто-то помог.', 'لحسن الحظ، ساعدني أحدهم.', 'Neyse ki biri bana yardım etti.', 'Zum Glück hat mir jemand geholfen.', 'Liḥusni al-ḥaẓẓ, sāʿadanī aḥaduhum.')
    ]
  },
  {
    id: 'opinions', level: 6, icon: 'chat', tone: 'mint',
    title: localized('Fikr bildirish', 'Sharing an opinion', 'Обмен мнениями', 'التعبير عن الرأي', 'Fikir belirtmek', 'Eine Meinung äußern'),
    description: localized(
      'Fikringizni ayting, muloyim e’tiroz bildiring va misol so‘rang.',
      'Give your view, disagree politely, and ask for an example.',
      'Выскажите мнение, вежливо возразите и попросите пример.',
      'عبّر عن رأيك وخالف بلطف واطلب مثالًا.',
      'Görüşünü söyle, kibarca karşı çık ve örnek iste.',
      'Äußere deine Meinung, widersprich höflich und bitte um ein Beispiel.'
    ),
    phrases: [
      phrase('Menimcha, bu yaxshi fikr.', 'In my opinion, this is a good idea.', 'По-моему, это хорошая идея.', 'في رأيي، هذه فكرة جيدة.', 'Bence bu iyi bir fikir.', 'Meiner Meinung nach ist das eine gute Idee.', 'Fī raʾyī, hādhihi fikratun jayyida.'),
      phrase('Bu masalada fikringizga qo‘shilaman.', 'I agree with you on this.', 'В этом я с вами согласен.', 'أوافقك الرأي في هذا الأمر.', 'Bu konuda size katılıyorum.', 'Da stimme ich Ihnen zu.', 'Uwāfiquka ar-raʾya fī hādhā al-amr.'),
      phrase('Men bunga boshqacha qarayman.', 'I see it differently.', 'Я смотрю на это иначе.', 'أرى الأمر بطريقة مختلفة.', 'Ben olaya farklı bakıyorum.', 'Ich sehe das anders.', 'Arā al-amra biṭarīqatin mukhtalifa.'),
      phrase('Menimcha, bu vaziyatga bog‘liq.', 'I think it depends on the situation.', 'Думаю, это зависит от ситуации.', 'أظنّ أن ذلك يعتمد على الموقف.', 'Bence bu duruma bağlı.', 'Ich glaube, das hängt von der Situation ab.', 'Aẓunnu anna dhālika yaʿtamidu ʿalā al-mawqif.'),
      phrase('Gapingizda jon bor, lekin bir savolim bor.', 'That’s a fair point, but I have a question.', 'В этом есть смысл, но у меня есть вопрос.', 'هذه نقطة وجيهة، لكن لديّ سؤال.', 'Bu yerinde bir tespit ama bir sorum var.', 'Das ist ein guter Punkt, aber ich habe eine Frage.', 'Hādhihi nuqṭatun wajīha, lākin ladayya suʾāl.'),
      phrase('Bir misol keltira olasizmi?', 'Could you give me an example?', 'Не могли бы вы привести пример?', 'هل يمكنك أن تعطيني مثالًا؟', 'Bir örnek verebilir misiniz?', 'Könnten Sie mir ein Beispiel geben?', 'Hal yumkinuka an tuʿṭiyanī mithālan?')
    ]
  },
  {
    id: 'problems', level: 7, icon: 'key', tone: 'peach',
    title: localized('Muammoni hal qilish', 'Solving a problem', 'Решаем проблему', 'حلّ مشكلة', 'Sorun çözmek', 'Ein Problem lösen'),
    description: localized(
      'Muammoni tushuntiring va boshqa yechim so‘rang.',
      'Explain what went wrong and ask about alternatives.',
      'Объясните, что случилось, и спросите о других вариантах.',
      'اشرح المشكلة واسأل عن الخيارات الأخرى.',
      'Sorunu anlat ve başka seçenekler iste.',
      'Erkläre das Problem und frag nach Alternativen.'
    ),
    phrases: [
      phrase('Menimcha, xatolik bo‘lgan.', 'I think there’s been a mistake.', 'Кажется, произошла ошибка.', 'أظنّ أن هناك خطأ.', 'Sanırım bir hata olmuş.', 'Ich glaube, da ist ein Fehler passiert.', 'Aẓunnu anna hunāka khaṭaʾan.'),
      phrase('Ikkita karavotli xona so‘ragan edim.', 'I asked for a room with two beds.', 'Я просил номер с двумя кроватями.', 'طلبت غرفة فيها سريران.', 'İki yataklı bir oda istemiştim.', 'Ich hatte um ein Zimmer mit zwei Betten gebeten.', 'Ṭalabtu ghurfatan fīhā sarīrān.'),
      phrase('Band qilgan xonamni tekshirib bera olasizmi?', 'Could you check my reservation?', 'Не могли бы вы проверить мою бронь?', 'هل يمكنك التحقّق من حجزي؟', 'Rezervasyonumu kontrol edebilir misiniz?', 'Könnten Sie meine Reservierung prüfen?', 'Hal yumkinuka at-taḥaqququ min ḥajzī?'),
      phrase('Boshqa variant bormi?', 'Is there another option?', 'Есть другой вариант?', 'هل هناك خيار آخر؟', 'Başka bir seçenek var mı?', 'Gibt es eine andere Möglichkeit?', 'Hal hunāka khiyārun ākhar?'),
      phrase('Kerak bo‘lsa, kuta olaman.', 'I can wait if necessary.', 'Если нужно, я могу подождать.', 'يمكنني الانتظار إذا لزم الأمر.', 'Gerekirse bekleyebilirim.', 'Wenn nötig, kann ich warten.', 'Yumkinunī al-intiẓāru idhā lazima al-amr.'),
      phrase('Bilganingiz zahoti menga xabar bering.', 'Let me know as soon as you find out.', 'Дайте мне знать, как только выясните.', 'أخبرني حالما تعرف.', 'Öğrenir öğrenmez bana haber verin.', 'Geben Sie mir Bescheid, sobald Sie etwas erfahren.', 'Akhbirnī ḥālamā taʿrifu.')
    ]
  },
  {
    id: 'reflection', level: 7, icon: 'flag', tone: 'sky',
    title: localized('Keyingi qadam', 'The next step', 'Следующий шаг', 'الخطوة التالية', 'Sonraki adım', 'Der nächste Schritt'),
    description: localized(
      'Til o‘rganishdagi yutuqlaringiz va maqsadlaringiz haqida gapiring.',
      'Talk about your progress and what you want to do next.',
      'Расскажите о своих успехах и дальнейших целях.',
      'تحدّث عن تقدّمك وما تريد فعله بعد ذلك.',
      'İlerlemeni ve bundan sonra ne yapmak istediğini anlat.',
      'Sprich über deine Fortschritte und deine nächsten Ziele.'
    ),
    phrases: [
      phrase('Bu tilni bir yildan beri o‘rganyapman.', 'I’ve been learning this language for a year.', 'Я учу этот язык уже год.', 'أتعلّم هذه اللغة منذ سنة.', 'Bir yıldır bu dili öğreniyorum.', 'Ich lerne diese Sprache seit einem Jahr.', 'Ataʿallamu hādhihi al-lughata mundhu sana.'),
      phrase('Gapirganimda o‘zimga ko‘proq ishonishni istayman.', 'I’d like to feel more confident when I speak.', 'Я хотел бы говорить увереннее.', 'أودّ أن أشعر بثقة أكبر عندما أتكلّم.', 'Konuşurken kendime daha çok güvenmek istiyorum.', 'Ich würde mich beim Sprechen gern sicherer fühlen.', 'Awaddu an ashʿura bithiqatin akbara ʿindamā atakallamu.'),
      phrase('Gapira olganimdan ko‘ra ko‘proq tushunaman.', 'I understand more than I can say.', 'Я понимаю больше, чем могу сказать.', 'أفهم أكثر ممّا أستطيع قوله.', 'Söyleyebildiğimden daha fazlasını anlıyorum.', 'Ich verstehe mehr, als ich sagen kann.', 'Afhamu akthara mimmā astaṭīʿu qawlahu.'),
      phrase('Qancha ko‘p mashq qilsam, shuncha osonlashadi.', 'The more I practise, the easier it gets.', 'Чем больше я практикуюсь, тем легче становится.', 'كلّما تدرّبت أكثر، أصبح الأمر أسهل.', 'Ne kadar çok pratik yaparsam o kadar kolaylaşıyor.', 'Je mehr ich übe, desto leichter fällt es mir.', 'Kullamā tadarrabtu akthara, aṣbaḥa al-amru ashal.'),
      phrase('Avvallari xato qilishdan qo‘rqardim.', 'I used to be afraid of making mistakes.', 'Раньше я боялся ошибаться.', 'كنت أخشى ارتكاب الأخطاء.', 'Eskiden hata yapmaktan korkardım.', 'Früher hatte ich Angst, Fehler zu machen.', 'Kuntu akhshā irtikāba al-akhṭāʾ.'),
      phrase('Bir kuni bu tilni ishda ishlata olaman deb umid qilaman.', 'I hope I can use it at work someday.', 'Надеюсь, однажды я смогу использовать этот язык на работе.', 'آمل أن أتمكّن من استخدامها في العمل يومًا ما.', 'Umarım bir gün bu dili işte kullanabilirim.', 'Ich hoffe, dass ich die Sprache irgendwann bei der Arbeit einsetzen kann.', 'Āmalu an atamakkana min istikhdāmihā fī al-ʿamali yawman mā.')
    ]
  }
];

units.splice(5, 0,
  {
    id: 'family', level: 2, icon: 'person', tone: 'lilac',
    title: localized('Oila va do‘stlar', 'Family and friends', 'Семья и друзья', 'العائلة والأصدقاء', 'Aile ve arkadaşlar', 'Familie und Freunde'),
    description: localized('Yaqinlaringizni tanishtiring va ular haqida gapiring.', 'Introduce the people close to you and talk about them.', 'Представьте близких и расскажите о них.', 'عرّف بأفراد عائلتك وأصدقائك وتحدّث عنهم.', 'Yakınlarını tanıt ve onlardan bahset.', 'Stelle Menschen vor, die dir nahestehen, und erzähle von ihnen.'),
    phrases: [
      phrase('Bu mening akam.', 'This is my older brother.', 'Это мой старший брат.', 'هذا أخي الأكبر.', 'Bu benim ağabeyim.', 'Das ist mein älterer Bruder.', 'Hādhā akhī al-akbar.'),
      phrase('Singlim maktabda o‘qiydi.', 'My younger sister goes to school.', 'Моя младшая сестра ходит в школу.', 'أختي الصغرى تذهب إلى المدرسة.', 'Küçük kız kardeşim okula gidiyor.', 'Meine jüngere Schwester geht zur Schule.', 'Ukhtī aṣ-ṣughrā tadhhabu ilā al-madrasa.'),
      phrase('Do‘stim yaqin atrofda yashaydi.', 'My friend lives nearby.', 'Мой друг живёт неподалёку.', 'صديقي يسكن بالقرب من هنا.', 'Arkadaşım yakınlarda oturuyor.', 'Ein Freund von mir wohnt in der Nähe.', 'Ṣadīqī yaskunu bil-qurbi min hunā.'),
      phrase('Dam olish kunlari birga ovqatlanamiz.', 'We eat together on weekends.', 'По выходным мы едим вместе.', 'نتناول الطعام معًا في عطلة نهاية الأسبوع.', 'Hafta sonları birlikte yemek yeriz.', 'Am Wochenende essen wir zusammen.', 'Natanāwalu aṭ-ṭaʿāma maʿan fī ʿuṭlati nihāyati al-usbūʿ.'),
      phrase('Oilangiz qayerda yashaydi?', 'Where does your family live?', 'Где живёт ваша семья?', 'أين تسكن عائلتك؟', 'Aileniz nerede yaşıyor?', 'Wo wohnt Ihre Familie?', 'Ayna taskunu ʿāʾilatuka?'),
      phrase('Ota-onamni tez-tez ko‘rib turaman.', 'I often visit my parents.', 'Я часто навещаю родителей.', 'أزور والديّ كثيرًا.', 'Anne babamı sık sık ziyaret ederim.', 'Ich besuche meine Eltern oft.', 'Azūru wālidayya kathīran.')
    ]
  },
  {
    id: 'routine', level: 2, icon: 'clock', tone: 'sky',
    title: localized('Kundalik hayot', 'Daily routines', 'Распорядок дня', 'الروتين اليومي', 'Günlük hayat', 'Tagesablauf'),
    description: localized('Kuningiz qanday o‘tishini aytib bering.', 'Describe what you do during the day.', 'Расскажите, как проходит ваш день.', 'صِف ما تفعله خلال يومك.', 'Gününün nasıl geçtiğini anlat.', 'Beschreibe, wie dein Tag abläuft.'),
    phrases: [
      phrase('Odatda soat yettida turaman.', 'I usually get up at seven.', 'Я обычно встаю в семь.', 'عادةً أنهض في الساعة السابعة.', 'Genellikle saat yedide kalkarım.', 'Ich stehe meistens um sieben auf.', 'ʿĀdatan anhaḍu fī as-sāʿati as-sābiʿa.'),
      phrase('Uyda nonushta qilaman.', 'I have breakfast at home.', 'Я завтракаю дома.', 'أتناول الفطور في البيت.', 'Evde kahvaltı yaparım.', 'Ich frühstücke zu Hause.', 'Atanāwalu al-fuṭūra fī al-bayt.'),
      phrase('Ishga piyoda boraman.', 'I walk to work.', 'Я хожу на работу пешком.', 'أذهب إلى العمل مشيًا على الأقدام.', 'İşe yürüyerek giderim.', 'Ich gehe zu Fuß zur Arbeit.', 'Adhhabu ilā al-ʿamali mashyan ʿalā al-aqdām.'),
      phrase('Tushlik tanaffusim soat o‘n ikkida boshlanadi.', 'My lunch break starts at noon.', 'Мой обеденный перерыв начинается в полдень.', 'تبدأ استراحة الغداء عند الظهر.', 'Öğle aram saat on ikide başlıyor.', 'Meine Mittagspause beginnt um zwölf.', 'Tabdaʾu istirāḥatu al-ghadāʾi ʿinda aẓ-ẓuhr.'),
      phrase('Kechqurun kitob o‘qiyman.', 'I read a book in the evening.', 'Вечером я читаю книгу.', 'أقرأ كتابًا في المساء.', 'Akşamları kitap okurum.', 'Abends lese ich ein Buch.', 'Aqraʾu kitāban fī al-masāʾ.'),
      phrase('Bugun ertaroq uxlayman.', 'I’ll go to bed earlier today.', 'Сегодня я лягу спать пораньше.', 'سأذهب إلى الفراش مبكّرًا اليوم.', 'Bugün daha erken yatacağım.', 'Heute gehe ich früher ins Bett.', 'Sa-adhhabu ilā al-firāshi mubakkiran al-yawm.')
    ]
  },
  {
    id: 'market', level: 3, icon: 'bag', tone: 'mint',
    title: localized('Bozorda', 'At the market', 'На рынке', 'في السوق', 'Pazarda', 'Auf dem Markt'),
    description: localized('Meva va sabzavot so‘rang, miqdorini ayting.', 'Ask for produce and say how much you need.', 'Попросите фрукты или овощи и назовите количество.', 'اطلب الخضار أو الفاكهة وحدّد الكمية.', 'Sebze ve meyve iste, miktarını söyle.', 'Frage nach Obst und Gemüse und nenne die Menge.'),
    phrases: [
      phrase('Bir kilo olma bering, iltimos.', 'A kilo of apples, please.', 'Килограмм яблок, пожалуйста.', 'كيلوغرامًا من التفاح، من فضلك.', 'Bir kilo elma, lütfen.', 'Ein Kilo Äpfel, bitte.', 'Kīlūghrāman min at-tuffāḥ, min faḍlika.'),
      phrase('Bu pomidorlar yangimi?', 'Are these tomatoes fresh?', 'Эти помидоры свежие?', 'هل هذه الطماطم طازجة؟', 'Bu domatesler taze mi?', 'Sind diese Tomaten frisch?', 'Hal hādhihi aṭ-ṭamāṭimu ṭāzija?'),
      phrase('Ikkita non ham olaman.', 'I’ll also take two loaves of bread.', 'Я возьму ещё две буханки хлеба.', 'سآخذ رغيفين من الخبز أيضًا.', 'İki ekmek de alayım.', 'Ich nehme auch zwei Laibe Brot.', 'Sa-ākhudhu raghīfayni min al-khubzi ayḍan.'),
      phrase('Tatib ko‘rsam bo‘ladimi?', 'May I taste it?', 'Можно попробовать?', 'هل يمكنني تذوّقه؟', 'Tadına bakabilir miyim?', 'Darf ich probieren?', 'Hal yumkinunī tadhawwuquhu?'),
      phrase('Hammasi qancha bo‘ldi?', 'How much is it altogether?', 'Сколько с меня за всё?', 'كم المجموع؟', 'Hepsi ne kadar tuttu?', 'Wie viel macht das zusammen?', 'Kam al-majmūʿ?'),
      phrase('Paket kerak emas, rahmat.', 'I don’t need a bag, thanks.', 'Пакет не нужен, спасибо.', 'لا أحتاج إلى كيس، شكرًا.', 'Poşet istemiyorum, teşekkürler.', 'Ich brauche keine Tüte, danke.', 'Lā aḥtāju ilā kīs, shukran.')
    ]
  }
);

units.push(
  {
    id: 'travel', level: 5, icon: 'compass', tone: 'sky',
    title: localized('Safardagi o‘zgarishlar', 'Travel disruptions', 'Изменения в поездке', 'تغيّرات أثناء السفر', 'Yolculukta aksilikler', 'Änderungen auf Reisen'),
    description: localized('Kechikish haqida so‘rang va yangi yo‘l toping.', 'Ask about a delay and work out another route.', 'Спросите о задержке и найдите другой маршрут.', 'اسأل عن التأخير وابحث عن طريق بديل.', 'Gecikmeyi sor ve başka bir yol bul.', 'Frage nach einer Verspätung und finde eine andere Verbindung.'),
    phrases: [
      phrase('Poyezdim bekor qilindi.', 'My train was cancelled.', 'Мой поезд отменили.', 'أُلغي قطاري.', 'Trenim iptal edildi.', 'Mein Zug ist ausgefallen.', 'Ulghiya qiṭārī.'),
      phrase('Keyingi poyezd qachon jo‘naydi?', 'When does the next train leave?', 'Когда отправляется следующий поезд?', 'متى ينطلق القطار التالي؟', 'Bir sonraki tren ne zaman kalkıyor?', 'Wann fährt der nächste Zug ab?', 'Matā yanṭaliqu al-qiṭāru at-tālī?'),
      phrase('Boshqa shaharda poyezd almashtirishim kerakmi?', 'Do I have to change trains in another city?', 'Мне нужно пересесть на другой поезд в другом городе?', 'هل عليّ تبديل القطار في مدينة أخرى؟', 'Başka bir şehirde aktarma yapmam gerekiyor mu?', 'Muss ich in einer anderen Stadt umsteigen?', 'Hal ʿalayya tabdīlu al-qiṭāri fī madīnatin ukhrā?'),
      phrase('Bu chiptani almashtirsam bo‘ladimi?', 'Can I exchange this ticket?', 'Можно обменять этот билет?', 'هل يمكنني استبدال هذه التذكرة؟', 'Bu bileti değiştirebilir miyim?', 'Kann ich diese Fahrkarte umtauschen?', 'Hal yumkinunī istibdālu hādhihi at-tadhkira?'),
      phrase('Uchrashuvga biroz kechikaman.', 'I’ll be a little late for the meeting.', 'Я немного опоздаю на встречу.', 'سأتأخّر قليلًا عن الاجتماع.', 'Toplantıya biraz geç kalacağım.', 'Ich komme etwas später zum Treffen.', 'Sa-ataʾakhkharu qalīlan ʿan al-ijtimāʿ.'),
      phrase('Yetib borganimda sizga yozaman.', 'I’ll message you when I arrive.', 'Я напишу вам, когда приеду.', 'سأرسل لك رسالة عندما أصل.', 'Varınca size mesaj atarım.', 'Ich schreibe Ihnen, wenn ich angekommen bin.', 'Sa-ursilu laka risālatan ʿindamā aṣilu.')
    ]
  },
  {
    id: 'work', level: 8, icon: 'calendar', tone: 'sand',
    title: localized('Ishdagi suhbatlar', 'At work', 'На работе', 'في العمل', 'İş yerinde', 'Bei der Arbeit'),
    description: localized('Vazifalarni aniqlashtiring va muddatlarni kelishib oling.', 'Clarify tasks and agree on deadlines.', 'Уточните задачи и договоритесь о сроках.', 'وضّح المهام واتّفق على المواعيد النهائية.', 'Görevleri netleştir ve teslim tarihlerini kararlaştır.', 'Kläre Aufgaben und vereinbare Fristen.'),
    phrases: [
      phrase('Bu vazifani qachongacha tugatish kerak?', 'When is this task due?', 'К какому сроку нужно выполнить эту задачу?', 'ما الموعد النهائي لهذه المهمة؟', 'Bu görevin teslim tarihi ne zaman?', 'Bis wann muss diese Aufgabe fertig sein?', 'Mā al-mawʿidu an-nihāʾiyyu lihādhihi al-muhimma?'),
      phrase('Avval nimadan boshlashim kerak?', 'What should I start with?', 'С чего мне начать?', 'بماذا أبدأ؟', 'Nereden başlamalıyım?', 'Womit soll ich anfangen?', 'Bimādhā abdaʾu?'),
      phrase('Shu qismini yana bir bor tushuntirib bera olasizmi?', 'Could you explain this part again?', 'Не могли бы вы ещё раз объяснить эту часть?', 'هل يمكنك شرح هذا الجزء مرة أخرى؟', 'Bu kısmı bir daha açıklayabilir misiniz?', 'Könnten Sie diesen Teil noch einmal erklären?', 'Hal yumkinuka sharḥu hādhā al-juzʾi marratan ukhrā?'),
      phrase('Qoralamani juma kunigacha yuboraman.', 'I’ll send the draft by Friday.', 'Я отправлю черновик к пятнице.', 'سأرسل المسوّدة بحلول يوم الجمعة.', 'Taslağı cumaya kadar gönderirim.', 'Ich schicke den Entwurf bis Freitag.', 'Sa-ursilu al-musawwadata biḥulūli yawmi al-jumʿa.'),
      phrase('Uchrashuvni keyingi haftaga ko‘chirsak bo‘ladimi?', 'Could we move the meeting to next week?', 'Можно перенести встречу на следующую неделю?', 'هل يمكننا تأجيل الاجتماع إلى الأسبوع المقبل؟', 'Toplantıyı gelecek haftaya erteleyebilir miyiz?', 'Können wir das Treffen auf nächste Woche verschieben?', 'Hal yumkinunā taʾjīlu al-ijtimāʿi ilā al-usbūʿi al-muqbil?'),
      phrase('Biror o‘zgarish bo‘lsa, menga ayting.', 'Let me know if anything changes.', 'Сообщите мне, если что-нибудь изменится.', 'أخبرني إذا تغيّر شيء.', 'Bir değişiklik olursa bana haber verin.', 'Sagen Sie mir Bescheid, falls sich etwas ändert.', 'Akhbirnī idhā taghayyara shayʾun.')
    ]
  },
  {
    id: 'messages', level: 8, icon: 'chat', tone: 'rose',
    title: localized('Xabar yozish', 'Writing messages', 'Переписка', 'كتابة الرسائل', 'Mesajlaşma', 'Nachrichten schreiben'),
    description: localized('Xabarga javob bering, fayl yuboring va kelishuvni tasdiqlang.', 'Reply to a message, share a file, and confirm plans.', 'Ответьте на сообщение, отправьте файл и подтвердите планы.', 'ردّ على رسالة وأرسل ملفًا وأكّد الموعد.', 'Mesaja yanıt ver, dosya gönder ve planı onayla.', 'Antworte auf eine Nachricht, sende eine Datei und bestätige eine Verabredung.'),
    phrases: [
      phrase('Kech javob berganim uchun uzr.', 'Sorry for replying so late.', 'Извините, что так поздно отвечаю.', 'آسف على التأخّر في الردّ.', 'Geç cevap verdiğim için kusura bakmayın.', 'Entschuldigen Sie die späte Antwort.', 'Āsifun ʿalā at-taʾakhkhuri fī ar-radd.'),
      phrase('Havolani qayta yubora olasizmi?', 'Could you send the link again?', 'Не могли бы вы отправить ссылку ещё раз?', 'هل يمكنك إرسال الرابط مرة أخرى؟', 'Bağlantıyı tekrar gönderebilir misiniz?', 'Könnten Sie den Link noch einmal schicken?', 'Hal yumkinuka irsālu ar-rābiṭi marratan ukhrā?'),
      phrase('Men yuborgan faylni ocha oldingizmi?', 'Were you able to open the file I sent?', 'Вам удалось открыть файл, который я отправил?', 'هل تمكّنت من فتح الملفّ الذي أرسلته؟', 'Gönderdiğim dosyayı açabildiniz mi?', 'Konnten Sie die Datei öffnen, die ich geschickt habe?', 'Hal tamakkanta min fatḥi al-milaffi alladhī arsaltuhu?'),
      phrase('Hozir gaplasha olmayman, keyinroq yozaman.', 'I can’t talk right now. I’ll message you later.', 'Сейчас не могу говорить, напишу позже.', 'لا أستطيع التحدّث الآن، سأرسل لك رسالة لاحقًا.', 'Şu an konuşamıyorum, sonra yazarım.', 'Ich kann gerade nicht sprechen. Ich schreibe Ihnen später.', 'Lā astaṭīʿu at-taḥaddutha al-ān, sa-ursilu laka risālatan lāḥiqan.'),
      phrase('Vaqtni yana bir bor tasdiqlab qo‘yaylik.', 'Let’s confirm the time again.', 'Давайте ещё раз подтвердим время.', 'لنتأكّد من الموعد مرة أخرى.', 'Saati bir kez daha teyit edelim.', 'Lassen Sie uns die Uhrzeit noch einmal bestätigen.', 'Linataʾakkad min al-mawʿidi marratan ukhrā.'),
      phrase('Xabar berganingiz uchun rahmat.', 'Thanks for letting me know.', 'Спасибо, что сообщили.', 'شكرًا لإخباري.', 'Haber verdiğiniz için teşekkür ederim.', 'Danke, dass Sie mir Bescheid gesagt haben.', 'Shukran li-ikhbārī.')
    ]
  }
);

units.push(
  {
    id: 'numbers', level: 1, icon: 'person', tone: 'mint',
    title: localized('Sonlar va telefon raqamlari', 'Numbers and phone details', 'Числа и номера телефонов', 'الأعداد وأرقام الهواتف', 'Sayılar ve telefon numaraları', 'Zahlen und Telefonnummern'),
    description: localized('Sanang, yoshingizni ayting va telefon raqamini so‘rang.', 'Count, say your age, and ask for a phone number.', 'Научитесь считать, называть свой возраст и спрашивать номер телефона.', 'تدرّب على العدّ وذكر عمرك والسؤال عن رقم الهاتف.', 'Sayı say, yaşını söyle ve telefon numarası sor.', 'Zähle, sage dein Alter und frage nach einer Telefonnummer.'),
    phrases: [
      phrase('Bir, ikki, uch.', 'One, two, three.', 'Один, два, три.', 'واحد، اثنان، ثلاثة.', 'Bir, iki, üç.', 'Eins, zwei, drei.', 'Wāḥid, ithnān, thalātha.'),
      phrase('Bu yerda o‘n kishi bor.', 'There are ten people here.', 'Здесь десять человек.', 'هنا عشرة أشخاص.', 'Burada on kişi var.', 'Hier sind zehn Leute.', 'Hunā ʿasharatu ashkhāṣ.'),
      phrase('Yoshim yigirmada.', 'I’m twenty years old.', 'Мне двадцать лет.', 'عمري عشرون سنة.', 'Yirmi yaşındayım.', 'Ich bin zwanzig Jahre alt.', 'ʿUmrī ʿishrūna sana.'),
      phrase('Telefon raqamingiz qanday?', 'What’s your phone number?', 'Какой у вас номер телефона?', 'ما رقم هاتفك؟', 'Telefon numaranız nedir?', 'Wie lautet Ihre Telefonnummer?', 'Mā raqmu hātifika?'),
      phrase('Raqamni yana bir bor ayta olasizmi?', 'Could you repeat the number?', 'Не могли бы вы повторить номер?', 'هل يمكنك تكرار الرقم؟', 'Numarayı tekrar söyler misiniz?', 'Könnten Sie die Nummer wiederholen?', 'Hal yumkinuka takrāru ar-raqam?'),
      phrase('Iltimos, uni yozib qo‘ying.', 'Please write it down.', 'Запишите его, пожалуйста.', 'اكتبه من فضلك.', 'Lütfen not edin.', 'Schreiben Sie sie bitte auf.', 'Uktubhu min faḍlika.')
    ]
  },
  {
    id: 'apartment', level: 2, icon: 'key', tone: 'peach',
    title: localized('Uy ichida', 'Around the home', 'Дома', 'في البيت', 'Evde', 'Zu Hause'),
    description: localized('Xonalarni tasvirlang va narsalarning qayerdaligini ayting.', 'Describe rooms and say where things are.', 'Опишите комнаты и скажите, где находятся вещи.', 'صِف الغرف واذكر أماكن الأشياء.', 'Odaları tarif et ve eşyaların nerede olduğunu söyle.', 'Beschreibe Räume und sage, wo Dinge sind.'),
    phrases: [
      phrase('Men kichik xonadonda yashayman.', 'I live in a small flat.', 'Я живу в небольшой квартире.', 'أسكن في شقّة صغيرة.', 'Küçük bir dairede oturuyorum.', 'Ich wohne in einer kleinen Wohnung.', 'Askunu fī shaqqatin ṣaghīra.'),
      phrase('Oshxona zalning yonida.', 'The kitchen is next to the living room.', 'Кухня рядом с гостиной.', 'المطبخ بجانب غرفة الجلوس.', 'Mutfak oturma odasının yanında.', 'Die Küche ist neben dem Wohnzimmer.', 'Al-maṭbakhu bijānibi ghurfati al-julūs.'),
      phrase('Kalitlarim stol ustida.', 'My keys are on the table.', 'Мои ключи на столе.', 'مفاتيحي على الطاولة.', 'Anahtarlarım masanın üstünde.', 'Meine Schlüssel liegen auf dem Tisch.', 'Mafātīḥī ʿalā aṭ-ṭāwila.'),
      phrase('Deraza yonida ikkita stul bor.', 'There are two chairs by the window.', 'У окна стоят два стула.', 'هناك كرسيّان بجانب النافذة.', 'Pencerenin yanında iki sandalye var.', 'Am Fenster stehen zwei Stühle.', 'Hunāka kursiyyāni bijānibi an-nāfidha.'),
      phrase('Hammom yuqori qavatda.', 'The bathroom is upstairs.', 'Ванная на верхнем этаже.', 'الحمّام في الطابق العلويّ.', 'Banyo üst katta.', 'Das Badezimmer ist oben.', 'Al-ḥammāmu fī aṭ-ṭābiqi al-ʿulwī.'),
      phrase('Eshikni yopib qo‘ya olasizmi?', 'Could you close the door?', 'Не могли бы вы закрыть дверь?', 'هل يمكنك إغلاق الباب؟', 'Kapıyı kapatır mısınız?', 'Könnten Sie die Tür schließen?', 'Hal yumkinuka ighlāqu al-bāb?')
    ]
  },
  {
    id: 'meal', level: 3, icon: 'cup', tone: 'sand',
    title: localized('Taom buyurtma qilish', 'Ordering a meal', 'Заказ в ресторане', 'طلب وجبة', 'Yemek siparişi', 'Ein Essen bestellen'),
    description: localized('Menyudan tanlang, masalliqni so‘rang va buyurtmani aniqlashtiring.', 'Choose from a menu, ask about ingredients, and clarify your order.', 'Выберите блюдо, спросите о составе и уточните заказ.', 'اختر من القائمة واسأل عن المكوّنات ووضّح طلبك.', 'Menüden seç, malzemeleri sor ve siparişini netleştir.', 'Wähle aus der Speisekarte, frage nach Zutaten und präzisiere deine Bestellung.'),
    phrases: [
      phrase('Qaysi taomni tavsiya qilasiz?', 'Which dish do you recommend?', 'Какое блюдо вы посоветуете?', 'بأيّ طبق تنصح؟', 'Hangi yemeği önerirsiniz?', 'Welches Gericht empfehlen Sie?', 'Bi-ayyi ṭabaqin tanṣaḥ?'),
      phrase('Menga sabzavotli sho‘rva bering.', 'I’ll have the vegetable soup.', 'Мне овощной суп, пожалуйста.', 'أريد حساء الخضار، من فضلك.', 'Sebze çorbası alayım.', 'Ich nehme die Gemüsesuppe.', 'Urīdu ḥasāʾa al-khuḍār, min faḍlika.'),
      phrase('Bu taomda yong‘oq bormi?', 'Does this dish contain nuts?', 'В этом блюде есть орехи?', 'هل يحتوي هذا الطبق على مكسّرات؟', 'Bu yemekte kuruyemiş var mı?', 'Sind in diesem Gericht Nüsse?', 'Hal yaḥtawī hādhā aṭ-ṭabaqu ʿalā mukassarāt?'),
      phrase('Shu taom bilan guruch ham olsam bo‘ladimi?', 'Could I have rice with that?', 'Можно к этому блюду рис?', 'هل يمكنني طلب الأرزّ مع هذا الطبق؟', 'Yanına pilav alabilir miyim?', 'Könnte ich Reis dazu bekommen?', 'Hal yumkinunī ṭalabu al-aruzzi maʿa hādhā aṭ-ṭabaq?'),
      phrase('Bizga ikkita qoshiq olib kela olasizmi?', 'Could you bring us two spoons?', 'Не могли бы вы принести нам две ложки?', 'هل يمكنك إحضار ملعقتين لنا؟', 'Bize iki kaşık getirir misiniz?', 'Könnten Sie uns zwei Löffel bringen?', 'Hal yumkinuka iḥḍāru milʿaqatayni lanā?'),
      phrase('Shirinliklarni keyin tanlaymiz.', 'We’ll choose our desserts later.', 'Десерты выберем позже.', 'سنختار الحلوى لاحقًا.', 'Tatlılarımızı daha sonra seçeriz.', 'Wir suchen uns die Nachspeisen später aus.', 'Sanakhtāru al-ḥalwā lāḥiqan.')
    ]
  },
  {
    id: 'appointment', level: 4, icon: 'calendar', tone: 'sky',
    title: localized('Uchrashuv vaqtini o‘zgartirish', 'Rescheduling an appointment', 'Перенос встречи', 'تغيير موعد', 'Randevu saatini değiştirme', 'Einen Termin verschieben'),
    description: localized('Uchrashuv vaqtini o‘zgartiring va hammaga qulay vaqtni toping.', 'Move an appointment and find a time that works.', 'Перенесите встречу и найдите удобное время.', 'غيّر موعدًا وابحث عن وقت مناسب.', 'Randevuyu değiştir ve uygun bir saat bul.', 'Verschiebe einen Termin und finde eine passende Uhrzeit.'),
    phrases: [
      phrase('Seshanba kuni soat uchda uchrashuvim bor.', 'I have an appointment on Tuesday at three.', 'У меня встреча во вторник в три.', 'لديّ موعد يوم الثلاثاء في الساعة الثالثة.', 'Salı günü saat üçte randevum var.', 'Ich habe am Dienstag um drei einen Termin.', 'Ladayya mawʿidun yawma ath-thulāthāʾi fī as-sāʿati ath-thālitha.'),
      phrase('Kutilmagan ish chiqib qoldi, kela olmayman.', 'Something came up, and I can’t make it.', 'Возникло срочное дело, и я не смогу прийти.', 'طرأ أمرٌ ولن أتمكّن من الحضور.', 'Bir işim çıktı, gelemeyeceğim.', 'Mir ist etwas dazwischengekommen. Ich kann nicht kommen.', 'Ṭaraʾa amrun walan atamakkana mina al-ḥuḍūr.'),
      phrase('Bir soat keyinroq uchrashsak bo‘ladimi?', 'Could we meet an hour later?', 'Можем встретиться на час позже?', 'هل يمكننا أن نلتقي بعد الموعد بساعة؟', 'Bir saat daha geç buluşabilir miyiz?', 'Könnten wir uns eine Stunde später treffen?', 'Hal yumkinunā an naltaqiya baʿda al-mawʿidi bisāʿa?'),
      phrase('Chorshanba kuni ertalab vaqtingiz bormi?', 'Are you free on Wednesday morning?', 'Вы свободны в среду утром?', 'هل لديك وقت صباح الأربعاء؟', 'Çarşamba sabahı müsait misiniz?', 'Haben Sie am Mittwochmorgen Zeit?', 'Hal ladayka waqtun ṣabāḥa al-arbiʿāʾ?'),
      phrase('Chorshanba kuni soat to‘qqiz menga to‘g‘ri keladi.', 'Wednesday at nine works for me.', 'Мне подходит среда в девять.', 'يناسبني يوم الأربعاء في الساعة التاسعة.', 'Çarşamba saat dokuz bana uyar.', 'Mittwoch um neun passt mir.', 'Yunāsibunī yawmu al-arbiʿāʾi fī as-sāʿati at-tāsiʿa.'),
      phrase('Boshqa vaqt topganingiz uchun rahmat.', 'Thanks for finding another time.', 'Спасибо, что нашли другое время.', 'شكرًا لاختيار وقت آخر.', 'Başka bir saat ayarladığınız için teşekkür ederim.', 'Danke, dass Sie einen anderen Termin gefunden haben.', 'Shukran li-ikhtiyāri waqtin ākhar.')
    ]
  },
  {
    id: 'hotel', level: 5, icon: 'key', tone: 'lilac',
    title: localized('Mehmonxonaga joylashish', 'Checking in at a hotel', 'Заселение в гостиницу', 'تسجيل الوصول إلى الفندق', 'Otele giriş', 'Im Hotel einchecken'),
    description: localized('Broningizni tasdiqlang va xona sharoitlarini aniqlashtiring.', 'Confirm your reservation and ask about the room and your stay.', 'Подтвердите бронь и уточните условия проживания.', 'أكّد حجزك واسأل عن الغرفة وتفاصيل الإقامة.', 'Rezervasyonunu doğrula, oda ve konaklama hakkında soru sor.', 'Bestätige deine Buchung und frage nach dem Zimmer und deinem Aufenthalt.'),
    phrases: [
      phrase('Ikki kechaga xona band qilganman.', 'I have a reservation for two nights.', 'У меня забронирован номер на две ночи.', 'لديّ حجز لليلتين.', 'İki gecelik rezervasyonum var.', 'Ich habe für zwei Nächte reserviert.', 'Ladayya ḥajzun lilaylatayn.'),
      phrase('Nonushta narxga kiradimi?', 'Is breakfast included in the price?', 'Завтрак входит в стоимость?', 'هل الفطور مشمول في السعر؟', 'Kahvaltı fiyata dahil mi?', 'Ist das Frühstück im Preis enthalten?', 'Hal al-fuṭūru mashmūlun fī as-siʿr?'),
      phrase('Xonani soat nechagacha bo‘shatish kerak?', 'What time do I need to check out?', 'До которого часа нужно освободить номер?', 'في أيّ ساعة يجب أن أغادر الغرفة؟', 'Odadan en geç saat kaçta çıkmam gerekiyor?', 'Bis wann muss ich auschecken?', 'Fī ayyi sāʿatin yajibu an ughādira al-ghurfa?'),
      phrase('Chamadonimni shu yerda qoldirsam bo‘ladimi?', 'Can I leave my suitcase here?', 'Можно оставить здесь чемодан?', 'هل يمكنني ترك حقيبة سفري هنا؟', 'Valizimi burada bırakabilir miyim?', 'Kann ich meinen Koffer hier lassen?', 'Hal yumkinunī tarku ḥaqībati safarī hunā?'),
      phrase('Men band qilgan xonaning balkoni bor.', 'The room I booked has a balcony.', 'В номере, который я забронировал, есть балкон.', 'في الغرفة التي حجزتها شرفة.', 'Ayırttığım odanın balkonu var.', 'Das Zimmer, das ich gebucht habe, hat einen Balkon.', 'Fī al-ghurfati allatī ḥajaztuhā shurfa.'),
      phrase('Tinchroq xona bo‘lsa, o‘shani olsam bo‘ladimi?', 'Could I have a quieter room if one is available?', 'Можно мне номер потише, если такой есть?', 'هل يمكنني الحصول على غرفة أهدأ إن توفّرت؟', 'Varsa daha sessiz bir oda alabilir miyim?', 'Könnte ich ein ruhigeres Zimmer bekommen, falls eines frei ist?', 'Hal yumkinunī al-ḥuṣūlu ʿalā ghurfatin ahdaʾa in tawaffarat?')
    ]
  },
  {
    id: 'compare', level: 6, icon: 'swap', tone: 'rose',
    title: localized('Variantlarni taqqoslash', 'Comparing options', 'Сравнение вариантов', 'مقارنة الخيارات', 'Seçenekleri karşılaştırma', 'Möglichkeiten vergleichen'),
    description: localized('Narx, vaqt va qulaylikni solishtirib, tanlovingizni tushuntiring.', 'Compare price, time, and convenience, then explain your choice.', 'Сравните цену, время и удобство, затем объясните свой выбор.', 'قارن بين السعر والوقت والراحة ثم اشرح اختيارك.', 'Fiyatı, zamanı ve rahatlığı karşılaştırıp seçimini açıkla.', 'Vergleiche Preis, Zeit und Komfort und begründe deine Wahl.'),
    phrases: [
      phrase('Avtobus arzonroq, lekin poyezd tezroq.', 'The bus is cheaper, but the train is faster.', 'Автобус дешевле, но поезд быстрее.', 'الحافلة أرخص، لكن القطار أسرع.', 'Otobüs daha ucuz ama tren daha hızlı.', 'Der Bus ist günstiger, aber der Zug ist schneller.', 'Al-ḥāfilatu arkhaṣ, lākinna al-qiṭāra asraʿ.'),
      phrase('Tirbandlikka qolmaslik uchun ertaroq yo‘lga chiqishni ma’qul ko‘raman.', 'I’d rather leave earlier to avoid traffic.', 'Я предпочёл бы выехать пораньше, чтобы избежать пробок.', 'أفضّل الانطلاق مبكّرًا لتجنّب الازدحام.', 'Trafiğe kalmamak için daha erken çıkmayı tercih ederim.', 'Ich würde lieber früher losfahren, um den Stau zu vermeiden.', 'Ufaḍḍilu al-inṭilāqa mubakkiran litajannubi al-izdiḥām.'),
      phrase('Men uchun ishonchlilik narxdan muhimroq.', 'For me, reliability matters more than price.', 'Для меня надёжность важнее цены.', 'الموثوقية أهمّ عندي من السعر.', 'Benim için güvenilirlik fiyattan daha önemli.', 'Für mich ist Zuverlässigkeit wichtiger als der Preis.', 'Al-mawthūqiyyatu ahammu ʿindī mina as-siʿr.'),
      phrase('Ko‘proq vaqtingiz bo‘lsa, qaysi variantni tanlardingiz?', 'Which option would you choose if you had more time?', 'Какой вариант вы бы выбрали, если бы у вас было больше времени?', 'أيّ خيار ستختار لو كان لديك وقت أطول؟', 'Daha çok vaktiniz olsa hangi seçeneği seçerdiniz?', 'Welche Möglichkeit würden Sie wählen, wenn Sie mehr Zeit hätten?', 'Ayya khiyārin satakhtāru law kāna ladayka waqtun aṭwal?'),
      phrase('Bitta taksida borsak, pulni tejaymiz.', 'We can save money by sharing a taxi.', 'Если поедем на одном такси, сэкономим деньги.', 'يمكننا توفير المال إذا استقللنا سيارة أجرة واحدة.', 'Aynı taksiye binersek tasarruf edebiliriz.', 'Wir können Geld sparen, wenn wir uns ein Taxi teilen.', 'Yumkinunā tawfīru al-māli idhā istaqlalnā sayyārata ujratin wāḥida.'),
      phrase('Ikkala yo‘l ham qulay, lekin men poyezdni tanlardim.', 'Both options are convenient, but I’d choose the train.', 'Оба варианта удобны, но я бы выбрал поезд.', 'الخياران مناسبان، لكنّني كنت سأختار القطار.', 'İki seçenek de uygun ama ben treni seçerdim.', 'Beide Möglichkeiten sind praktisch, aber ich würde den Zug nehmen.', 'Al-khiyārāni munāsibān, lākinnanī kuntu sa-akhtāru al-qiṭār.')
    ]
  },
  {
    id: 'instructions', level: 7, icon: 'book', tone: 'mint',
    title: localized('Bosqichma-bosqich tushuntirish', 'Giving step-by-step instructions', 'Пошаговые инструкции', 'شرح الخطوات', 'Adım adım talimat verme', 'Schritt für Schritt erklären'),
    description: localized('Qadamlarni tartib bilan ayting va shartlarni aniqlashtiring.', 'Put the steps in order and explain what to do in different situations.', 'Объясните порядок действий и условия для каждого шага.', 'رتّب الخطوات واشرح ما يجب فعله في الحالات المختلفة.', 'Adımları sırala ve farklı durumlarda ne yapılacağını açıkla.', 'Erkläre die Reihenfolge der Schritte und was in verschiedenen Situationen zu tun ist.'),
    phrases: [
      phrase('Eshik qulflangan bo‘lsa, narigi tomondagi kirish eshigidan foydalaning.', 'If the door is locked, use the entrance on the other side.', 'Если дверь заперта, воспользуйтесь входом с другой стороны.', 'إذا كان الباب مقفلًا، فاستخدم المدخل في الجهة الأخرى.', 'Kapı kilitliyse diğer taraftaki girişi kullanın.', 'Wenn die Tür abgeschlossen ist, benutzen Sie den Eingang auf der anderen Seite.', 'Idhā kāna al-bābu muqfalan, fa-stakhdim al-madkhala fī al-jihati al-ukhrā.'),
      phrase('Boshlashdan oldin barcha hujjatlar yoningizda ekanini tekshiring.', 'Before you start, make sure you have all the documents.', 'Прежде чем начать, убедитесь, что у вас есть все документы.', 'قبل أن تبدأ، تأكّد من أن جميع الوثائق معك.', 'Başlamadan önce bütün belgelerin yanınızda olduğundan emin olun.', 'Vergewissern Sie sich vor dem Start, dass Sie alle Unterlagen haben.', 'Qabla an tabdaʾa, taʾakkad min anna jamīʿa al-wathāʾiqi maʿaka.'),
      phrase('Anketani to‘ldirgach, uni shu manzilga yuboring.', 'Once you’ve filled out the form, send it to this address.', 'Заполнив анкету, отправьте её по этому адресу.', 'بعد ملء الاستمارة، أرسلها إلى هذا العنوان.', 'Formu doldurduktan sonra bu adrese gönderin.', 'Wenn Sie das Formular ausgefüllt haben, schicken Sie es an diese Adresse.', 'Baʿda malʾi al-istimāra, arsilhā ilā hādhā al-ʿunwān.'),
      phrase('Faqat birinchi ikki qatorni o‘zgartirish kerak.', 'You only need to change the first two lines.', 'Нужно изменить только первые две строки.', 'يكفي أن تغيّر السطرين الأوّلين.', 'Yalnızca ilk iki satırı değiştirmeniz gerekiyor.', 'Sie brauchen nur die ersten beiden Zeilen zu ändern.', 'Yakfī an tughayyira as-saṭrayni al-awwalayn.'),
      phrase('Muammoga duch kelsangiz, nima bo‘lganini ayting.', 'If you run into a problem, let me know what happened.', 'Если возникнет проблема, расскажите мне, что случилось.', 'إذا واجهت مشكلة، فأخبرني بما حدث.', 'Bir sorunla karşılaşırsanız ne olduğunu bana bildirin.', 'Wenn ein Problem auftaucht, sagen Sie mir, was passiert ist.', 'Idhā wājahta mushkilatan, fa-akhbirnī bimā ḥadath.'),
      phrase('Buni qanday qilganingizni ko‘rsata olasizmi?', 'Could you show me how you did it?', 'Не могли бы вы показать, как вы это сделали?', 'هل يمكنك أن تريني كيف فعلت ذلك؟', 'Bunu nasıl yaptığınızı gösterebilir misiniz?', 'Könnten Sie mir zeigen, wie Sie das gemacht haben?', 'Hal yumkinuka an turiyanī kayfa faʿalta dhālik?')
    ]
  },
  {
    id: 'decisions', level: 8, icon: 'chat', tone: 'lilac',
    title: localized('Bir qarorga kelish', 'Reaching a decision', 'Как прийти к решению', 'التوصّل إلى قرار', 'Ortak bir karara varma', 'Zu einer Entscheidung kommen'),
    description: localized('Xavotiringizni bildiring, sinov taklif qiling va vazifalarni bo‘lib oling.', 'Raise a concern, suggest a small trial, and agree who will do what.', 'Выскажите сомнения, предложите пробный запуск и распределите ответственность.', 'عبّر عن قلقك واقترح تجربة صغيرة واتّفق على توزيع المسؤوليات.', 'Bir kaygını dile getir, küçük bir deneme öner ve görev paylaşımında anlaş.', 'Äußere Bedenken, schlage einen kleinen Versuch vor und kläre die Zuständigkeiten.'),
    phrases: [
      phrase('Maqsadimiz bir, lekin unga erishish yo‘llarini turlicha ko‘ramiz.', 'We agree on the goal, but we have different ways of reaching it.', 'Мы согласны с целью, но по-разному видим, как её достичь.', 'نتّفق على الهدف، لكنّنا نختلف حول طريقة الوصول إليه.', 'Hedef konusunda hemfikiriz ama ona nasıl ulaşacağımız konusunda farklı düşünüyoruz.', 'Beim Ziel sind wir uns einig, aber wir sehen unterschiedliche Wege dorthin.', 'Nattafiqu ʿalā al-hadaf, lākinnanā nakhtalifu ḥawla ṭarīqati al-wuṣūli ilayh.'),
      phrase('Buni sinab ko‘rishga vaqt yetmasligidan xavotirdaman.', 'I’m concerned we won’t have enough time to test it.', 'Боюсь, у нас не хватит времени на проверку.', 'أخشى ألّا يكون لدينا وقت كافٍ لاختباره.', 'Bunu denemek için yeterli zamanımız olmayacağından endişeliyim.', 'Ich fürchte, dass wir nicht genug Zeit haben, es zu testen.', 'Akhshā allā yakūna ladaynā waqtun kāfin li-ikhtibārih.'),
      phrase('Kichikroq variantdan boshlab, ikki haftadan keyin uni ko‘rib chiqsak-chi?', 'What if we start with a smaller version and review it in two weeks?', 'Что, если начнём с более скромного варианта и вернёмся к нему через две недели?', 'ما رأيكم أن نبدأ بنسخة أصغر ونراجعها بعد أسبوعين؟', 'Daha küçük bir sürümle başlayıp iki hafta sonra değerlendirsek nasıl olur?', 'Wie wäre es, wenn wir kleiner anfangen und das Ergebnis in zwei Wochen besprechen?', 'Mā raʾyukum an nabdaʾa binuskhatin aṣghara wa-nurājiʿahā baʿda usbūʿayn?'),
      phrase('Har bir qadam uchun kim mas’ul ekanini kelishib olsak, taklifni qo‘llab-quvvatlayman.', 'I could support that if we agree on who is responsible for each step.', 'Я готов поддержать это, если мы договоримся, кто отвечает за каждый шаг.', 'يمكنني دعم ذلك إذا اتّفقنا على المسؤول عن كلّ خطوة.', 'Her adımdan kimin sorumlu olacağı konusunda anlaşırsak bu öneriyi destekleyebilirim.', 'Ich könnte das unterstützen, wenn wir klären, wer für jeden Schritt verantwortlich ist.', 'Yumkinunī daʿmu dhālika idhā ittafaqnā ʿalā al-masʾūli ʿan kulli khuṭwa.'),
      phrase('Qarorimizni yozib qo‘yaylik, shunda hammada bir xil ma’lumot bo‘ladi.', 'Let’s write down what we decided so everyone has the same information.', 'Давайте запишем наше решение, чтобы у всех была одна и та же информация.', 'لندوّن ما قرّرناه كي يحصل الجميع على المعلومات نفسها.', 'Herkeste aynı bilgi olsun diye aldığımız kararı yazalım.', 'Halten wir unseren Beschluss schriftlich fest, damit alle denselben Informationsstand haben.', 'Linudawwin mā qarrarnāhu kay yaḥṣula al-jamīʿu ʿalā al-maʿlūmāti nafsihā.'),
      phrase('Natijalar umidli bo‘lsa, kelasi oy buni kengaytirishimiz mumkin.', 'If the results are promising, we can expand it next month.', 'Если результаты будут обнадёживающими, мы сможем расширить это в следующем месяце.', 'إذا كانت النتائج واعدة، فيمكننا توسيعه الشهر المقبل.', 'Sonuçlar umut verici olursa gelecek ay kapsamını genişletebiliriz.', 'Wenn die Ergebnisse vielversprechend sind, können wir das Vorhaben nächsten Monat ausweiten.', 'Idhā kānat an-natāʾiju wāʿida, fayumkinunā tawsīʿuhu ash-shahra al-muqbil.')
    ]
  }
);

units.push(
  {
    id: 'classroom-phrases', level: 1, icon: 'chat', tone: 'mint',
    title: localized('Darsda kerak bo‘ladigan iboralar', 'Useful classroom phrases', 'Фразы для занятий', 'عبارات مفيدة في الصفّ', 'Derste işe yarayan ifadeler', 'Nützliche Sätze für den Unterricht'),
    description: localized('Savol bering, tushunmaganingizni ayting va sekinroq gapirishni so‘rang.', 'Ask a question, say when you don’t understand, and ask someone to speak more slowly.', 'Задайте вопрос, скажите, что не поняли, и попросите говорить медленнее.', 'اطرح سؤالًا وقل إنّك لم تفهم واطلب من المتحدّث أن يتكلّم ببطء أكثر.', 'Soru sor, anlamadığını söyle ve karşındaki kişiden daha yavaş konuşmasını iste.', 'Stelle eine Frage, sag, wenn du etwas nicht verstehst, und bitte darum, langsamer zu sprechen.'),
    phrases: [
      phrase('Savolim bor.', 'I have a question.', 'У меня есть вопрос.', 'لديّ سؤال.', 'Bir sorum var.', 'Ich habe eine Frage.', 'Ladayya suʾāl.'),
      phrase('Bu qanday yoziladi?', 'How do you spell that?', 'Как это пишется?', 'كيف يُكتب هذا؟', 'Bu nasıl yazılır?', 'Wie schreibt man das?', 'Kayfa yuktabu hādhā?'),
      phrase('Kirsam bo‘ladimi?', 'May I come in?', 'Можно войти?', 'هل يمكنني الدخول؟', 'İçeri girebilir miyim?', 'Darf ich reinkommen?', 'Hal yumkinunī ad-dukhūl?'),
      phrase('Tushunmayapman.', 'I don’t understand.', 'Я не понимаю.', 'لا أفهم.', 'Anlamıyorum.', 'Ich verstehe das nicht.', 'Lā afham.'),
      phrase('Iltimos, sekinroq gapira olasizmi?', 'Could you speak more slowly, please?', 'Не могли бы вы говорить помедленнее?', 'هل يمكنك التحدّث ببطء أكثر من فضلك؟', 'Biraz daha yavaş konuşabilir misiniz, lütfen?', 'Könnten Sie bitte langsamer sprechen?', 'Hal yumkinuka at-taḥadduthu bibuṭʾin akthar min faḍlika?'),
      phrase('Bu so‘z nimani anglatadi?', 'What does this word mean?', 'Что означает это слово?', 'ماذا تعني هذه الكلمة؟', 'Bu kelime ne anlama geliyor?', 'Was bedeutet dieses Wort?', 'Mādhā taʿnī hādhihi al-kalima?')
    ]
  },
  {
    id: 'free-time', level: 2, icon: 'person', tone: 'rose',
    title: localized('Bo‘sh vaqt va sevimli mashg‘ulotlar', 'Hobbies and free time', 'Увлечения и свободное время', 'الهوايات ووقت الفراغ', 'Hobiler ve boş zaman', 'Hobbys und Freizeit'),
    description: localized('Nimalarni yoqtirishingiz va dam olish kunlari nima qilishingiz haqida gapiring.', 'Talk about what you enjoy and how you spend your days off.', 'Расскажите, чем вы увлекаетесь и как проводите выходные.', 'تحدّث عمّا تستمتع به وكيف تقضي أيّام عطلتك.', 'Neleri sevdiğini ve izin günlerini nasıl geçirdiğini anlat.', 'Erzähle, was du gern machst und wie du deine freien Tage verbringst.'),
    phrases: [
      phrase('Musiqa tinglashni yaxshi ko‘raman.', 'I like listening to music.', 'Я люблю слушать музыку.', 'أحبّ الاستماع إلى الموسيقى.', 'Müzik dinlemeyi severim.', 'Ich höre gern Musik.', 'Uḥibbu al-istimāʿa ilā al-mūsīqā.'),
      phrase('Yakshanba kunlari sayrga chiqaman.', 'I go for a walk on Sundays.', 'По воскресеньям я хожу гулять.', 'أخرج للتنزّه أيّام الأحد.', 'Pazar günleri yürüyüşe çıkarım.', 'Sonntags gehe ich spazieren.', 'Akhruju litanazzuh ayyāma al-aḥad.'),
      phrase('Opam gitara chaladi.', 'My older sister plays the guitar.', 'Моя старшая сестра играет на гитаре.', 'أختي الكبرى تعزف على الغيتار.', 'Ablam gitar çalıyor.', 'Meine ältere Schwester spielt Gitarre.', 'Ukhtī al-kubrā taʿzifu ʿalā al-ghītār.'),
      phrase('Bo‘sh vaqtingizda nima qilasiz?', 'What do you do in your free time?', 'Чем вы занимаетесь в свободное время?', 'ماذا تفعل في وقت فراغك؟', 'Boş zamanınızda ne yaparsınız?', 'Was machen Sie in Ihrer Freizeit?', 'Mādhā tafʿalu fī waqti farāghika?'),
      phrase('Ba’zan birga film tomosha qilamiz.', 'Sometimes we watch films together.', 'Иногда мы вместе смотрим фильмы.', 'نشاهد الأفلام معًا أحيانًا.', 'Bazen birlikte film izleriz.', 'Manchmal schauen wir zusammen Filme.', 'Nushāhidu al-aflāma maʿan aḥyānan.'),
      phrase('Suzishni o‘rganyapman.', 'I’m learning to swim.', 'Я учусь плавать.', 'أتعلّم السباحة.', 'Yüzmeyi öğreniyorum.', 'Ich lerne gerade schwimmen.', 'Ataʿallamu as-sibāḥa.')
    ]
  },
  {
    id: 'cooking', level: 3, icon: 'cup', tone: 'peach',
    title: localized('Birga ovqat tayyorlash', 'Cooking together', 'Готовим вместе', 'الطبخ معًا', 'Birlikte yemek yapmak', 'Zusammen kochen'),
    description: localized('Masalliqlarni sanang va oshxonadagi yumushlarni bo‘lishib oling.', 'Count ingredients and share out the tasks in the kitchen.', 'Назовите количество продуктов и распределите дела на кухне.', 'عدّ المكوّنات ووزّع مهامّ الطبخ.', 'Malzemeleri say ve mutfaktaki işleri paylaş.', 'Zähle Zutaten ab und teile die Aufgaben in der Küche auf.'),
    phrases: [
      phrase('Bizga uchta pomidor kerak.', 'We need three tomatoes.', 'Нам нужны три помидора.', 'نحتاج إلى ثلاث حبّات من الطماطم.', 'Üç domatese ihtiyacımız var.', 'Wir brauchen drei Tomaten.', 'Naḥtāju ilā thalāthi ḥabbātin mina aṭ-ṭamāṭim.'),
      phrase('Sabzavotlarni yuvib bera olasizmi?', 'Could you wash the vegetables?', 'Не могли бы вы помыть овощи?', 'هل يمكنك غسل الخضار؟', 'Sebzeleri yıkar mısınız?', 'Könnten Sie das Gemüse waschen?', 'Hal yumkinuka ghaslu al-khuḍār?'),
      phrase('Nonni yupqa qilib kesing.', 'Cut the bread into thin slices.', 'Нарежьте хлеб тонкими ломтиками.', 'قطّع الخبز إلى شرائح رفيعة.', 'Ekmeği ince dilimler halinde kesin.', 'Schneiden Sie das Brot in dünne Scheiben.', 'Qaṭṭiʿ al-khubza ilā sharāʾiḥa rafīʿa.'),
      phrase('Ozgina tuz soling.', 'Add a little salt.', 'Добавьте немного соли.', 'أضف قليلًا من الملح.', 'Biraz tuz ekleyin.', 'Geben Sie etwas Salz dazu.', 'Aḍif qalīlan mina al-milḥ.'),
      phrase('Sho‘rva deyarli tayyor.', 'The soup is almost ready.', 'Суп почти готов.', 'الحساء جاهز تقريبًا.', 'Çorba neredeyse hazır.', 'Die Suppe ist fast fertig.', 'Al-ḥasāʾu jāhizun taqrīban.'),
      phrase('Likopchalarni stolga qo‘ying.', 'Put the plates on the table.', 'Поставьте тарелки на стол.', 'ضع الأطباق على الطاولة.', 'Tabakları masaya koyun.', 'Stellen Sie die Teller auf den Tisch.', 'Ḍaʿ al-aṭbāqa ʿalā aṭ-ṭāwila.')
    ]
  },
  {
    id: 'phone-call', level: 4, icon: 'chat', tone: 'sky',
    title: localized('Telefonda gaplashish', 'Making a phone call', 'Разговор по телефону', 'التحدّث على الهاتف', 'Telefon görüşmesi', 'Ein Telefongespräch führen'),
    description: localized('Kerakli odamni so‘rang, xabar qoldiring va qayta qo‘ng‘iroq qilishni so‘rang.', 'Ask to speak to someone, leave a message, and arrange a callback.', 'Попросите к телефону нужного человека, оставьте сообщение и договоритесь об обратном звонке.', 'اطلب التحدّث مع شخص واترك رسالة واطلب معاودة الاتصال.', 'Biriyle konuşmak istediğini söyle, mesaj bırak ve geri aramasını iste.', 'Bitte um ein Gespräch, hinterlasse eine Nachricht und vereinbare einen Rückruf.'),
    phrases: [
      phrase('Mira bilan gaplashsam bo‘ladimi?', 'May I speak to Mira?', 'Можно поговорить с Мирой?', 'هل يمكنني التحدّث مع ميرا؟', 'Mira ile görüşebilir miyim?', 'Könnte ich bitte mit Mira sprechen?', 'Hal yumkinunī at-taḥadduthu maʿa Mīrā?'),
      phrase('U hozir ish joyida emas.', 'She’s away from her desk right now.', 'Её сейчас нет на рабочем месте.', 'هي بعيدة عن مكتبها الآن.', 'Şu anda masasında değil.', 'Sie ist gerade nicht an ihrem Platz.', 'Hiya baʿīda ʿan maktabihā al-ān.'),
      phrase('Unga xabar qoldirsam bo‘ladimi?', 'Can I leave a message for her?', 'Можно оставить ей сообщение?', 'هل يمكنني أن أترك لها رسالة؟', 'Ona bir mesaj bırakabilir miyim?', 'Kann ich ihr eine Nachricht hinterlassen?', 'Hal yumkinunī an atruka lahā risāla?'),
      phrase('Soat beshdan keyin menga qayta qo‘ng‘iroq qila olasizmi?', 'Could you call me back after five?', 'Не могли бы вы перезвонить мне после пяти?', 'هل يمكنك معاودة الاتصال بي بعد الساعة الخامسة؟', 'Saat beşten sonra beni geri arayabilir misiniz?', 'Könnten Sie mich nach fünf zurückrufen?', 'Hal yumkinuka muʿāwadatu al-ittiṣāli bī baʿda as-sāʿati al-khāmisa?'),
      phrase('Endi sizni yaxshi eshityapman.', 'I can hear you clearly now.', 'Теперь я вас хорошо слышу.', 'أسمعك بوضوح الآن.', 'Şimdi sizi net duyabiliyorum.', 'Jetzt kann ich Sie gut hören.', 'Asmaʿuka biwuḍūḥ al-ān.'),
      phrase('Aloqa uzilib qolyapti.', 'The call keeps cutting out.', 'Связь постоянно прерывается.', 'ينقطع الاتّصال باستمرار.', 'Bağlantı sürekli kesiliyor.', 'Die Verbindung bricht ständig ab.', 'Yanqaṭiʿu al-ittiṣālu bistimrār.')
    ]
  },
  {
    id: 'post-office', level: 5, icon: 'bag', tone: 'sand',
    title: localized('Pochta orqali jo‘natish', 'Sending a parcel', 'Отправляем посылку', 'إرسال طرد', 'Paket gönderme', 'Ein Paket verschicken'),
    description: localized('Jo‘natish narxi va muddati haqida so‘rang, kuzatish raqamini oling.', 'Ask about postage and delivery times, and get a tracking number.', 'Узнайте стоимость и сроки отправки и получите номер отслеживания.', 'اسأل عن تكلفة الشحن ومدّة التوصيل واحصل على رقم التتبّع.', 'Gönderim ücretini ve teslim süresini sor, takip numarasını al.', 'Frage nach Versandkosten und Lieferzeit und lass dir die Sendungsnummer geben.'),
    phrases: [
      phrase('Bu jo‘natmani Germaniyaga yubormoqchiman.', 'I’d like to send this parcel to Germany.', 'Я хотел бы отправить эту посылку в Германию.', 'أودّ إرسال هذا الطرد إلى ألمانيا.', 'Bu paketi Almanya’ya göndermek istiyorum.', 'Ich möchte dieses Paket nach Deutschland schicken.', 'Awaddu irsāla hādhā aṭ-ṭardi ilā Almāniyā.'),
      phrase('Jo‘natmani kuzatish xizmati bilan yuborish qancha turadi?', 'How much does tracked shipping cost?', 'Сколько стоит отправка с отслеживанием?', 'كم يكلف الشحن مع خدمة التتبّع؟', 'Takipli gönderim ne kadar tutar?', 'Wie viel kostet der Versand mit Sendungsverfolgung?', 'Kam yukallifu ash-shaḥnu maʿa khidmati at-tatabbuʿ?'),
      phrase('Odatda bir hafta ichida yetib boradimi?', 'Does it usually arrive within a week?', 'Посылка обычно доходит в течение недели?', 'هل يصل الطرد عادةً في غضون أسبوع؟', 'Genellikle bir hafta içinde ulaşır mı?', 'Kommt das Paket normalerweise innerhalb einer Woche an?', 'Hal yaṣilu aṭ-ṭardu ʿādatan fī ghuḍūni usbūʿ?'),
      phrase('Jo‘natmani kuzatish raqamini bera olasizmi?', 'Could you give me the tracking number?', 'Не могли бы вы дать мне номер отслеживания?', 'هل يمكنك إعطائي رقم التتبّع؟', 'Takip numarasını verebilir misiniz?', 'Könnten Sie mir die Sendungsnummer geben?', 'Hal yumkinuka iʿṭāʾī raqma at-tatabbuʿ?'),
      phrase('Iltimos, jo‘natuvchining manzilini shu yerga yozing.', 'Please write the return address here.', 'Напишите здесь обратный адрес, пожалуйста.', 'اكتب عنوان المرسِل هنا من فضلك.', 'Lütfen gönderenin adresini buraya yazın.', 'Schreiben Sie bitte hier die Absenderadresse hin.', 'Uktub ʿunwāna al-mursili hunā min faḍlika.'),
      phrase('Pochta haqini karta bilan to‘lasam bo‘ladimi?', 'Can I pay for the postage by card?', 'Можно оплатить отправку картой?', 'هل يمكنني دفع رسوم البريد بالبطاقة؟', 'Gönderim ücretini kartla ödeyebilir miyim?', 'Kann ich das Porto mit Karte bezahlen?', 'Hal yumkinunī dafʿu rusūmi al-barīdi bil-biṭāqa?')
    ]
  },
  {
    id: 'describing-change', level: 6, icon: 'book', tone: 'rose',
    title: localized('O‘zgarishlar haqida gapirish', 'Describing a change', 'Рассказ о переменах', 'وصف التغيّرات', 'Bir değişimi anlatma', 'Eine Veränderung beschreiben'),
    description: localized('Avvalgi va hozirgi hayotingizni solishtiring, yangi joyga qanday ko‘nikkaningizni ayting.', 'Compare life before and after a move and describe how you settled in.', 'Сравните жизнь до и после переезда и расскажите, как привыкли к новому месту.', 'قارن حياتك قبل الانتقال وبعده وصِف كيف تأقلمت مع المكان الجديد.', 'Taşınmadan önceki ve sonraki hayatını karşılaştır, yeni yerine nasıl alıştığını anlat.', 'Vergleiche dein Leben vor und nach einem Umzug und erzähle, wie du dich eingelebt hast.'),
    phrases: [
      phrase('Bu yerga endi ko‘chib kelganimda hech kimni tanimasdim.', 'When I first moved here, I didn’t know anyone.', 'Когда я только переехал сюда, я никого не знал.', 'عندما انتقلت إلى هنا في البداية، لم أكن أعرف أحدًا.', 'Buraya ilk taşındığımda kimseyi tanımıyordum.', 'Als ich hierhergezogen bin, kannte ich niemanden.', 'ʿIndamā intaqaltu ilā hunā fī al-bidāya, lam akun aʿrifu aḥadan.'),
      phrase('Yangi kun tartibiga ko‘nikishimga bir necha hafta ketdi.', 'It took me a few weeks to get used to the new routine.', 'Мне понадобилось несколько недель, чтобы привыкнуть к новому распорядку.', 'استغرقني التعود على الروتين الجديد بضعة أسابيع.', 'Yeni düzenime alışmam birkaç hafta sürdü.', 'Es hat ein paar Wochen gedauert, bis ich mich an den neuen Alltag gewöhnt hatte.', 'Istaghraqanī at-taʿawwudu ʿalā ar-rūtīni al-jadīdi biḍʿata asābīʿ.'),
      phrase('Mahalla hozir avvalgidan tinchroq.', 'The neighbourhood is quieter than it used to be.', 'Сейчас в районе тише, чем раньше.', 'أصبح الحيّ أهدأ ممّا كان عليه.', 'Mahalle eskisine göre daha sakin.', 'Die Nachbarschaft ist ruhiger als früher.', 'Aṣbaḥa al-ḥayyu ahdaʾa mimmā kāna ʿalayh.'),
      phrase('O‘shandan beri ishga avtobusda boradigan bo‘ldim.', 'Since then, I’ve started taking the bus to work.', 'С тех пор я стал ездить на работу на автобусе.', 'منذ ذلك الحين، بدأت أذهب إلى العمل بالحافلة.', 'O zamandan beri işe otobüsle gitmeye başladım.', 'Seitdem fahre ich mit dem Bus zur Arbeit.', 'Mundhu dhālika al-ḥīni badaʾtu adhhabu ilā al-ʿamali bil-ḥāfila.'),
      phrase('Odamlarning samimiyligi meni eng ko‘p hayratda qoldirdi.', 'What surprised me most was how friendly people were.', 'Больше всего меня удивило, какими приветливыми оказались люди.', 'أكثر ما فاجأني هو مدى ودّ الناس.', 'Beni en çok insanların ne kadar sıcak davrandığı şaşırttı.', 'Am meisten hat mich überrascht, wie freundlich die Leute waren.', 'Aktharu mā fājaʾanī huwa madā wuddi an-nās.'),
      phrase('O‘sha kunlarni eslasam, ko‘chib kelganimdan xursandman.', 'Looking back, I’m glad I made the move.', 'Оглядываясь назад, я рад, что переехал.', 'حين أستعيد تلك الأيام، أشعر بالسعادة لأنني انتقلت.', 'Geriye dönüp bakınca taşındığıma seviniyorum.', 'Rückblickend bin ich froh, dass ich umgezogen bin.', 'Ḥīna astaʿīdu tilka al-ayyāma, ashʿuru bis-saʿādati li-annanī intaqaltu.')
    ]
  },
  {
    id: 'delivery-problem', level: 7, icon: 'key', tone: 'sky',
    title: localized('Jo‘natma bilan bog‘liq muammoni hal qilish', 'Resolving a delivery problem', 'Проблема с доставкой', 'حلّ مشكلة في التوصيل', 'Teslimat sorununu çözme', 'Ein Lieferproblem klären'),
    description: localized('Nima bo‘lganini tushuntiring, manzilni tekshirtiring va yechim so‘rang.', 'Explain what happened, ask for an address check, and request a solution.', 'Объясните, что произошло, попросите проверить адрес и предложить решение.', 'اشرح ما حدث واطلب التحقّق من العنوان وإيجاد حلّ.', 'Ne olduğunu anlat, adresi kontrol etmelerini ve bir çözüm bulmalarını iste.', 'Erkläre, was passiert ist, und bitte darum, die Adresse zu prüfen und eine Lösung zu finden.'),
    phrases: [
      phrase('Kuzatish sahifasida jo‘natma kecha yetkazilgani yozilgan.', 'The tracking page says the parcel was delivered yesterday.', 'На странице отслеживания указано, что посылку доставили вчера.', 'تشير صفحة التتبّع إلى أنّ الطرد سُلّم أمس.', 'Takip sayfasında paketin dün teslim edildiği yazıyor.', 'Laut Sendungsverfolgung wurde das Paket gestern zugestellt.', 'Tushīru ṣafḥatu at-tatabbuʿi ilā anna aṭ-ṭarda sullima ams.'),
      phrase('Qaysi manzilga yetkazilganini tekshira olasizmi?', 'Could you check which address it was delivered to?', 'Не могли бы вы проверить, по какому адресу его доставили?', 'هل يمكنك التحقّق من العنوان الذي سُلّم إليه؟', 'Hangi adrese teslim edildiğini kontrol edebilir misiniz?', 'Könnten Sie prüfen, an welche Adresse es zugestellt wurde?', 'Hal yumkinuka at-taḥaqququ mina al-ʿunwāni alladhī sullima ilayh?'),
      phrase('Qo‘shnilarimdan so‘radim, hech biri jo‘natmani olmagan.', 'I’ve already asked my neighbours, but none of them received it.', 'Я уже спросил соседей, но никто из них не получал посылку.', 'سألت جيراني بالفعل، لكن لم يستلمها أحد منهم.', 'Komşularıma sordum ama hiçbiri paketi teslim almamış.', 'Ich habe schon bei meinen Nachbarn nachgefragt, aber keiner hat das Paket angenommen.', 'Saʾaltu jīrānī bil-fiʿl, lākin lam yastalimhā aḥadun minhum.'),
      phrase('Jo‘natma topilmasa, o‘rniga boshqasini yubora olasizmi?', 'If you can’t locate the parcel, could you send a replacement?', 'Если посылку не удастся найти, не могли бы вы отправить замену?', 'إذا لم تتمكّن من العثور على الطرد، فهل يمكنك إرسال بديل؟', 'Paketi bulamazsanız yerine yenisini gönderebilir misiniz?', 'Falls Sie das Paket nicht finden, könnten Sie Ersatz schicken?', 'Idhā lam tatamakkan mina al-ʿuthūri ʿalā aṭ-ṭard, fahal yumkinuka irsālu badīl?'),
      phrase('Qayta yuborishdan oldin manzilni tasdiqlang, iltimos.', 'Please confirm the address before sending it again.', 'Подтвердите, пожалуйста, адрес перед повторной отправкой.', 'أكّد العنوان قبل إعادة الإرسال من فضلك.', 'Lütfen tekrar göndermeden önce adresi doğrulayın.', 'Bitte bestätigen Sie die Adresse vor dem erneuten Versand.', 'Akkid al-ʿunwāna qabla iʿādati al-irsāli min faḍlika.'),
      phrase('Qo‘shimcha ma’lumot kerak bo‘lsa, chek nusxasini yuboraman.', 'If you need more details, I can send a copy of the receipt.', 'Если нужны дополнительные сведения, я могу прислать копию чека.', 'إذا احتجت إلى مزيد من التفاصيل، يمكنني إرسال نسخة من الإيصال.', 'Daha fazla bilgi gerekirse fişin bir kopyasını gönderebilirim.', 'Falls Sie weitere Angaben brauchen, kann ich Ihnen eine Kopie der Quittung schicken.', 'Idhā iḥtajta ilā mazīdin mina at-tafāṣīl, yumkinunī irsālu nuskhatin mina al-īṣāl.')
    ]
  },
  {
    id: 'feedback', level: 8, icon: 'chat', tone: 'lilac',
    title: localized('Takomillashtirish uchun fikr bildirish', 'Giving constructive feedback', 'Конструктивная обратная связь', 'تقديم ملاحظات بنّاءة', 'Yapıcı geri bildirim verme', 'Konstruktiv Rückmeldung geben'),
    description: localized('Nima yaxshi chiqqanini ayting va aniq o‘zgarishlarni taklif qiling.', 'Say what works and suggest specific revisions.', 'Скажите, что удалось, и предложите конкретные правки.', 'اذكر ما نجح واقترح تعديلات محدّدة.', 'Neyin işe yaradığını söyle ve somut değişiklikler öner.', 'Sage, was gut funktioniert, und schlage konkrete Änderungen vor.'),
    phrases: [
      phrase('Asosiy fikr aniq ifodalangan.', 'The main point comes through clearly.', 'Главная мысль выражена ясно.', 'الفكرة الرئيسية واضحة.', 'Ana fikir açıkça anlaşılıyor.', 'Der Hauptgedanke kommt klar rüber.', 'Al-fikratu ar-raʾīsiyyatu wāḍiḥa.'),
      phrase('Ikkinchi misolga o‘tganingizda fikringizni tushunishga qiynaldim.', 'I found it hard to follow when you introduced the second example.', 'Когда вы перешли ко второму примеру, мне стало трудно следить за мыслью.', 'وجدت صعوبة في متابعة الفكرة عندما عرضت المثال الثاني.', 'İkinci örneğe geçtiğinizde konuyu takip etmekte zorlandım.', 'Beim zweiten Beispiel fiel es mir schwer, dem Gedankengang zu folgen.', 'Wajadtu ṣuʿūbatan fī mutābaʿati al-fikrati ʿindamā ʿaraḍta al-mithāla ath-thānī.'),
      phrase('Mavzuga oid dastlabki ma’lumotlarni boshiga ko‘chirsak bo‘ladimi?', 'Could we move the background information to the beginning?', 'Можем перенести вводную информацию в начало?', 'هل يمكننا نقل المعلومات التمهيدية إلى البداية؟', 'Arka plan bilgisini başa alabilir miyiz?', 'Könnten wir die Hintergrundinformationen an den Anfang stellen?', 'Hal yumkinunā naqlu al-maʿlūmāti at-tamhīdiyyati ilā al-bidāya?'),
      phrase('Aniq misol qo‘shsak, bu bo‘limni tushunish osonlashardi.', 'This section would be easier to follow if we added a concrete example.', 'Этот раздел было бы легче понять, если бы мы добавили конкретный пример.', 'سيكون هذا القسم أسهل فهمًا إذا أضفنا مثالًا محدّدًا.', 'Somut bir örnek eklesek bu bölümü anlamak daha kolay olurdu.', 'Dieser Abschnitt wäre leichter zu verstehen, wenn wir ein konkretes Beispiel hinzufügen würden.', 'Sayakūnu hādhā al-qismu ashala fahman idhā aḍafnā mithālan muḥaddadan.'),
      phrase('Men xulosani qoldirib, kirish qismini qisqartirardim.', 'I’d keep the conclusion and shorten the introduction.', 'Я бы оставил заключение и сократил вступление.', 'كنت سأُبقي الخاتمة وأختصر المقدّمة.', 'Sonuç bölümünü koruyup girişi kısaltırdım.', 'Ich würde den Schluss beibehalten und die Einleitung kürzen.', 'Kuntu sa-ubqī al-khātimata wa-akhtaṣiru al-muqaddima.'),
      phrase('Yuborishdan oldin tuzatilgan variantni birga ko‘rib chiqaylik.', 'Let’s review the revised version together before sending it.', 'Давайте вместе посмотрим исправленную версию перед отправкой.', 'لنراجع النسخة المنقّحة معًا قبل إرسالها.', 'Göndermeden önce düzeltilmiş sürümü birlikte gözden geçirelim.', 'Schauen wir uns die überarbeitete Fassung gemeinsam an, bevor wir sie abschicken.', 'Linurājiʿ an-nuskhata al-munaqqaḥata maʿan qabla irsālihā.')
    ]
  },
  {
    id: 'colors', level: 1, icon: 'spark', tone: 'mint',
    title: localized('Ranglarni aytish', 'Describing colours', 'Цвета предметов', 'وصف الألوان', 'Renkleri söylemek', 'Farben beschreiben'),
    description: localized('Rangni so‘rang va qaysi buyumni xohlayotganingizni ayting.', 'Ask about colours and say which object you want.', 'Спрашивайте о цвете и уточняйте, какой предмет вам нужен.', 'اسأل عن اللون وقل أيّ غرض تريد.', 'Renk sor ve hangi eşyayı istediğini söyle.', 'Frage nach Farben und sage, welchen Gegenstand du möchtest.'),
    phrases: [
      phrase('Bu qanday rang?', 'What colour is this?', 'Какого это цвета?', 'ما لون هذا؟', 'Bu ne renk?', 'Welche Farbe ist das?', 'Mā lawnu hādhā?'),
      phrase('Bu ko‘k piyola.', 'This is a blue cup.', 'Это синяя чашка.', 'هذا كوب أزرق.', 'Bu mavi bir fincan.', 'Das ist eine blaue Tasse.', 'Hādhā kūbun azraq.'),
      phrase('Qizil kitob meniki.', 'The red book is mine.', 'Красная книга моя.', 'الكتاب الأحمر لي.', 'Kırmızı kitap benim.', 'Das rote Buch gehört mir.', 'Al-kitābu al-aḥmaru lī.'),
      phrase('Oq sumkani bering, iltimos.', 'The white bag, please.', 'Белую сумку, пожалуйста.', 'الحقيبة البيضاء، من فضلك.', 'Beyaz çantayı alabilir miyim, lütfen?', 'Die weiße Tasche, bitte.', 'Al-ḥaqībatu al-bayḍāʾ, min faḍlika.'),
      phrase('Menda qora qalam bor.', 'I have a black pencil.', 'У меня есть чёрный карандаш.', 'لديّ قلم رصاص أسود.', 'Siyah bir kurşun kalemim var.', 'Ich habe einen schwarzen Bleistift.', 'Ladayya qalamu raṣāṣin aswad.'),
      phrase('Men sariq rangni yaxshi ko‘raman.', 'I like yellow.', 'Мне нравится жёлтый цвет.', 'أحبّ اللون الأصفر.', 'Sarı rengi severim.', 'Ich mag Gelb.', 'Uḥibbu al-lawna al-aṣfar.')
    ]
  },
  {
    id: 'outdoors', level: 2, icon: 'compass', tone: 'sky',
    title: localized('Sayrga chiqish', 'Going for a walk', 'На прогулке', 'الخروج للتنزّه', 'Yürüyüşe çıkmak', 'Spazieren gehen'),
    description: localized('Sayr uchun joy tanlang va ob-havoga qarab tayyorlaning.', 'Choose where to walk and get ready for the weather.', 'Выберите место для прогулки и подготовьтесь к погоде.', 'اختر مكانًا للتنزّه واستعدّ للطقس.', 'Yürüyüş yapacağın yeri seç ve havaya göre hazırlan.', 'Wähle einen Ort zum Spazierengehen und stell dich auf das Wetter ein.'),
    phrases: [
      phrase('Bugun havo iliq.', 'It’s warm today.', 'Сегодня тепло.', 'الجوّ دافئ اليوم.', 'Bugün hava ılık.', 'Heute ist es warm.', 'Al-jawwu dāfiʾun al-yawm.'),
      phrase('Daryo bo‘yida sayr qilaylik.', 'Let’s take a walk along the river.', 'Давайте прогуляемся вдоль реки.', 'لنتنزّه على ضفّة النهر.', 'Nehir kıyısında yürüyelim.', 'Gehen wir am Fluss entlang spazieren.', 'Litanazzah ʿalā ḍiffati an-nahr.'),
      phrase('Yo‘lak daraxtlar orasidan o‘tadi.', 'The path goes through the trees.', 'Тропинка проходит между деревьями.', 'يمرّ الممرّ بين الأشجار.', 'Patika ağaçların arasından geçiyor.', 'Der Weg führt zwischen den Bäumen hindurch.', 'Yamurru al-mamarru bayna al-ashjār.'),
      phrase('Soyada biroz o‘tiramizmi?', 'Shall we sit in the shade for a while?', 'Посидим немного в тени?', 'هل نجلس قليلًا في الظلّ؟', 'Biraz gölgede oturalım mı?', 'Wollen wir uns eine Weile in den Schatten setzen?', 'Hal najlisu qalīlan fī aẓ-ẓill?'),
      phrase('Soyabonni ham olaylik.', 'Let’s take the umbrella too.', 'Давайте возьмём ещё и зонт.', 'لنأخذ المظلّة أيضًا.', 'Şemsiyeyi de alalım.', 'Nehmen wir auch den Regenschirm mit.', 'Linaʾkhudh al-miẓallata ayḍan.'),
      phrase('Yomg‘ir yog‘sa, uyga qaytamiz.', 'If it rains, we’ll go home.', 'Если пойдёт дождь, мы вернёмся домой.', 'إذا أمطرت، فسنعود إلى البيت.', 'Yağmur yağarsa eve döneriz.', 'Wenn es regnet, gehen wir nach Hause.', 'Idhā amṭarat, fasanʿūdu ilā al-bayt.')
    ]
  },
  {
    id: 'bakery', level: 3, icon: 'bag', tone: 'peach',
    title: localized('Nonvoyxonada', 'At the bakery', 'В пекарне', 'في المخبز', 'Fırında', 'In der Bäckerei'),
    description: localized('Nonning yangiligini so‘rang va qancha kerakligini ayting.', 'Ask what’s fresh and say how much you want.', 'Спросите, что свежее, и скажите, сколько вам нужно.', 'اسأل عمّا هو طازج وقل ما الكميّة التي تريدها.', 'Neyin taze olduğunu sor ve ne kadar istediğini söyle.', 'Frag, was frisch ist, und sag, wie viel du möchtest.'),
    phrases: [
      phrase('Bu non bugun yopilganmi?', 'Was this bread baked today?', 'Этот хлеб испекли сегодня?', 'هل خُبز هذا الرغيف اليوم؟', 'Bu ekmek bugün mü pişti?', 'Wurde dieses Brot heute gebacken?', 'Hal khubiza hādhā ar-raghīfu al-yawm?'),
      phrase('Menga ikkita kruassan bering, iltimos.', 'Two croissants, please.', 'Мне два круассана, пожалуйста.', 'قطعتَي كرواسون، من فضلك.', 'İki kruvasan, lütfen.', 'Zwei Croissants, bitte.', 'Qiṭʿatay krūwāsūn, min faḍlika.'),
      phrase('Bagetning yarmini olsam bo‘ladimi?', 'Could I have half a baguette?', 'Можно мне половину багета?', 'هل يمكنني أخذ نصف رغيف باغيت؟', 'Yarım baget alabilir miyim?', 'Könnte ich ein halbes Baguette bekommen?', 'Hal yumkinunī akhdhu niṣfi raghīfi bāghīt?'),
      phrase('Nonni tilimlab bera olasizmi?', 'Could you slice the bread?', 'Можете нарезать хлеб?', 'هل يمكنك تقطيع الخبز إلى شرائح؟', 'Ekmeği dilimleyebilir misiniz?', 'Könnten Sie das Brot in Scheiben schneiden?', 'Hal yumkinuka taqṭīʿu al-khubzi ilā sharāʾiḥ?'),
      phrase('Qaysi pishiriqning ichida pishloq bor?', 'Which pastry has cheese inside?', 'Какая выпечка с сыром внутри?', 'أيّ قطعة من المعجّنات فيها جبن؟', 'Hangi hamur işinin içinde peynir var?', 'Welches Gebäck ist mit Käse gefüllt?', 'Ayyu qiṭʿatin mina al-muʿajjanāti fīhā jubn?'),
      phrase('Hammasini qog‘oz paketga soling, iltimos.', 'Put everything in a paper bag, please.', 'Положите всё в бумажный пакет, пожалуйста.', 'ضع كلّ شيء في كيس ورقيّ، من فضلك.', 'Hepsini kâğıt poşete koyun, lütfen.', 'Packen Sie bitte alles in eine Papiertüte.', 'Ḍaʿ kulla shayʾin fī kīsin waraqiyyin, min faḍlika.')
    ]
  },
  {
    id: 'library-visit', level: 4, icon: 'book', tone: 'sky',
    title: localized('Kutubxonada', 'At the library', 'В библиотеке', 'في المكتبة', 'Kütüphanede', 'In der Bibliothek'),
    description: localized('Kitob toping, olib turing va uni qachon qaytarish kerakligini so‘rang.', 'Find a book, borrow it, and ask when it’s due.', 'Найдите книгу, возьмите её и уточните, когда её нужно вернуть.', 'اعثر على كتاب واستعره واسأل عن موعد إعادته.', 'Bir kitap bul, ödünç al ve ne zaman iade etmen gerektiğini sor.', 'Finde ein Buch, leih es aus und frag, wann du es zurückgeben musst.'),
    phrases: [
      phrase('Lug‘atlarni qayerdan topsam bo‘ladi?', 'Where can I find the dictionaries?', 'Где можно найти словари?', 'أين أجد القواميس؟', 'Sözlükleri nerede bulabilirim?', 'Wo finde ich die Wörterbücher?', 'Ayna ajidu al-qawāmīs?'),
      phrase('Kutubxonadan foydalanish uchun qanday ro‘yxatdan o‘tsam bo‘ladi?', 'How do I sign up for a library card?', 'Как получить читательский билет?', 'كيف أحصل على بطاقة المكتبة؟', 'Kütüphane kartı nasıl alabilirim?', 'Wie bekomme ich einen Bibliotheksausweis?', 'Kayfa aḥṣulu ʿalā biṭāqati al-maktaba?'),
      phrase('Bu kitobni ikki haftaga olsam bo‘ladimi?', 'Can I borrow this book for two weeks?', 'Можно взять эту книгу на две недели?', 'هل يمكنني استعارة هذا الكتاب لأسبوعين؟', 'Bu kitabı iki haftalığına ödünç alabilir miyim?', 'Kann ich dieses Buch für zwei Wochen ausleihen?', 'Hal yumkinunī istiʿāratu hādhā al-kitābi li-usbūʿayn?'),
      phrase('Uni qaysi kuni qaytarishim kerak?', 'What day do I have to return it?', 'В какой день мне нужно её вернуть?', 'في أيّ يوم يجب أن أعيده؟', 'Onu hangi gün iade etmem gerekiyor?', 'An welchem Tag muss ich es zurückgeben?', 'Fī ayyi yawmin yajibu an uʿīdah?'),
      phrase('Olib turish muddatini onlayn uzaytirsam bo‘ladimi?', 'Can I renew the loan online?', 'Можно продлить срок через интернет?', 'هل يمكنني تمديد مدّة الاستعارة عبر الإنترنت؟', 'Ödünç alma süresini internetten uzatabilir miyim?', 'Kann ich die Ausleihe online verlängern?', 'Hal yumkinunī tamdīdu muddati al-istiʿārati ʿabra al-intarnit?'),
      phrase('Kutubxona yopilgandan keyin kitoblarni qayerga topshirsam bo‘ladi?', 'Where can I return books after the library closes?', 'Куда можно сдать книги после закрытия библиотеки?', 'أين يمكنني إعادة الكتب بعد إغلاق المكتبة؟', 'Kütüphane kapandıktan sonra kitapları nereye iade edebilirim?', 'Wo kann ich Bücher zurückgeben, wenn die Bibliothek geschlossen ist?', 'Ayna yumkinunī iʿādatu al-kutubi baʿda ighlāqi al-maktaba?')
    ]
  },
  {
    id: 'coach-trip', level: 5, icon: 'compass', tone: 'sand',
    title: localized('Avtobusda safar', 'Travelling by coach', 'Поездка на автобусе', 'السفر بالحافلة', 'Otobüs yolculuğu', 'Mit dem Fernbus unterwegs'),
    description: localized('Shaharlararo avtobus chiptasini almashtirish va manzilga qachon yetib borishni so‘rashni mashq qiling.', 'Practice changing a coach ticket and asking when you’ll arrive.', 'Потренируйтесь менять билет на автобус и уточнять время прибытия.', 'تدرّب على تغيير تذكرة الحافلة والسؤال عن وقت الوصول.', 'Otobüs biletini değiştirmeyi ve ne zaman varacağını sormayı çalış.', 'Übe, ein Fernbusticket umzubuchen und nach der Ankunftszeit zu fragen.'),
    phrases: [
      phrase('Bu avtobus yo‘lda to‘xtaydimi?', 'Does this coach make any stops on the way?', 'Этот автобус делает остановки по пути?', 'هل تتوقّف هذه الحافلة في الطريق؟', 'Bu otobüs yol üzerinde duruyor mu?', 'Hält dieser Fernbus unterwegs an?', 'Hal tatawaqqafu hādhihi al-ḥāfilatu fī aṭ-ṭarīq?'),
      phrase('Avvalgi avtobus kechikdi, shuning uchun keyingisiga ulgurolmadim.', 'My first coach was late, so I missed my connection.', 'Первый автобус опоздал, и я не успел на пересадку.', 'تأخّرت حافلتي الأولى، ففاتتني الحافلة التالية.', 'İlk otobüsüm gecikti, bu yüzden aktarma otobüsünü kaçırdım.', 'Mein erster Bus hatte Verspätung, deshalb habe ich den Anschluss verpasst.', 'Taʾakhkharat ḥāfilatī al-ūlā, fa-fātatnī al-ḥāfilatu at-tāliya.'),
      phrase('Chiptamni keyingi qatnovga almashtirsam bo‘ladimi?', 'Can I change my ticket to the next departure?', 'Можно поменять билет на следующий рейс?', 'هل يمكنني تغيير حجز تذكرتي إلى الرحلة التالية؟', 'Biletimi bir sonraki sefere aktarabilir miyim?', 'Kann ich mein Ticket auf die nächste Fahrt umbuchen?', 'Hal yumkinunī taghyīru ḥajzi tadhkiratī ilā ar-riḥlati at-tāliya?'),
      phrase('Qo‘shimcha haq to‘lashim kerakmi?', 'Do I have to pay an extra fee?', 'Нужно ли мне доплатить?', 'هل عليّ دفع رسوم إضافيّة؟', 'Ek ücret ödemem gerekiyor mu?', 'Muss ich eine zusätzliche Gebühr zahlen?', 'Hal ʿalayya dafʿu rusūmin iḍāfiyya?'),
      phrase('Yukimni qayerga qo‘ysam bo‘ladi?', 'Where can I put my luggage?', 'Куда можно положить багаж?', 'أين يمكنني وضع أمتعتي؟', 'Bagajımı nereye koyabilirim?', 'Wo kann ich mein Gepäck unterbringen?', 'Ayna yumkinunī waḍʿu amtiʿatī?'),
      phrase('Manzilga soat nechada yetib boramiz?', 'What time will we arrive?', 'Во сколько мы приедем?', 'في أيّ ساعة سنصل؟', 'Saat kaçta varacağız?', 'Um wie viel Uhr kommen wir an?', 'Fī ayyi sāʿatin sanaṣil?')
    ]
  },
  {
    id: 'community-garden', level: 6, icon: 'flag', tone: 'mint',
    title: localized('Mahalla bog‘i', 'A community garden', 'Общественный сад', 'حديقة الحيّ', 'Mahalle bahçesi', 'Ein Gemeinschaftsgarten'),
    description: localized('Bog‘da nima o‘zgargani va buning sababini tushuntiring.', 'Explain what changed in the garden and why.', 'Объясните, что изменилось в саду и почему.', 'اشرح ما تغيّر في الحديقة ولماذا.', 'Bahçede neyin neden değiştiğini anlat.', 'Erkläre, was sich im Garten verändert hat und warum.'),
    phrases: [
      phrase('Bahorda qo‘shnilar bilan urug‘ ekdik.', 'We planted seeds with our neighbours in the spring.', 'Весной мы посеяли семена вместе с соседями.', 'زرعنا البذور مع جيراننا في الربيع.', 'İlkbaharda komşularımızla tohum ektik.', 'Im Frühling haben wir mit unseren Nachbarn Samen gesät.', 'Zaraʿnā al-budhūra maʿa jīrāninā fī ar-rabīʿ.'),
      phrase('Quyosh kam tushgani uchun ko‘chatlar sekin o‘sdi.', 'The seedlings grew slowly because they got little sunlight.', 'Рассада росла медленно, потому что ей не хватало солнца.', 'نمت الشتلات ببطء لأنّها لم تحصل على ضوء شمس كافٍ.', 'Fideler yeterince güneş almadığı için yavaş büyüdü.', 'Die Setzlinge wuchsen langsam, weil sie wenig Sonne bekamen.', 'Namat ash-shatalātu bi-buṭʾin li-annahā lam taḥṣul ʿalā ḍawʾi shamsin kāf.'),
      phrase('Shuning uchun ko‘chatlarni quyosh ko‘proq tushadigan joyga ko‘chirdik.', 'So we moved the seedlings to a sunnier spot.', 'Поэтому мы пересадили рассаду в более солнечное место.', 'لذلك نقلنا الشتلات إلى مكان أكثر تعرّضًا للشمس.', 'Bu yüzden fideleri daha güneşli bir yere taşıdık.', 'Deshalb haben wir die Setzlinge an einen sonnigeren Platz umgesetzt.', 'Li-dhālika naqalnā ash-shatalāti ilā makānin akthara taʿarruḍan li-sh-shams.'),
      phrase('Yer nam bo‘lsa, bugun sug‘orishimizga hojat yo‘q.', 'If the soil is damp, we don’t need to water today.', 'Если почва влажная, сегодня поливать не нужно.', 'إذا كانت التربة رطبة، فلا حاجة إلى الريّ اليوم.', 'Toprak nemliyse bugün sulamamıza gerek yok.', 'Wenn die Erde feucht ist, müssen wir heute nicht gießen.', 'Idhā kānat at-turbatu raṭbatan, fa-lā ḥājata ilā ar-rayyi al-yawm.'),
      phrase('Bu yil avvalgidan ko‘proq pomidor terdik.', 'This year we picked more tomatoes than before.', 'В этом году мы собрали больше помидоров, чем раньше.', 'قطفنا هذا العام طماطم أكثر من ذي قبل.', 'Bu yıl öncekinden daha fazla domates topladık.', 'Dieses Jahr haben wir mehr Tomaten geerntet als früher.', 'Qaṭafnā hādhā al-ʿāma ṭamāṭima akthara min dhī qabl.'),
      phrase('Menimcha, kelasi bahorda ham shu usulni qo‘llashimiz kerak.', 'I think we should use the same method next spring.', 'Думаю, следующей весной стоит снова применить этот способ.', 'أظنّ أنّ علينا استخدام الطريقة نفسها في الربيع المقبل.', 'Bence gelecek ilkbaharda da aynı yöntemi kullanmalıyız.', 'Ich finde, wir sollten nächsten Frühling dieselbe Methode anwenden.', 'Aẓunnu anna ʿalaynā istikhdāma aṭ-ṭarīqati nafsihā fī ar-rabīʿi al-muqbil.')
    ]
  },
  {
    id: 'maintenance', level: 7, icon: 'key', tone: 'sky',
    title: localized('Ta’mirlash uchun murojaat', 'Requesting a repair', 'Заявка на ремонт', 'طلب إصلاح', 'Onarım talebi', 'Eine Reparatur anfragen'),
    description: localized('Nosozlikni tushuntiring va usta qachon kelishini kelishib oling.', 'Describe a fault and arrange a time for a technician to come.', 'Опишите неисправность и договоритесь о времени визита мастера.', 'صِف العطل واتّفق على موعد لزيارة الفنّيّ.', 'Arızayı tarif et ve teknisyenin geleceği saati belirle.', 'Beschreibe den Defekt und vereinbare einen Termin für die Reparatur.'),
    phrases: [
      phrase('Jo‘mrak yopiq bo‘lsa ham, undan suv tomchilayapti.', 'The tap keeps dripping even when it’s turned off.', 'Кран капает, даже когда он закрыт.', 'يستمرّ الصنبور في التنقيط حتّى عندما يكون مغلقًا.', 'Musluk kapalıyken bile damlatıyor.', 'Der Wasserhahn tropft auch dann, wenn er zugedreht ist.', 'Yastamirru aṣ-ṣunbūru fī at-tanqīṭi ḥattā ʿindamā yakūnu mughlaqan.'),
      phrase('Muammo kecha boshlandi va bugun kuchaydi.', 'The problem started yesterday and got worse today.', 'Проблема появилась вчера, а сегодня усугубилась.', 'بدأت المشكلة أمس وتفاقمت اليوم.', 'Sorun dün başladı, bugün daha da kötüleşti.', 'Das Problem hat gestern angefangen und ist heute schlimmer geworden.', 'Badaʾat al-mushkilatu amsi wa-tafāqamat al-yawm.'),
      phrase('Qaysi detal kerakligini bilish uchun surat yuborsam bo‘ladimi?', 'Could I send a photo so you can see which part is needed?', 'Могу я прислать фото, чтобы вы определили, какая деталь нужна?', 'هل يمكنني إرسال صورة لتعرفوا أيّ قطعة نحتاج إليها؟', 'Hangi parçanın gerektiğini anlamanız için bir fotoğraf gönderebilir miyim?', 'Kann ich Ihnen ein Foto schicken, damit Sie sehen, welches Teil gebraucht wird?', 'Hal yumkinunī irsālu ṣūratin li-taʿrifū ayya qiṭʿatin naḥtāju ilayhā?'),
      phrase('Iloji bo‘lsa, usta tushgacha kelsin.', 'If possible, I’d like the technician to come before noon.', 'Если возможно, пусть мастер придёт до полудня.', 'إن أمكن، أودّ أن يأتي الفنّيّ قبل الظهر.', 'Mümkünse teknisyenin öğleden önce gelmesini isterim.', 'Wenn möglich, sollte der Techniker vor zwölf Uhr kommen.', 'In amkana, awaddu an yaʾtiya al-fanniyyu qabla aẓ-ẓuhr.'),
      phrase('Kechikadigan bo‘lsangiz, oldindan xabar bering.', 'Please let me know in advance if you’ll be late.', 'Если вы задержитесь, предупредите меня заранее.', 'إذا تأخّرتم، فأخبروني مسبقًا من فضلكم.', 'Gecikecekseniz lütfen önceden haber verin.', 'Bitte geben Sie mir vorher Bescheid, falls Sie sich verspäten.', 'Idhā taʾakhkhartum, fa-akhbirūnī musbaqan min faḍlikum.'),
      phrase('Ishni boshlashdan oldin ta’mir qancha turishini ayta olasizmi?', 'Could you tell me the cost before you start the repair?', 'Не могли бы вы назвать стоимость ремонта до начала работ?', 'هل يمكنكم إخباري بتكلفة الإصلاح قبل أن تبدؤوا العمل؟', 'Onarıma başlamadan önce ne kadara mal olacağını söyleyebilir misiniz?', 'Können Sie mir vor der Reparatur sagen, was sie kosten wird?', 'Hal yumkinukum ikhbārī bi-taklifati al-iṣlāḥi qabla an tabdaʾū al-ʿamal?')
    ]
  },
  {
    id: 'meeting-summary', level: 8, icon: 'chat', tone: 'lilac',
    title: localized('Yig‘ilish xulosasini yozish', 'Summarizing a meeting', 'Как подвести итоги совещания', 'تلخيص اجتماع', 'Toplantıyı özetleme', 'Eine Besprechung zusammenfassen'),
    description: localized('Taklif, qaror va keyingi vazifalarni aniq ifodalashni mashq qiling.', 'Practice reporting proposals, decisions, and next steps clearly.', 'Потренируйтесь чётко формулировать предложения, решения и следующие шаги.', 'تدرّب على عرض المقترحات والقرارات والخطوات التالية بوضوح.', 'Önerileri, kararları ve sonraki adımları açıkça aktarmayı çalış.', 'Übe, Vorschläge, Beschlüsse und nächste Schritte klar wiederzugeben.'),
    phrases: [
      phrase('Jamoa bu taklifni muhokama qildi, lekin hali bir qarorga kelmadi.', 'The team discussed the proposal but hasn’t made a decision yet.', 'Команда обсудила предложение, но пока не приняла решения.', 'ناقش الفريق المقترح، لكنّه لم يتّخذ قرارًا بعد.', 'Ekip öneriyi tartıştı ama henüz bir karar vermedi.', 'Das Team hat den Vorschlag besprochen, aber noch keine Entscheidung getroffen.', 'Nāqasha al-farīqu al-muqtaraḥa, lākinnahu lam yattakhidh qarāran baʿd.'),
      phrase('Xonalar bo‘sh yoki bandligini tekshirmagunimizcha sanani tasdiqlay olmaymiz.', 'We can’t confirm the date until we’ve checked which rooms are available.', 'Мы не можем подтвердить дату, пока не выясним, какие помещения свободны.', 'لا يمكننا تأكيد الموعد قبل أن نتحقّق من القاعات المتاحة.', 'Hangi odaların boş olduğunu kontrol edene kadar tarihi kesinleştiremeyiz.', 'Wir können den Termin erst bestätigen, wenn wir geprüft haben, welche Räume frei sind.', 'Lā yumkinunā taʾkīdu al-mawʿidi qabla an nataḥaqqaqa mina al-qāʿāti al-mutāḥa.'),
      phrase('Tekshirib bo‘lganimdan keyin yangilangan ro‘yxatni hammaga yuboraman.', 'Once I’ve checked, I’ll send everyone the updated list.', 'Как только проверю, разошлю всем обновлённый список.', 'بعد أن أتحقّق، سأرسل القائمة المحدّثة إلى الجميع.', 'Kontrol ettikten sonra güncellenmiş listeyi herkese göndereceğim.', 'Sobald ich das geprüft habe, schicke ich allen die aktualisierte Liste.', 'Baʿda an ataḥaqqaqa, sa-ursilu al-qāʾimata al-muḥaddathata ilā al-jamīʿ.'),
      phrase('Xabarda kelishilgan vazifalarni alohida ko‘rsata olasizmi?', 'Could you list the agreed tasks separately in the message?', 'Можете перечислить согласованные задачи в сообщении отдельно?', 'هل يمكنكم ذكر المهامّ المتّفق عليها بشكل منفصل في الرسالة؟', 'Üzerinde anlaşılan görevleri mesajda ayrı bir liste hâlinde yazabilir misiniz?', 'Können Sie die vereinbarten Aufgaben in der Nachricht gesondert aufführen?', 'Hal yumkinukum dhikru al-mahāmmi al-muttafaqi ʿalayhā bi-shaklin munfaṣilin fī ar-risāla?'),
      phrase('Kim qaysi vazifaga mas’ul va uni qachongacha bajarishi kerakligini yozing.', 'Write down who is responsible for each task and when it’s due.', 'Запишите, кто отвечает за каждую задачу и к какому сроку её нужно выполнить.', 'اكتبوا من المسؤول عن كلّ مهمّة وما الموعد النهائيّ لإنجازها.', 'Her görevden kimin sorumlu olduğunu ve görevin ne zamana kadar bitmesi gerektiğini yazın.', 'Halten Sie fest, wer für welche Aufgabe zuständig ist und bis wann sie erledigt sein soll.', 'Uktubū man al-masʾūlu ʿan kulli muhimma wa-mā al-mawʿidu an-nihāʾiyyu li-injāzihā.'),
      phrase('Agar biror masala ochiq qolgan bo‘lsa, uni keyingi yig‘ilish kun tartibiga qo‘shing.', 'If any issue is still unresolved, put it on the agenda for the next meeting.', 'Если какой-то вопрос остался открытым, внесите его в повестку следующего совещания.', 'إذا بقيت أيّ مسألة عالقة، فأضيفوها إلى جدول أعمال الاجتماع المقبل.', 'Çözüme kavuşmamış bir konu varsa onu bir sonraki toplantının gündemine ekleyin.', 'Falls ein Punkt noch offen ist, setzen Sie ihn auf die Tagesordnung der nächsten Besprechung.', 'Idhā baqiyat ayyu masʾalatin ʿāliqa, fa-aḍīfūhā ilā jadwali aʿmāli al-ijtimāʿi al-muqbil.')
    ]
  }
);

units.push(...moreLessons, ...extraLessons);

for (const unit of units) {
  unit.phrases.forEach((entry, index) => {
    entry.id = unit.id + '-' + (index + 1);
    entry.level = unit.level;
  });
}

export const phrases = units.flatMap(unit => unit.phrases);
