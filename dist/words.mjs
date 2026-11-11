import { localized as names, phrase as word } from './content.mjs';
import { moreWordGroups } from './more-words.mjs';

function group(id, level, tone, title, words) {
  words.forEach((entry, index) => { entry.id = 'word-' + id + '-' + (index + 1); entry.level = level; });
  return { id, level, tone, title, words };
}

export const wordGroups = [
  group('people', 1, 'lilac', names('Odamlar', 'People', 'Люди', 'الناس', 'İnsanlar', 'Menschen'), [
    word('oila', 'family', 'семья', 'عائلة', 'aile', 'die Familie', 'ʿāʾila'),
    word('ota', 'father', 'отец', 'أب', 'baba', 'der Vater', 'ab'),
    word('ona', 'mother', 'мать', 'أمّ', 'anne', 'die Mutter', 'umm'),
    word('bola', 'child', 'ребёнок', 'طفل', 'çocuk', 'das Kind', 'ṭifl'),
    word('do‘st', 'friend', 'друг', 'صديق', 'arkadaş', 'der Freund', 'ṣadīq'),
    word('qo‘shni', 'neighbor', 'сосед', 'جار', 'komşu', 'der Nachbar', 'jār'),
    word('mehmon', 'guest', 'гость', 'ضيف', 'misafir', 'der Gast', 'ḍayf'),
    word('hamkasb', 'colleague', 'коллега', 'زميل', 'iş arkadaşı', 'der Kollege', 'zamīl')
  ]),
  // Words used from the first classroom and belongings lessons.
  group('classroom', 1, 'sky', names('Darsda', 'In class', 'На занятии', 'في الصفّ', 'Derste', 'Im Unterricht'), [
    word('dars', 'lesson', 'урок', 'درس', 'ders', 'die Unterrichtsstunde', 'dars'),
    word('daftar', 'notebook', 'тетрадь', 'دفتر', 'defter', 'das Heft', 'daftar'),
    word('qalam', 'pencil', 'карандаш', 'قلم رصاص', 'kurşun kalem', 'der Bleistift', 'qalam raṣāṣ'),
    word('kitob', 'book', 'книга', 'كتاب', 'kitap', 'das Buch', 'kitāb'),
    word('doska', 'board', 'доска', 'سبّورة', 'tahta', 'die Tafel', 'sabbūra'),
    word('o‘qituvchi', 'teacher', 'учитель', 'معلّم', 'öğretmen', 'der Lehrer', 'muʿallim'),
    word('talaba', 'student', 'студент', 'طالب', 'öğrenci', 'der Student', 'ṭālib'),
    word('savol', 'question', 'вопрос', 'سؤال', 'soru', 'die Frage', 'suʾāl')
  ]),
  group('home', 2, 'peach', names('Uy', 'Home', 'Дом', 'البيت', 'Ev', 'Zuhause'), [
    word('xona', 'room', 'комната', 'غرفة', 'oda', 'das Zimmer', 'ghurfa'),
    word('oshxona', 'kitchen', 'кухня', 'مطبخ', 'mutfak', 'die Küche', 'maṭbakh'),
    word('deraza', 'window', 'окно', 'نافذة', 'pencere', 'das Fenster', 'nāfidha'),
    word('eshik', 'door', 'дверь', 'باب', 'kapı', 'die Tür', 'bāb'),
    word('kalit', 'key', 'ключ', 'مفتاح', 'anahtar', 'der Schlüssel', 'miftāḥ'),
    word('stol', 'table', 'стол', 'طاولة', 'masa', 'der Tisch', 'ṭāwila'),
    word('stul', 'chair', 'стул', 'كرسيّ', 'sandalye', 'der Stuhl', 'kursī'),
    word('chiroq', 'lamp', 'лампа', 'مصباح', 'lamba', 'die Lampe', 'miṣbāḥ')
  ]),
  group('food', 3, 'mint', names('Oziq-ovqat', 'Food and drink', 'Еда и напитки', 'الطعام والشراب', 'Yiyecek ve içecek', 'Essen und Trinken'), [
    word('suv', 'water', 'вода', 'ماء', 'su', 'das Wasser', 'māʾ'),
    word('sut', 'milk', 'молоко', 'حليب', 'süt', 'die Milch', 'ḥalīb'),
    word('non', 'bread', 'хлеб', 'خبز', 'ekmek', 'das Brot', 'khubz'),
    word('olma', 'apple', 'яблоко', 'تفّاحة', 'elma', 'der Apfel', 'tuffāḥa'),
    word('tuxum', 'egg', 'яйцо', 'بيضة', 'yumurta', 'das Ei', 'bayḍa'),
    word('guruch', 'rice', 'рис', 'أرزّ', 'pirinç', 'der Reis', 'aruzz'),
    word('pishloq', 'cheese', 'сыр', 'جبن', 'peynir', 'der Käse', 'jubn'),
    word('sho‘rva', 'soup', 'суп', 'حساء', 'çorba', 'die Suppe', 'ḥasāʾ')
  ]),
  group('city', 4, 'sky', names('Shahar', 'Around town', 'В городе', 'في المدينة', 'Şehirde', 'In der Stadt'), [
    word('ko‘cha', 'street', 'улица', 'شارع', 'sokak', 'die Straße', 'shāriʿ'),
    word('maktab', 'school', 'школа', 'مدرسة', 'okul', 'die Schule', 'madrasa'),
    word('kutubxona', 'library', 'библиотека', 'مكتبة', 'kütüphane', 'die Bibliothek', 'maktaba'),
    word('bozor', 'market', 'рынок', 'سوق', 'pazar yeri', 'der Markt', 'sūq'),
    word('dorixona', 'pharmacy', 'аптека', 'صيدلية', 'eczane', 'die Apotheke', 'ṣaydaliyya'),
    word('bog‘', 'park', 'парк', 'حديقة عامّة', 'park', 'der Park', 'ḥadīqa ʿāmma'),
    word('ko‘prik', 'bridge', 'мост', 'جسر', 'köprü', 'die Brücke', 'jisr'),
    word('bekat', 'bus stop', 'автобусная остановка', 'موقف الحافلات', 'otobüs durağı', 'die Bushaltestelle', 'mawqif al-ḥāfilāt'),
    word('manzil', 'address', 'адрес', 'عنوان', 'adres', 'die Adresse', 'ʿunwān')
  ]),
  group('travel', 5, 'sand', names('Safar', 'Travel', 'Поездки', 'السفر', 'Seyahat', 'Reisen'), [
    word('poyezd', 'train', 'поезд', 'قطار', 'tren', 'der Zug', 'qiṭār'),
    word('avtobus', 'bus', 'автобус', 'حافلة', 'otobüs', 'der Bus', 'ḥāfila'),
    word('samolyot', 'airplane', 'самолёт', 'طائرة', 'uçak', 'das Flugzeug', 'ṭāʾira'),
    word('chipta', 'ticket', 'билет', 'تذكرة', 'bilet', 'die Fahrkarte', 'tadhkira'),
    word('chamadon', 'suitcase', 'чемодан', 'حقيبة سفر', 'valiz', 'der Koffer', 'ḥaqībat safar'),
    word('pasport', 'passport', 'паспорт', 'جواز سفر', 'pasaport', 'der Reisepass', 'jawāz safar'),
    word('mehmonxona', 'hotel', 'гостиница', 'فندق', 'otel', 'das Hotel', 'funduq'),
    word('xarita', 'map', 'карта', 'خريطة', 'harita', 'die Karte', 'kharīṭa')
  ]),
  group('work', 8, 'lilac', names('Ishdagi vazifalar', 'Tasks at work', 'Рабочие задачи', 'مهامّ العمل', 'İş görevleri', 'Aufgaben bei der Arbeit'), [
    word('vazifa', 'task', 'задание', 'مهمّة', 'görev', 'die Aufgabe', 'mahamma'),
    word('loyiha', 'project', 'проект', 'مشروع', 'proje', 'das Projekt', 'mashrūʿ'),
    word('jamoa', 'team', 'команда', 'فريق', 'ekip', 'das Team', 'farīq'),
    word('hisobot', 'report', 'отчёт', 'تقرير', 'rapor', 'der Bericht', 'taqrīr'),
    word('qoralama', 'draft', 'черновик', 'مسوّدة', 'taslak', 'der Entwurf', 'musawwada'),
    word('ish yuki', 'workload', 'рабочая нагрузка', 'عبء العمل', 'iş yükü', 'die Arbeitsbelastung', 'ʿibʾ al-ʿamal'),
    word('rahbar', 'manager', 'руководитель', 'مدير', 'yönetici', 'die Führungskraft', 'mudīr'),
    word('muhokama', 'discussion', 'обсуждение', 'نقاش', 'tartışma', 'die Diskussion', 'niqāsh')
  ]),
  group('time', 2, 'rose', names('Vaqt', 'Time', 'Время', 'الوقت', 'Zaman', 'Zeit'), [
    word('bugun', 'today', 'сегодня', 'اليوم', 'bugün', 'heute', 'al-yawm'),
    word('ertaga', 'tomorrow', 'завтра', 'غدًا', 'yarın', 'morgen', 'ghadan'),
    word('kecha', 'yesterday', 'вчера', 'أمس', 'dün', 'gestern', 'amsi'),
    word('hozir', 'now', 'сейчас', 'الآن', 'şimdi', 'jetzt', 'al-ān'),
    word('keyinroq', 'later', 'позже', 'لاحقًا', 'daha sonra', 'später', 'lāḥiqan'),
    word('ertalab', 'in the morning', 'утром', 'في الصباح', 'sabahleyin', 'am Morgen', 'fī aṣ-ṣabāḥ'),
    word('hafta', 'week', 'неделя', 'أسبوع', 'hafta', 'die Woche', 'usbūʿ'),
    word('oy', 'month', 'месяц', 'شهر', 'ay', 'der Monat', 'shahr')
  ]),
  // Basic feelings support the Level 2 "How do you feel?" lesson.
  group('mood', 2, 'rose', names('Kayfiyat va holat', 'Mood and wellbeing', 'Настроение и самочувствие', 'المزاج والحالة', 'Ruh hâli ve sağlık', 'Stimmung und Befinden'), [
    word('xursand', 'happy', 'радостный', 'سعيد', 'mutlu', 'glücklich', 'saʿīd'),
    word('xafa', 'sad', 'грустный', 'حزين', 'üzgün', 'traurig', 'ḥazīn'),
    word('charchagan', 'tired', 'уставший', 'متعب', 'yorgun', 'müde', 'mutʿab'),
    word('och', 'hungry', 'голодный', 'جائع', 'aç', 'hungrig', 'jāʾiʿ'),
    word('chanqagan', 'thirsty', 'испытывающий жажду', 'عطشان', 'susamış', 'durstig', 'ʿaṭshān'),
    word('kasal', 'ill', 'больной', 'مريض', 'hasta', 'krank', 'marīḍ')
  ]),
  // Everyday linking words appear in lessons from Level 3.
  group('linking-basics', 2, 'sand', names('Oddiy bog‘lovchilar', 'Basic linking words', 'Простые связующие слова', 'أدوات ربط بسيطة', 'Temel bağlaçlar', 'Einfache Bindewörter'), [
    word('va', 'and', 'и', 'و', 've', 'und', 'wa'),
    word('yoki', 'or', 'или', 'أو', 'veya', 'oder', 'aw'),
    word('lekin', 'but', 'но', 'لكن', 'ama', 'aber', 'lākin'),
    word('chunki', 'because', 'потому что', 'لأنّ', 'çünkü', 'weil', 'li-anna'),
    word('shuningdek', 'also', 'также', 'أيضًا', 'ayrıca', 'auch', 'ayḍan')
  ]),
  group('weather', 4, 'sky', names('Ob-havo', 'Weather', 'Погода', 'الطقس', 'Hava durumu', 'Wetter'), [
    word('quyosh', 'sun', 'солнце', 'شمس', 'güneş', 'die Sonne', 'shams'),
    word('bulut', 'cloud', 'облако', 'سحابة', 'bulut', 'die Wolke', 'saḥāba'),
    word('yomg‘ir', 'rain', 'дождь', 'مطر', 'yağmur', 'der Regen', 'maṭar'),
    word('qor', 'snow', 'снег', 'ثلج', 'kar', 'der Schnee', 'thalj'),
    word('shamol', 'wind', 'ветер', 'ريح', 'rüzgâr', 'der Wind', 'rīḥ'),
    word('tuman', 'fog', 'туман', 'ضباب', 'sis', 'der Nebel', 'ḍabāb'),
    word('issiq', 'hot', 'жаркий', 'حارّ', 'sıcak', 'heiß', 'ḥārr'),
    word('sovuq', 'cold', 'холодный', 'بارد', 'soğuk', 'kalt', 'bārid')
  ]),
  group('clothes', 5, 'peach', names('Kiyimlar', 'Clothes', 'Одежда', 'الملابس', 'Giysiler', 'Kleidung'), [
    word('erkaklar ko‘ylagi', 'shirt', 'рубашка', 'قميص', 'gömlek', 'das Hemd', 'qamīṣ'),
    word('shim', 'trousers', 'брюки', 'بنطال', 'pantolon', 'die Hose', 'binṭāl'),
    word('yubka', 'skirt', 'юбка', 'تنّورة', 'etek', 'der Rock', 'tannūra'),
    word('palto', 'coat', 'пальто', 'معطف', 'palto', 'der Mantel', 'miʿṭaf'),
    word('paypoq', 'sock', 'носок', 'جورب', 'çorap', 'die Socke', 'jawrab'),
    word('sharf', 'scarf', 'шарф', 'وشاح', 'atkı', 'der Schal', 'wishāḥ'),
    word('qo‘lqop', 'glove', 'перчатка', 'قفّاز', 'eldiven', 'der Handschuh', 'quffāz'),
    word('kamar', 'belt', 'ремень', 'حزام', 'kemer', 'der Gürtel', 'ḥizām')
  ]),
  group('feelings', 6, 'rose', names('His-tuyg‘ular', 'Feelings', 'Чувства', 'المشاعر', 'Duygular', 'Gefühle'), [
    word('xotirjam', 'calm', 'спокойный', 'هادئ', 'sakin', 'ruhig', 'hādiʾ'),
    word('xavotirlangan', 'worried', 'встревоженный', 'قلق', 'endişeli', 'besorgt', 'qaliq'),
    word('hayron qolgan', 'surprised', 'удивлённый', 'متفاجئ', 'şaşırmış', 'überrascht', 'mutafājiʾ'),
    word('minnatdor', 'grateful', 'благодарный', 'ممتنّ', 'minnettar', 'dankbar', 'mumtann'),
    word('hafsalasi pir bo‘lgan', 'disappointed', 'разочарованный', 'خائب الأمل', 'hayal kırıklığına uğramış', 'enttäuscht', 'khāʾib al-amal'),
    word('faxrlangan', 'proud', 'гордый', 'فخور', 'gururlu', 'stolz', 'fakhūr'),
    word('sabrsiz', 'impatient', 'нетерпеливый', 'نافد الصبر', 'sabırsız', 'ungeduldig', 'nāfid aṣ-ṣabr'),
    word('uyalgan', 'embarrassed', 'смущённый', 'محرج', 'mahcup', 'verlegen', 'muḥraj')
  ]),
  group('actions', 1, 'mint', names('Harakatlar', 'Everyday actions', 'Повседневные действия', 'أفعال يومية', 'Günlük eylemler', 'Alltägliche Tätigkeiten'), [
    word('o‘qimoq', 'to read', 'читать', 'يقرأ', 'okumak', 'lesen', 'yaqraʾu'),
    word('yozmoq', 'to write', 'писать', 'يكتب', 'yazmak', 'schreiben', 'yaktubu'),
    word('tinglamoq', 'to listen', 'слушать', 'يستمع', 'dinlemek', 'zuhören', 'yastamiʿu'),
    word('gapirmoq', 'to speak', 'говорить', 'يتكلّم', 'konuşmak', 'sprechen', 'yatakallamu'),
    word('so‘ramoq', 'to ask', 'спрашивать', 'يسأل', 'sormak', 'fragen', 'yasʾalu'),
    word('kutmoq', 'to wait', 'ждать', 'ينتظر', 'beklemek', 'warten', 'yantaẓiru'),
    word('ochmoq', 'to open', 'открывать', 'يفتح', 'açmak', 'öffnen', 'yaftaḥu'),
    word('yopmoq', 'to close', 'закрывать', 'يغلق', 'kapatmak', 'schließen', 'yughliqu')
  ]),
  group('connectors', 7, 'sand', names('Bog‘lovchi iboralar', 'Linking words', 'Связующие слова', 'أدوات الربط', 'Bağlayıcı ifadeler', 'Verbindungswörter'), [
    word('shuning uchun', 'therefore', 'поэтому', 'لذلك', 'bu yüzden', 'deshalb', 'lidhālika'),
    word('masalan', 'for example', 'например', 'مثلًا', 'örneğin', 'zum Beispiel', 'mathalan'),
    word('shunga qaramay', 'nevertheless', 'тем не менее', 'مع ذلك', 'yine de', 'trotzdem', 'maʿa dhālika'),
    word('bundan tashqari', 'moreover', 'кроме того', 'علاوة على ذلك', 'bunun yanı sıra', 'außerdem', 'ʿilāwatan ʿalā dhālik'),
    word('aksincha', 'on the contrary', 'наоборот', 'على العكس', 'aksine', 'im Gegenteil', 'ʿalā al-ʿaks'),
    word('garchi', 'although', 'хотя', 'مع أنّ', 'her ne kadar', 'obwohl', 'maʿa anna'),
    word('natijada', 'as a result', 'в результате', 'نتيجةً لذلك', 'sonuç olarak', 'infolgedessen', 'natījatan li-dhālik'),
    word('aks holda', 'otherwise', 'иначе', 'وإلّا', 'aksi hâlde', 'sonst', 'wa-illā')
  ]),
  group('numbers', 1, 'mint', names('Sonlar', 'Numbers', 'Числа', 'الأعداد', 'Sayılar', 'Zahlen'), [
    word('bir', 'one', 'один', 'واحد', 'bir', 'eins', 'wāḥid'),
    word('ikki', 'two', 'два', 'اثنان', 'iki', 'zwei', 'ithnān'),
    word('uch', 'three', 'три', 'ثلاثة', 'üç', 'drei', 'thalātha'),
    word('to‘rt', 'four', 'четыре', 'أربعة', 'dört', 'vier', 'arbaʿa'),
    word('besh', 'five', 'пять', 'خمسة', 'beş', 'fünf', 'khamsa'),
    word('olti', 'six', 'шесть', 'ستّة', 'altı', 'sechs', 'sitta'),
    word('yetti', 'seven', 'семь', 'سبعة', 'yedi', 'sieben', 'sabʿa'),
    word('sakkiz', 'eight', 'восемь', 'ثمانية', 'sekiz', 'acht', 'thamāniya')
  ]),
  group('apartment', 2, 'peach', names('Xonalar va uy jihozlari', 'Rooms and furnishings', 'Комнаты и обстановка', 'الغرف والأثاث', 'Odalar ve ev eşyaları', 'Räume und Einrichtung'), [
    word('xonadon', 'apartment', 'квартира', 'شقّة', 'daire', 'die Wohnung', 'shaqqa'),
    word('zal', 'living room', 'гостиная', 'غرفة الجلوس', 'oturma odası', 'das Wohnzimmer', 'ghurfat al-julūs'),
    word('yotoqxona', 'bedroom', 'спальня', 'غرفة النوم', 'yatak odası', 'das Schlafzimmer', 'ghurfat an-nawm'),
    word('hammom', 'bathroom', 'ванная комната', 'حمّام', 'banyo', 'das Badezimmer', 'ḥammām'),
    word('qavat', 'floor of a building', 'этаж', 'طابق', 'kat', 'das Stockwerk', 'ṭābiq'),
    word('zina', 'stairs', 'лестница', 'درج', 'merdiven', 'die Treppe', 'daraj'),
    word('devor', 'wall', 'стена', 'جدار', 'duvar', 'die Wand', 'jidār'),
    word('javon', 'shelf', 'полка', 'رفّ', 'raf', 'das Regalbrett', 'raff')
  ]),
  group('menu', 3, 'sand', names('Menyu', 'On the menu', 'В меню', 'قائمة الطعام', 'Menüde', 'Auf der Speisekarte'), [
    word('choy', 'tea', 'чай', 'شاي', 'çay', 'der Tee', 'shāy'),
    word('qahva', 'coffee', 'кофе', 'قهوة', 'kahve', 'der Kaffee', 'qahwa'),
    word('salat', 'salad', 'салат', 'سلطة', 'salata', 'der Salat', 'salaṭa'),
    word('tovuq go‘shti', 'chicken', 'курица', 'لحم الدجاج', 'tavuk eti', 'das Hähnchenfleisch', 'laḥm ad-dajāj'),
    word('baliq', 'fish', 'рыба', 'سمك', 'balık', 'der Fisch', 'samak'),
    word('shirinlik', 'dessert', 'десерт', 'حلوى', 'tatlı', 'die Nachspeise', 'ḥalwā'),
    word('shakar', 'sugar', 'сахар', 'سكّر', 'şeker', 'der Zucker', 'sukkar'),
    word('hisob', 'restaurant bill', 'счёт в ресторане', 'الحساب في المطعم', 'restoran hesabı', 'die Rechnung im Restaurant', 'al-ḥisāb fī al-maṭʿam')
  ]),
  group('days', 4, 'sky', names('Hafta kunlari', 'Days of the week', 'Дни недели', 'أيّام الأسبوع', 'Haftanın günleri', 'Wochentage'), [
    word('dushanba', 'Monday', 'понедельник', 'الاثنين', 'pazartesi', 'der Montag', 'al-ithnayn'),
    word('seshanba', 'Tuesday', 'вторник', 'الثلاثاء', 'salı', 'der Dienstag', 'ath-thulāthāʾ'),
    word('chorshanba', 'Wednesday', 'среда', 'الأربعاء', 'çarşamba', 'der Mittwoch', 'al-arbiʿāʾ'),
    word('payshanba', 'Thursday', 'четверг', 'الخميس', 'perşembe', 'der Donnerstag', 'al-khamīs'),
    word('juma', 'Friday', 'пятница', 'الجمعة', 'cuma', 'der Freitag', 'al-jumʿa'),
    word('shanba', 'Saturday', 'суббота', 'السبت', 'cumartesi', 'der Samstag', 'as-sabt'),
    word('yakshanba', 'Sunday', 'воскресенье', 'الأحد', 'pazar', 'der Sonntag', 'al-aḥad'),
    word('dam olish kunlari', 'the weekend', 'выходные', 'عطلة نهاية الأسبوع', 'hafta sonu', 'das Wochenende', 'ʿuṭlat nihāyat al-usbūʿ')
  ]),
  group('hotel', 5, 'lilac', names('Mehmonxona jihozlari va xizmatlari', 'Hotel facilities', 'Гостиница и удобства', 'مرافق الفندق', 'Otel olanakları', 'Im Hotel'), [
    word('bron', 'reservation', 'бронь', 'حجز', 'rezervasyon', 'die Reservierung', 'ḥajz'),
    word('qabul bo‘limi', 'reception desk', 'стойка регистрации', 'مكتب الاستقبال', 'resepsiyon', 'die Rezeption', 'maktab al-istiqbāl'),
    word('lift', 'elevator', 'лифт', 'مصعد', 'asansör', 'der Aufzug', 'miṣʿad'),
    word('xona kaliti', 'room key', 'ключ от номера', 'مفتاح الغرفة', 'oda anahtarı', 'der Zimmerschlüssel', 'miftāḥ al-ghurfa'),
    word('balkon', 'balcony', 'балкон', 'شرفة', 'balkon', 'der Balkon', 'shurfa'),
    word('sochiq', 'towel', 'полотенце', 'منشفة', 'havlu', 'das Handtuch', 'minshafa'),
    word('yostiq', 'pillow', 'подушка', 'وسادة', 'yastık', 'das Kissen', 'wisāda'),
    word('xonani bo‘shatish vaqti', 'checkout time', 'время выезда', 'وقت تسجيل المغادرة', 'çıkış saati', 'die Check-out-Zeit', 'waqt tasjīl al-mughādara')
  ]),
  group('comparison', 6, 'rose', names('Taqqoslash', 'Comparisons', 'Сравнения', 'المقارنات', 'Karşılaştırmalar', 'Vergleiche'), [
    word('arzon', 'cheap', 'дешёвый', 'رخيص', 'ucuz', 'günstig', 'rakhīṣ'),
    word('qimmat', 'expensive', 'дорогой', 'غالٍ', 'pahalı', 'teuer', 'ghālin'),
    word('tez', 'fast', 'быстрый', 'سريع', 'hızlı', 'schnell', 'sarīʿ'),
    word('sekin', 'slow', 'медленный', 'بطيء', 'yavaş', 'langsam', 'baṭīʾ'),
    word('qulay', 'convenient', 'удобный', 'مناسب', 'uygun', 'praktisch', 'munāsib'),
    word('ishonchli', 'reliable', 'надёжный', 'موثوق', 'güvenilir', 'zuverlässig', 'mawthūq'),
    word('yaqin', 'near', 'близкий', 'قريب', 'yakın', 'nah', 'qarīb'),
    word('uzoq', 'far', 'далёкий', 'بعيد', 'uzak', 'weit entfernt', 'baʿīd')
  ]),
  group('instructions', 7, 'mint', names('Yo‘riqnoma va hujjatlar', 'Instructions and documents', 'Инструкции и документы', 'التعليمات والوثائق', 'Talimatlar ve belgeler', 'Anleitungen und Unterlagen'), [
    word('anketa', 'form', 'анкета', 'استمارة', 'form', 'das Formular', 'istimāra'),
    word('imzo', 'signature', 'подпись', 'توقيع', 'imza', 'die Unterschrift', 'tawqīʿ'),
    word('muhr', 'stamp', 'печать', 'ختم', 'mühür', 'der Stempel', 'khatm'),
    word('ko‘rsatma', 'instruction', 'указание', 'تعليمات', 'talimat', 'die Anweisung', 'taʿlīmāt'),
    word('misol', 'example', 'пример', 'مثال', 'örnek', 'das Beispiel', 'mithāl'),
    word('qadam', 'step', 'шаг', 'خطوة', 'adım', 'der Schritt', 'khuṭwa'),
    word('hujjat', 'document', 'документ', 'وثيقة', 'belge', 'das Dokument', 'wathīqa'),
    word('nusxa', 'copy', 'копия', 'نسخة', 'kopya', 'die Kopie', 'nuskha')
  ]),
  group('decisions', 8, 'lilac', names('Qarorlar va rejalar', 'Decisions and plans', 'Решения и планы', 'القرارات والخطط', 'Kararlar ve planlar', 'Entscheidungen und Pläne'), [
    word('maqsad', 'goal', 'цель', 'هدف', 'hedef', 'das Ziel', 'hadaf'),
    word('ustuvor vazifa', 'priority', 'приоритет', 'أولويّة', 'öncelik', 'die Priorität', 'awlawiyya'),
    word('reja', 'plan', 'план', 'خطّة', 'plan', 'der Plan', 'khuṭṭa'),
    word('mas’uliyat', 'responsibility', 'ответственность', 'مسؤوليّة', 'sorumluluk', 'die Verantwortung', 'masʾūliyya'),
    word('qaror', 'decision', 'решение', 'قرار', 'karar', 'die Entscheidung', 'qarār'),
    word('xavf', 'risk', 'риск', 'مخاطرة', 'risk', 'das Risiko', 'mukhāṭara'),
    word('natija', 'result', 'результат', 'نتيجة', 'netice', 'das Ergebnis', 'natīja'),
    word('kelishuv', 'agreement', 'договорённость', 'اتّفاق', 'anlaşma', 'die Vereinbarung', 'ittifāq')
  ]),
  group('colors', 1, 'mint', names('Ranglar', 'Colors', 'Цвета', 'الألوان', 'Renkler', 'Farben'), [
    word('qizil', 'red', 'красный', 'أحمر', 'kırmızı', 'rot', 'aḥmar'),
    word('ko‘k', 'blue', 'синий', 'أزرق', 'mavi', 'blau', 'azraq'),
    word('yashil', 'green', 'зелёный', 'أخضر', 'yeşil', 'grün', 'akhḍar'),
    word('sariq', 'yellow', 'жёлтый', 'أصفر', 'sarı', 'gelb', 'aṣfar'),
    word('oq', 'white', 'белый', 'أبيض', 'beyaz', 'weiß', 'abyaḍ'),
    word('qora', 'black', 'чёрный', 'أسود', 'siyah', 'schwarz', 'aswad')
  ]),
  group('outdoors', 2, 'sky', names('Sayr va tabiat', 'Walks and nature', 'Прогулки и природа', 'التنزّه والطبيعة', 'Yürüyüş ve doğa', 'Spaziergänge und Natur'), [
    word('daryo', 'river', 'река', 'نهر', 'nehir', 'der Fluss', 'nahr'),
    word('yo‘lak', 'path', 'тропинка', 'ممرّ', 'patika', 'der Weg', 'mamarr'),
    word('daraxt', 'tree', 'дерево', 'شجرة', 'ağaç', 'der Baum', 'shajara'),
    word('soya', 'shade', 'тень', 'ظلّ', 'gölge', 'der Schatten', 'ẓill'),
    word('skameyka', 'bench', 'скамейка', 'مقعد', 'bank', 'die Parkbank', 'maqʿad'),
    word('soyabon', 'umbrella', 'зонт', 'مظلّة', 'şemsiye', 'der Regenschirm', 'miẓalla')
  ]),
  group('bakery', 3, 'peach', names('Non va pishiriqlar', 'Bread and pastries', 'Хлеб и выпечка', 'الخبز والمعجّنات', 'Ekmek ve hamur işleri', 'Brot und Gebäck'), [
    word('baget', 'baguette', 'багет', 'باغيت', 'baget ekmek', 'das Baguette', 'bāghīt'),
    word('bulochka', 'bread roll', 'булочка', 'لفافة خبز', 'küçük ekmek', 'das Brötchen', 'lafāfatu khubz'),
    word('kruassan', 'croissant', 'круассан', 'كرواسون', 'kruvasan', 'das Croissant', 'krūwāsūn'),
    word('butun donli non', 'whole-grain bread', 'цельнозерновой хлеб', 'خبز الحبوب الكاملة', 'tam tahıllı ekmek', 'das Vollkornbrot', 'khubzu al-ḥubūbi al-kāmila'),
    word('nonvoyxona', 'bakery', 'пекарня', 'مخبز', 'fırın', 'die Bäckerei', 'makhbaz'),
    word('qog‘oz paket', 'paper bag', 'бумажный пакет', 'كيس ورقيّ', 'kâğıt poşet', 'die Papiertüte', 'kīs waraqī')
  ]),
  group('library', 4, 'sky', names('Kitob olish va qaytarish', 'Borrowing books', 'Как брать и возвращать книги', 'استعارة الكتب وإعادتها', 'Kitap ödünç alma', 'Bücher ausleihen'), [
    word('kutubxona guvohnomasi', 'library card', 'читательский билет', 'بطاقة المكتبة', 'kütüphane kartı', 'der Bibliotheksausweis', 'biṭāqatu al-maktaba'),
    word('qaytarish sanasi', 'due date', 'срок возврата', 'موعد الإعادة', 'son iade tarihi', 'der Rückgabetermin', 'mawʿidu al-iʿāda'),
    word('kitob qaytarish qutisi', 'book return box', 'ящик для возврата книг', 'صندوق إعادة الكتب', 'kitap iade kutusu', 'die Bücherrückgabebox', 'ṣundūqu iʿādati al-kutub'),
    word('lug‘at', 'dictionary', 'словарь', 'قاموس', 'sözlük', 'das Wörterbuch', 'qāmūs'),
    word('olib turmoq', 'to borrow', 'брать на время', 'استعار', 'ödünç almak', 'ausleihen', 'istaʿāra'),
    word('olib turish muddatini uzaytirmoq', 'to renew a loan', 'продлить срок пользования книгой', 'مدّد مدّة الاستعارة', 'ödünç alma süresini uzatmak', 'die Ausleihe verlängern', 'maddada muddata al-istiʿāra')
  ]),
  group('coach', 5, 'sand', names('Avtovokzalda', 'At the coach station', 'На автовокзале', 'في محطّة الحافلات', 'Otogarda', 'Am Busbahnhof'), [
    word('avtovokzal', 'coach station', 'автовокзал', 'محطّة الحافلات', 'otogar', 'der Busbahnhof', 'maḥaṭṭatu al-ḥāfilāt'),
    word('tezkor qatnov', 'express service', 'экспресс-рейс', 'رحلة سريعة', 'ekspres sefer', 'die Expressverbindung', 'riḥla sarīʿa'),
    word('jo‘nash vaqti', 'departure time', 'время отправления', 'موعد الانطلاق', 'kalkış saati', 'die Abfahrtszeit', 'mawʿidu al-inṭilāq'),
    word('yetib kelish vaqti', 'arrival time', 'время прибытия', 'موعد الوصول', 'varış saati', 'die Ankunftszeit', 'mawʿidu al-wuṣūl'),
    word('qo‘shimcha haq', 'extra fee', 'доплата', 'رسوم إضافيّة', 'ek ücret', 'die Zusatzgebühr', 'rusūm iḍāfiyya'),
    word('yuk bo‘lmasi', 'luggage compartment', 'багажное отделение', 'حجرة الأمتعة', 'bagaj bölmesi', 'der Gepäckraum', 'ḥujratu al-amtiʿa')
  ]),
  group('garden', 6, 'mint', names('Bog‘dorchilik', 'Gardening', 'Садоводство', 'البستنة', 'Bahçecilik', 'Gärtnern'), [
    word('urug‘', 'seed', 'семя', 'بذرة', 'tohum', 'der Samen', 'badhra'),
    word('ko‘chat', 'seedling', 'сеянец', 'شتلة', 'fide', 'der Setzling', 'shatla'),
    word('tuproq', 'soil', 'почва', 'تربة', 'toprak', 'die Erde', 'turba'),
    word('namlik', 'moisture', 'влажность', 'رطوبة', 'nem', 'die Feuchtigkeit', 'ruṭūba'),
    word('hosil', 'harvest', 'урожай', 'محصول', 'hasat', 'die Ernte', 'maḥṣūl'),
    word('sug‘ormoq', 'to water', 'поливать', 'سقى', 'sulamak', 'gießen', 'saqā')
  ]),
  group('repairs', 7, 'sky', names('Nosozliklar va ta’mir', 'Faults and repairs', 'Неисправности и ремонт', 'الأعطال والإصلاحات', 'Arızalar ve onarımlar', 'Defekte und Reparaturen'), [
    word('jo‘mrak', 'tap', 'кран', 'صنبور', 'musluk', 'der Wasserhahn', 'ṣunbūr'),
    word('suv sizishi', 'water leak', 'утечка воды', 'تسرّب ماء', 'su sızıntısı', 'das Wasserleck', 'tasarrubu māʾ'),
    word('ehtiyot qism', 'spare part', 'запчасть', 'قطعة غيار', 'yedek parça', 'das Ersatzteil', 'qiṭʿatu ghiyār'),
    word('taxminiy narx', 'cost estimate', 'предварительная оценка стоимости', 'تقدير التكلفة', 'tahmini maliyet', 'der Kostenvoranschlag', 'taqdīru at-taklifa'),
    word('ta’mirlash', 'repair', 'ремонт', 'إصلاح', 'onarım', 'die Reparatur', 'iṣlāḥ'),
    word('nosozlik haqida xabar bermoq', 'to report a fault', 'сообщить о неисправности', 'أبلغ عن عطل', 'arıza bildirmek', 'einen Defekt melden', 'ablagha ʿan ʿuṭl')
  ]),
  group('meetings', 8, 'lilac', names('Kun tartibi va keyingi qadamlar', 'Agendas and next steps', 'Повестка и следующие шаги', 'جدول الأعمال والخطوات التالية', 'Gündem ve sonraki adımlar', 'Tagesordnung und nächste Schritte'), [
    word('kun tartibi', 'agenda', 'повестка дня', 'جدول الأعمال', 'gündem', 'die Tagesordnung', 'jadwalu al-aʿmāl'),
    word('yig‘ilish bayonnomasi', 'meeting minutes', 'протокол совещания', 'محضر الاجتماع', 'toplantı tutanağı', 'das Sitzungsprotokoll', 'maḥḍaru al-ijtimāʿ'),
    word('taklif', 'proposal', 'предложение', 'مقترح', 'öneri', 'der Vorschlag', 'muqtaraḥ'),
    word('ochiq masala', 'unresolved issue', 'открытый вопрос', 'مسألة عالقة', 'çözüme kavuşmamış konu', 'die offene Frage', 'masʾala ʿāliqa'),
    word('oxirgi muddat', 'deadline', 'крайний срок', 'موعد نهائيّ', 'son tarih', 'die Frist', 'mawʿid nihāʾī'),
    word('keyingi qadam', 'next step', 'следующий шаг', 'الخطوة التالية', 'sonraki adım', 'der nächste Schritt', 'al-khuṭwatu at-tāliya')
  ])
];

wordGroups.push(...moreWordGroups);

export const words = wordGroups.flatMap(group => group.words);
