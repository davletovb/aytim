import { text as t, phrase as w, vocabulary as group } from './catalog.mjs';

export const moreWordGroups = [
  group('everyday-objects', 1, t('Kundalik buyumlar', 'Everyday objects', 'Обычные предметы', 'أشياء يوميّة', 'Günlük eşyalar', 'Alltagsgegenstände'), [
    w('sumka', 'bag', 'сумка', 'حقيبة', 'çanta', 'die Tasche', 'ḥaqība'),
    w('ruchka', 'pen', 'ручка', 'قلم', 'kalem', 'der Stift', 'qalam'),
    w('o‘chirg‘ich', 'eraser', 'ластик', 'ممحاة', 'silgi', 'der Radiergummi', 'mimḥāh'),
    w('chizg‘ich', 'ruler', 'линейка', 'مسطرة', 'cetvel', 'das Lineal', 'misṭara'),
    w('qog‘oz', 'paper', 'бумага', 'ورق', 'kâğıt', 'das Papier', 'waraq'),
    w('quti', 'box', 'коробка', 'صندوق', 'kutu', 'die Schachtel', 'ṣundūq'),
    w('soat', 'clock', 'часы', 'ساعة', 'saat', 'die Uhr', 'sāʿa'),
    w('ko‘zoynak', 'glasses', 'очки', 'نظّارة', 'gözlük', 'die Brille', 'naẓẓāra')
  ]),
  group('basic-positions', 1, t('Joylashuv', 'Positions', 'Расположение', 'المواقع', 'Konumlar', 'Positionen'), [
    w('ustida', 'on top of', 'на', 'فوق', 'üstünde', 'oben auf', 'fawq'),
    w('ostida', 'under', 'под', 'تحت', 'altında', 'unter', 'taḥt'),
    w('ichida', 'inside', 'внутри', 'داخل', 'içinde', 'in', 'dākhil'),
    w('tashqarida', 'outside', 'снаружи', 'خارج', 'dışarıda', 'draußen', 'khārij'),
    w('yonida', 'next to', 'рядом с', 'بجانب', 'yanında', 'neben', 'bi-jānib'),
    w('oldida', 'in front of', 'перед', 'أمام', 'önünde', 'vor', 'amām'),
    w('orqasida', 'behind', 'позади', 'خلف', 'arkasında', 'hinter', 'khalf'),
    w('orasida', 'between', 'между', 'بين', 'arasında', 'zwischen', 'bayn')
  ]),
  group('household-chores', 2, t('Uy ishlari', 'Household chores', 'Домашние дела', 'أعمال منزليّة', 'Ev işleri', 'Hausarbeiten'), [
    w('supurmoq', 'to sweep', 'подметать', 'كنس', 'süpürmek', 'kehren', 'kanasa'),
    w('yuvmoq', 'to wash', 'мыть', 'غسل', 'yıkamak', 'waschen', 'ghasala'),
    w('quritmoq', 'to dry', 'сушить', 'جفّف', 'kurutmak', 'trocknen', 'jaffafa'),
    w('dazmollamoq', 'to iron', 'гладить утюгом', 'كوى', 'ütülemek', 'bügeln', 'kawā'),
    w('yig‘ishtirmoq', 'to tidy up', 'прибирать', 'رتّب', 'toplamak', 'aufräumen', 'rattaba'),
    w('chang artmoq', 'to dust', 'вытирать пыль', 'مسح الغبار', 'toz almak', 'Staub wischen', 'masaḥa al-ghubār'),
    w('changyutgich', 'vacuum cleaner', 'пылесос', 'مكنسة كهربائيّة', 'elektrikli süpürge', 'der Staubsauger', 'miknasa kahrabāʾiyya'),
    w('kir yuvish mashinasi', 'washing machine', 'стиральная машина', 'غسّالة', 'çamaşır makinesi', 'die Waschmaschine', 'ghassāla')
  ]),
  group('body-and-rest', 2, t('Tana va dam olish', 'Body and rest', 'Тело и отдых', 'الجسم والراحة', 'Vücut ve dinlenme', 'Körper und Erholung'), [
    w('bosh', 'head', 'голова', 'رأس', 'baş', 'der Kopf', 'raʾs'),
    w('qo‘l', 'hand', 'рука', 'يد', 'el', 'die Hand', 'yad'),
    w('oyoq panjasi', 'foot', 'ступня', 'قدم', 'ayak', 'der Fuß', 'qadam'),
    w('uyqu', 'sleep', 'сон', 'نوم', 'uyku', 'der Schlaf', 'nawm'),
    w('tanaffus', 'break', 'перерыв', 'استراحة', 'mola', 'die Pause', 'istirāḥa'),
    w('tirsak', 'elbow', 'локоть', 'مرفق اليد', 'dirsek', 'der Ellenbogen', 'mirfaq al-yad'),
    w('tizza', 'knee', 'колено', 'ركبة', 'diz', 'das Knie', 'rukba'),
    w('tetik', 'refreshed', 'бодрый', 'نشيط', 'dinç', 'erholt', 'nashīṭ')
  ]),
  group('ingredients', 3, t('Masalliqlar', 'Ingredients', 'Ингредиенты', 'المكوّنات', 'Malzemeler', 'Zutaten'), [
    w('un', 'flour', 'мука', 'دقيق', 'un', 'das Mehl', 'daqīq'),
    w('yasmiq', 'lentils', 'чечевица', 'عدس', 'mercimek', 'die Linsen', 'ʿadas'),
    w('sariyog‘', 'butter', 'сливочное масло', 'زبدة', 'tereyağı', 'die Butter', 'zubda'),
    w('tuz', 'salt', 'соль', 'ملح', 'tuz', 'das Salz', 'milḥ'),
    w('murch', 'black pepper', 'чёрный перец', 'فلفل أسود', 'karabiber', 'der schwarze Pfeffer', 'filfil aswad'),
    w('piyoz', 'onion', 'луковица', 'بصلة', 'soğan', 'die Zwiebel', 'baṣala'),
    w('sarimsoq', 'garlic', 'чеснок', 'ثوم', 'sarımsak', 'der Knoblauch', 'thūm'),
    w('o‘simlik yog‘i', 'vegetable oil', 'растительное масло', 'زيت نباتيّ', 'sıvı yağ', 'das Pflanzenöl', 'zayt nabātī')
  ]),
  group('at-the-table', 3, t('Dasturxon atrofida', 'At the table', 'За столом', 'على المائدة', 'Sofrada', 'Am Tisch'), [
    w('sanchqi', 'fork', 'вилка', 'شوكة', 'çatal', 'die Gabel', 'shawka'),
    w('pichoq', 'knife', 'нож', 'سكّين', 'bıçak', 'das Messer', 'sikkīn'),
    w('qoshiq', 'spoon', 'ложка', 'ملعقة', 'kaşık', 'der Löffel', 'milʿaqa'),
    w('salfetka', 'napkin', 'салфетка', 'منديل مائدة', 'peçete', 'die Serviette', 'mindīl māʾida'),
    w('porsiya', 'portion', 'порция', 'حصّة', 'porsiyon', 'die Portion', 'ḥiṣṣa'),
    w('sous', 'sauce', 'соус', 'صلصة', 'sos', 'die Soße', 'ṣalṣa'),
    w('nordon', 'sour', 'кислый', 'حامض', 'ekşi', 'sauer', 'ḥāmiḍ'),
    w('sho‘r', 'salty', 'солёный', 'مالح', 'tuzlu', 'salzig', 'māliḥ')
  ]),
  group('public-services', 4, t('Jamoat xizmatlari', 'Public services', 'Общественные службы', 'الخدمات العامّة', 'Kamu hizmetleri', 'Öffentliche Dienste'), [
    w('o‘t o‘chirish bo‘limi', 'fire station', 'пожарная часть', 'مركز الإطفاء', 'itfaiye istasyonu', 'die Feuerwache', 'markaz al-iṭfāʾ'),
    w('shifoxona', 'hospital', 'больница', 'مستشفى', 'hastane', 'das Krankenhaus', 'mustashfā'),
    w('bank', 'bank', 'банк', 'مصرف', 'banka', 'die Bank', 'maṣrif'),
    w('bankomat', 'cash machine', 'банкомат', 'صرّاف آليّ', 'bankamatik', 'der Geldautomat', 'ṣarrāf ālī'),
    w('politsiya bo‘limi', 'police station', 'полицейский участок', 'مركز شرطة', 'polis merkezi', 'die Polizeiwache', 'markaz shurṭa'),
    w('navbat', 'queue', 'очередь', 'طابور', 'sıra', 'die Warteschlange', 'ṭābūr'),
    w('xizmat ko‘rsatish oynasi', 'service counter', 'окно обслуживания', 'شبّاك الخدمة', 'hizmet gişesi', 'der Serviceschalter', 'shubbāk al-khidma'),
    w('ish vaqti', 'opening hours', 'часы работы', 'ساعات العمل', 'çalışma saatleri', 'die Öffnungszeiten', 'sāʿāt al-ʿamal')
  ]),
  group('scheduling', 4, t('Vaqtni kelishish', 'Scheduling', 'Согласование времени', 'تنظيم المواعيد', 'Zamanlama', 'Terminplanung'), [
    w('kechikish', 'delay', 'задержка', 'تأخير', 'gecikme', 'die Verspätung', 'taʾkhīr'),
    w('tasdiqlamoq', 'to confirm', 'подтвердить', 'أكّد', 'teyit etmek', 'bestätigen', 'akkada'),
    w('bekor qilmoq', 'to cancel', 'отменить', 'ألغى', 'iptal etmek', 'absagen', 'alghā'),
    w('keyinga qoldirmoq', 'to postpone', 'отложить', 'أجّل', 'ertelemek', 'verschieben', 'ajjala'),
    w('oldinroq', 'earlier', 'раньше', 'في وقت أبكر', 'daha erken', 'früher', 'fī waqtin abkar'),
    w('vaqtida', 'on time', 'вовремя', 'في الموعد', 'zamanında', 'pünktlich', 'fī al-mawʿid'),
    w('uchrashuv', 'meeting', 'встреча', 'لقاء', 'buluşma', 'das Treffen', 'liqāʾ'),
    w('jadval', 'schedule', 'расписание', 'جدول', 'program', 'der Zeitplan', 'jadwal')
  ]),
  group('airport', 5, t('Aeroport', 'Airport', 'Аэропорт', 'المطار', 'Havaalanı', 'Flughafen'), [
    w('bortga chiqish taloni', 'boarding pass', 'посадочный талон', 'بطاقة صعود', 'biniş kartı', 'die Bordkarte', 'biṭāqat ṣuʿūd'),
    w('chiqish eshigi', 'boarding gate', 'выход на посадку', 'بوّابة الصعود', 'biniş kapısı', 'das Abfluggate', 'bawwābat aṣ-ṣuʿūd'),
    w('uchib ketish', 'departure', 'вылет', 'مغادرة', 'kalkış', 'der Abflug', 'mughādara'),
    w('uchib kelish', 'arrival', 'прилёт', 'وصول', 'varış', 'die Ankunft', 'wuṣūl'),
    w('bojxona', 'customs', 'таможня', 'جمارك', 'gümrük', 'der Zoll', 'jamārik'),
    w('qo‘l yuki', 'hand luggage', 'ручная кладь', 'أمتعة يدويّة', 'el bagajı', 'das Handgepäck', 'amtiʿa yadawiyya'),
    w('yuk lentasi', 'baggage belt', 'багажная лента', 'حزام الأمتعة', 'bagaj bandı', 'das Gepäckband', 'ḥizām al-amtiʿa'),
    w('almashib o‘tish', 'connection', 'пересадка', 'رحلة ربط', 'aktarma', 'der Anschluss', 'riḥlat rabṭ')
  ]),
  group('booking-conditions', 5, t('Bron shartlari', 'Booking conditions', 'Условия бронирования', 'شروط الحجز', 'Rezervasyon koşulları', 'Buchungsbedingungen'), [
    w('qaytariladigan', 'refundable', 'возвратный', 'قابل للاسترداد', 'iade edilebilir', 'erstattbar', 'qābil li-l-istirdād'),
    w('qaytarilmaydigan', 'non-refundable', 'невозвратный', 'غير قابل للاسترداد', 'iade edilemez', 'nicht erstattbar', 'ghayr qābil li-l-istirdād'),
    w('bekor qilish to‘lovi', 'cancellation fee', 'плата за отмену', 'رسوم الإلغاء', 'iptal ücreti', 'die Stornogebühr', 'rusūm al-ilghāʾ'),
    w('mavjudlik', 'availability', 'наличие', 'توفّر', 'müsaitlik', 'die Verfügbarkeit', 'tawaffur'),
    w('bron tasdig‘i', 'booking confirmation', 'подтверждение бронирования', 'تأكيد الحجز', 'rezervasyon onayı', 'die Buchungsbestätigung', 'taʾkīd al-ḥajz'),
    w('borish-kelish chiptasi', 'return ticket', 'билет туда и обратно', 'تذكرة ذهاب وعودة', 'gidiş dönüş bileti', 'die Hin- und Rückfahrkarte', 'tadhkirat dhahāb wa-ʿawda'),
    w('bir tomonga chipta', 'one-way ticket', 'билет в один конец', 'تذكرة ذهاب فقط', 'tek yön bileti', 'die einfache Fahrkarte', 'tadhkirat dhahāb faqaṭ'),
    w('joyni band qilmoq', 'to reserve a seat', 'забронировать место', 'حجز مقعدًا', 'koltuk ayırtmak', 'einen Platz reservieren', 'ḥajaza maqʿadan')
  ]),
  group('memories-and-change', 6, t('Xotira va o‘zgarish', 'Memory and change', 'Память и перемены', 'الذاكرة والتغيّر', 'Anılar ve değişim', 'Erinnerung und Wandel'), [
    w('bolalik', 'childhood', 'детство', 'طفولة', 'çocukluk', 'die Kindheit', 'ṭufūla'),
    w('xotira', 'memory', 'воспоминание', 'ذكرى', 'anı', 'die Erinnerung', 'dhikrā'),
    w('odat', 'habit', 'привычка', 'عادة', 'alışkanlık', 'die Gewohnheit', 'ʿāda'),
    w('o‘tmish', 'past', 'прошлое', 'ماضٍ', 'geçmiş', 'die Vergangenheit', 'māḍī'),
    w('o‘zgarish', 'change', 'перемена', 'تغيّر', 'değişim', 'die Veränderung', 'taghayyur'),
    w('eslamoq', 'to remember', 'вспоминать', 'تذكّر', 'hatırlamak', 'sich erinnern', 'tadhakkara'),
    w('sog‘inmoq', 'to miss someone', 'скучать по кому-либо', 'اشتاق إلى شخص', 'birini özlemek', 'jemanden vermissen', 'ishtāqa ilā shakhs'),
    w('saqlab qolmoq', 'to preserve', 'сохранять', 'حافظ على', 'korumak', 'bewahren', 'ḥāfaẓa ʿalā')
  ]),
  group('news-and-sources', 6, t('Xabar va manbalar', 'News and sources', 'Новости и источники', 'الأخبار والمصادر', 'Haberler ve kaynaklar', 'Nachrichten und Quellen'), [
    w('sarlavha', 'headline', 'заголовок', 'عنوان رئيسيّ', 'başlık', 'die Schlagzeile', 'ʿunwān raʾīsī'),
    w('manba', 'source', 'источник', 'مصدر', 'kaynak', 'die Quelle', 'maṣdar'),
    w('muxbir', 'reporter', 'корреспондент', 'مراسل', 'muhabir', 'der Reporter', 'murāsil'),
    w('guvoh', 'witness', 'свидетель', 'شاهد', 'tanık', 'der Zeuge', 'shāhid'),
    w('tafsilot', 'detail', 'подробность', 'تفصيل', 'ayrıntı', 'das Detail', 'tafṣīl'),
    w('e’lon', 'announcement', 'объявление', 'إعلان', 'duyuru', 'die Ankündigung', 'iʿlān'),
    w('rasmiy', 'official', 'официальный', 'رسميّ', 'resmî', 'offiziell', 'rasmī'),
    w('tasdiqlanmagan', 'unverified', 'непроверенный', 'غير متحقّق منه', 'doğrulanmamış', 'ungeprüft', 'ghayr mutaḥaqqaq minh')
  ]),
  group('formal-correspondence', 7, t('Rasmiy yozishmalar', 'Formal correspondence', 'Деловая переписка', 'المراسلات الرسميّة', 'Resmî yazışmalar', 'Formelle Korrespondenz'), [
    w('ilova', 'attachment', 'вложение', 'مرفق', 'ek', 'der Anhang', 'murfaq'),
    w('tasdiq', 'confirmation', 'подтверждение', 'تأكيد', 'teyit', 'die Bestätigung', 'taʾkīd'),
    w('murojaat', 'formal request', 'обращение', 'طلب رسميّ', 'başvuru', 'die Anfrage', 'ṭalab rasmī'),
    w('shikoyat', 'complaint', 'жалоба', 'شكوى', 'şikâyet', 'die Beschwerde', 'shakwā'),
    w('pulni qaytarish', 'refund', 'возврат денег', 'استرداد المبلغ', 'ücret iadesi', 'die Rückerstattung', 'istirdād al-mablagh'),
    w('yozma javob', 'written response', 'письменный ответ', 'ردّ مكتوب', 'yazılı yanıt', 'die schriftliche Antwort', 'radd maktūb'),
    w('ish kuni', 'working day', 'рабочий день', 'يوم عمل', 'iş günü', 'der Werktag', 'yawm ʿamal'),
    w('aniqlashtirmoq', 'to clarify', 'уточнять', 'وضّح', 'açıklığa kavuşturmak', 'klären', 'waḍḍaḥa')
  ]),
  group('learning-tools', 7, t('O‘rganish vositalari', 'Learning tools', 'Учебные инструменты', 'أدوات التعلّم', 'Öğrenme araçları', 'Lernwerkzeuge'), [
    w('takrorlash', 'revision', 'повторение', 'مراجعة', 'tekrar', 'die Wiederholung', 'murājaʿa'),
    w('diqqat', 'attention', 'внимание', 'انتباه', 'dikkat', 'die Aufmerksamkeit', 'intibāh'),
    w('izchillik', 'consistency', 'последовательность', 'مواظبة', 'istikrar', 'die Beständigkeit', 'muwāẓaba'),
    w('taraqqiyot', 'progress', 'прогресс', 'تقدّم', 'ilerleme', 'der Fortschritt', 'taqaddum'),
    w('talaffuz', 'pronunciation', 'произношение', 'نطق', 'telaffuz', 'die Aussprache', 'nuṭq'),
    w('ravonlik', 'fluency', 'беглость речи', 'طلاقة', 'akıcılık', 'die Sprachflüssigkeit', 'ṭalāqa'),
    w('xato', 'mistake', 'ошибка', 'خطأ', 'hata', 'der Fehler', 'khaṭaʾ'),
    w('mashq qilmoq', 'to practice', 'практиковаться', 'تدرّب', 'pratik yapmak', 'üben', 'tadarraba')
  ]),
  group('evidence-and-reasoning', 8, t('Dalil va mulohaza', 'Evidence and reasoning', 'Доказательства и рассуждения', 'الأدلّة والاستدلال', 'Kanıt ve akıl yürütme', 'Belege und Argumentation'), [
    w('dalil', 'evidence', 'доказательство', 'دليل', 'kanıt', 'der Beleg', 'dalīl'),
    w('taxmin', 'assumption', 'предположение', 'افتراض', 'varsayım', 'die Annahme', 'iftirāḍ'),
    w('xulosa', 'conclusion', 'вывод', 'استنتاج', 'sonuç', 'die Schlussfolgerung', 'istintāj'),
    w('cheklov', 'limitation', 'ограничение', 'قيد', 'sınırlılık', 'die Einschränkung', 'qayd'),
    w('tanlanma', 'sample', 'выборка', 'عيّنة', 'örneklem', 'die Stichprobe', 'ʿayyina'),
    w('muqobil izoh', 'alternative explanation', 'альтернативное объяснение', 'تفسير بديل', 'alternatif açıklama', 'die alternative Erklärung', 'tafsīr badīl'),
    w('noaniqlik', 'uncertainty', 'неопределённость', 'عدم يقين', 'belirsizlik', 'die Unsicherheit', 'ʿadam yaqīn'),
    w('sababiy bog‘liqlik', 'causation', 'причинно-следственная связь', 'علاقة سببيّة', 'nedensellik', 'die Kausalität', 'ʿalāqa sababiyya')
  ]),
  group('negotiation', 8, t('Muzokara', 'Negotiation', 'Переговоры', 'التفاوض', 'Müzakere', 'Verhandlung'), [
    w('murosa', 'compromise', 'компромисс', 'حلّ وسط', 'uzlaşma', 'der Kompromiss', 'ḥall wasaṭ'),
    w('o‘zaro manfaat', 'mutual benefit', 'взаимная выгода', 'منفعة متبادلة', 'karşılıklı yarar', 'der gegenseitige Nutzen', 'manfaʿa mutabādala'),
    w('shart', 'condition', 'условие', 'شرط', 'koşul', 'die Bedingung', 'sharṭ'),
    w('ko‘lam', 'scope', 'объём работ', 'نطاق', 'kapsam', 'der Umfang', 'niṭāq'),
    w('yon berish', 'concession', 'уступка', 'تنازل', 'taviz', 'das Zugeständnis', 'tanāzul'),
    w('rozilik', 'consent', 'согласие', 'موافقة', 'rıza', 'die Zustimmung', 'muwāfaqa'),
    w('majburiyat', 'commitment', 'обязательство', 'التزام', 'taahhüt', 'die Verpflichtung', 'iltizām'),
    w('muvozanat', 'balance', 'равновесие', 'توازن', 'denge', 'das Gleichgewicht', 'tawāzun')
  ])
];
