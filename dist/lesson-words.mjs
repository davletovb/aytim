import { text as t, phrase as w, vocabulary as group } from './catalog.mjs';

// Word groups for lessons whose topic no other group of their level covered.
// Each word keeps a stable ID (group and position), so never reorder a group.
export const lessonWordGroups = [
  group('greeting-words', 1, t('Salomlashish', 'Greetings', 'Приветствия', 'التحيّات', 'Selamlaşma', 'Begrüßungen'), [
    w('salom', 'hello', 'привет', 'مرحبًا', 'merhaba', 'hallo', 'marḥaban'),
    w('xayr', 'goodbye', 'до свидания', 'مع السلامة', 'hoşça kalın', 'auf Wiedersehen', 'maʿa as-salāma'),
    w('ism', 'name', 'имя', 'اسم', 'isim', 'der Name', 'ism'),
    w('tong', 'morning', 'утро', 'صباح', 'sabah', 'der Morgen', 'ṣabāḥ'),
    w('oqshom', 'evening', 'вечер', 'مساء', 'akşam', 'der Abend', 'masāʾ'),
    w('yaxshi', 'good', 'хороший', 'جيّد', 'iyi', 'gut', 'jayyid')
  ]),
  group('polite-words', 1, t('Odob so‘zlari', 'Polite words', 'Вежливые слова', 'كلمات مهذّبة', 'Kibar sözler', 'Höfliche Wörter'), [
    w('iltimos', 'please', 'пожалуйста', 'من فضلك', 'lütfen', 'bitte', 'min faḍlik'),
    w('rahmat', 'thank you', 'спасибо', 'شكرًا', 'teşekkürler', 'danke', 'shukran'),
    w('uzr', 'sorry', 'простите', 'عذرًا', 'pardon', 'Entschuldigung', 'ʿudhran'),
    w('yordam', 'help', 'помощь', 'مساعدة', 'yardım', 'die Hilfe', 'musāʿada'),
    w('lahza', 'moment', 'момент', 'لحظة', 'an', 'der Moment', 'laḥẓa'),
    w('xushmuomala', 'polite', 'вежливый', 'مهذّب', 'kibar', 'höflich', 'muhadhdhab')
  ]),
  group('relatives', 2, t('Qarindoshlar', 'Relatives', 'Родственники', 'الأقارب', 'Akrabalar', 'Verwandte'), [
    w('aka', 'older brother', 'старший брат', 'أخ أكبر', 'ağabey', 'der ältere Bruder', 'akh akbar'),
    w('opa', 'older sister', 'старшая сестра', 'أخت كبرى', 'abla', 'die ältere Schwester', 'ukht kubrā'),
    w('buvi', 'grandmother', 'бабушка', 'جدّة', 'büyükanne', 'die Großmutter', 'jadda'),
    w('bobo', 'grandfather', 'дедушка', 'جدّ', 'büyükbaba', 'der Großvater', 'jadd'),
    w('ota-ona', 'parents', 'родители', 'والدان', 'ebeveynler', 'die Eltern', 'wālidān'),
    w('o‘g‘il', 'son', 'сын', 'ابن', 'oğul', 'der Sohn', 'ibn'),
    w('qiz', 'daughter', 'дочь', 'ابنة', 'kız', 'die Tochter', 'ibna'),
    w('uka', 'younger brother', 'младший брат', 'أخ أصغر', 'küçük erkek kardeş', 'der jüngere Bruder', 'akh aṣghar'),
    w('singil', 'younger sister', 'младшая сестра', 'أخت صغرى', 'küçük kız kardeş', 'die jüngere Schwester', 'ukht ṣughrā'),
    w('er', 'husband', 'муж', 'زوج', 'koca', 'der Ehemann', 'zawj'),
    w('xotin', 'wife', 'жена', 'زوجة', 'hanım', 'die Ehefrau', 'zawja')
  ]),
  group('hobbies', 2, t('Qiziqishlar', 'Hobbies', 'Увлечения', 'الهوايات', 'Hobiler', 'Hobbys'), [
    w('musiqa', 'music', 'музыка', 'موسيقى', 'müzik', 'die Musik', 'mūsīqā'),
    w('gitara', 'guitar', 'гитара', 'غيتار', 'gitar', 'die Gitarre', 'ghītār'),
    w('film', 'movie', 'фильм', 'فيلم', 'film', 'der Film', 'fīlm'),
    w('suzish', 'swimming', 'плавание', 'سباحة', 'yüzme', 'das Schwimmen', 'sibāḥa'),
    w('rasm chizish', 'drawing', 'рисование', 'رسم', 'çizim', 'das Zeichnen', 'rasm'),
    w('sport', 'sport', 'спорт', 'رياضة', 'spor', 'der Sport', 'riyāḍa')
  ]),
  group('ordering', 3, t('Taom tanlash', 'Choosing a dish', 'Выбор блюда', 'اختيار الطبق', 'Yemek seçimi', 'Ein Gericht wählen'), [
    w('taom', 'dish', 'блюдо', 'طبق', 'yemek', 'das Gericht', 'ṭabaq'),
    w('gazak', 'appetizer', 'закуска', 'مقبّلات', 'başlangıç', 'die Vorspeise', 'muqabbilāt'),
    w('asosiy taom', 'main course', 'основное блюдо', 'طبق رئيسيّ', 'ana yemek', 'das Hauptgericht', 'ṭabaq raʾīsī'),
    w('sabzavotlar', 'vegetables', 'овощи', 'خضروات', 'sebzeler', 'das Gemüse', 'khuḍrawāt'),
    w('tavsiya qilmoq', 'to recommend', 'рекомендовать', 'نصح', 'tavsiye etmek', 'empfehlen', 'naṣaḥa'),
    w('ofitsiant', 'waiter', 'официант', 'نادل', 'garson', 'der Kellner', 'nādil')
  ]),
  group('dietary', 3, t('Parhez va allergiya', 'Diet and allergies', 'Диета и аллергия', 'الحمية والحساسية', 'Diyet ve alerji', 'Ernährung und Allergien'), [
    w('allergiya', 'allergy', 'аллергия', 'حساسيّة', 'alerji', 'die Allergie', 'ḥassāsiyya'),
    w('yong‘oq', 'nuts', 'орехи', 'مكسّرات', 'kuruyemiş', 'die Nüsse', 'mukassarāt'),
    w('go‘sht', 'meat', 'мясо', 'لحم', 'et', 'das Fleisch', 'laḥm'),
    w('vegetarian', 'vegetarian', 'вегетарианский', 'نباتيّ', 'vejetaryen', 'vegetarisch', 'nabātī'),
    w('achchiq', 'spicy', 'острый', 'حارّ المذاق', 'acı', 'scharf', 'ḥārr al-madhāq'),
    w('sut mahsulotlari', 'dairy products', 'молочные продукты', 'منتجات الألبان', 'süt ürünleri', 'die Milchprodukte', 'muntajāt al-albān')
  ]),
  group('takeaway-words', 3, t('Olib ketish', 'Takeout', 'Еда навынос', 'الطلبات الخارجيّة', 'Paket servis', 'Essen zum Mitnehmen'), [
    w('olib ketiladigan taom', 'takeout', 'еда навынос', 'طلب سفريّ', 'paket olarak alınan yemek', 'das Essen zum Mitnehmen', 'ṭalab safarī'),
    w('idish', 'container', 'контейнер', 'علبة', 'kap', 'der Behälter', 'ʿulba'),
    w('qopqoq', 'lid', 'крышка', 'غطاء', 'kapak', 'der Deckel', 'ghiṭāʾ'),
    w('qadoq', 'packaging', 'упаковка', 'تغليف', 'ambalaj', 'die Verpackung', 'taghlīf'),
    w('kutish vaqti', 'waiting time', 'время ожидания', 'وقت الانتظار', 'bekleme süresi', 'die Wartezeit', 'waqt al-intiẓār'),
    w('buyurtma bermoq', 'to order', 'заказывать', 'طلب', 'sipariş vermek', 'bestellen', 'ṭalaba')
  ]),
  group('appointments', 4, t('Qabul vaqtlari', 'Appointments', 'Запись на приём', 'المواعيد', 'Randevular', 'Termine'), [
    w('qabul vaqti', 'appointment', 'запись на приём', 'موعد', 'randevu', 'der Termin', 'mawʿid'),
    w('klinika', 'clinic', 'поликлиника', 'عيادة', 'klinik', 'die Arztpraxis', 'ʿiyāda'),
    w('band', 'busy', 'занятый', 'مشغول', 'meşgul', 'beschäftigt', 'mashghūl'),
    w('taqvim', 'calendar', 'календарь', 'تقويم', 'takvim', 'der Kalender', 'taqwīm'),
    w('eslatma', 'reminder', 'напоминание', 'تذكير', 'hatırlatma', 'die Terminerinnerung', 'tadhkīr'),
    w('boshqa vaqtga ko‘chirmoq', 'to reschedule', 'переносить', 'أعاد تحديد الموعد', 'yeniden planlamak', 'umplanen', 'aʿāda taḥdīd al-mawʿid')
  ]),
  group('phone-words', 4, t('Telefonda', 'On the phone', 'По телефону', 'على الهاتف', 'Telefonda', 'Am Telefon'), [
    w('qo‘ng‘iroq', 'call', 'звонок', 'مكالمة', 'arama', 'der Anruf', 'mukālama'),
    w('xabar', 'message', 'сообщение', 'رسالة', 'mesaj', 'die Nachricht', 'risāla'),
    w('qayta qo‘ng‘iroq qilmoq', 'to call back', 'перезванивать', 'عاود الاتصال', 'geri aramak', 'zurückrufen', 'ʿāwada al-ittiṣāl'),
    w('signal', 'signal', 'сигнал', 'إشارة', 'sinyal', 'das Signal', 'ishāra'),
    w('go‘shakni qo‘ymoq', 'to hang up', 'вешать трубку', 'أنهى المكالمة', 'telefonu kapatmak', 'auflegen', 'anhā al-mukālama'),
    w('ovozli pochta', 'voicemail', 'голосовая почта', 'بريد صوتيّ', 'sesli mesaj', 'die Mailbox', 'barīd ṣawtī')
  ]),
  group('building-words', 4, t('Bino ichida', 'Inside a building', 'Внутри здания', 'داخل المبنى', 'Binanın içinde', 'Im Gebäude'), [
    w('bo‘lim', 'department', 'отдел', 'قسم', 'bölüm', 'die Abteilung', 'qism'),
    w('koridor', 'corridor', 'коридор', 'ممرّ داخليّ', 'koridor', 'der Flur', 'mamarr dākhilī'),
    w('kirish', 'entrance', 'вход', 'مدخل', 'giriş', 'der Eingang', 'madkhal'),
    w('chiqish', 'exit', 'выход', 'مخرج', 'çıkış', 'der Ausgang', 'makhraj'),
    w('xona raqami', 'room number', 'номер кабинета', 'رقم الغرفة', 'oda numarası', 'die Raumnummer', 'raqm al-ghurfa'),
    w('ko‘rsatkich', 'sign', 'указатель', 'لافتة', 'tabela', 'das Schild', 'lāfita')
  ]),
  group('post-words', 5, t('Pochtada', 'At the post office', 'На почте', 'في مكتب البريد', 'Postanede', 'Auf der Post'), [
    w('jo‘natma', 'package', 'посылка', 'طرد', 'koli', 'das Paket', 'ṭard'),
    w('konvert', 'envelope', 'конверт', 'ظرف', 'zarf', 'der Umschlag', 'ẓarf'),
    w('pochta xarajati', 'postage', 'почтовый сбор', 'أجرة البريد', 'posta ücreti', 'das Porto', 'ujrat al-barīd'),
    w('kuzatuv raqami', 'tracking number', 'трек-номер', 'رقم التتبّع', 'takip numarası', 'die Sendungsnummer', 'raqm at-tatabbuʿ'),
    w('qabul qiluvchi', 'recipient', 'получатель', 'المستلم', 'alıcı', 'der Empfänger', 'al-mustalim'),
    w('jo‘natuvchi', 'sender', 'отправитель', 'المرسل', 'gönderen', 'der Absender', 'al-mursil')
  ]),
  group('payment', 5, t('To‘lov', 'Paying', 'Оплата', 'الدفع', 'Ödeme', 'Bezahlen'), [
    w('naqd pul', 'cash', 'наличные', 'نقد', 'nakit', 'das Bargeld', 'naqd'),
    w('bank kartasi', 'bank card', 'банковская карта', 'بطاقة مصرفيّة', 'banka kartı', 'die Bankkarte', 'biṭāqa maṣrifiyya'),
    w('chek', 'receipt', 'чек', 'إيصال', 'fiş', 'der Kassenbon', 'īṣāl'),
    w('banknot', 'banknote', 'купюра', 'ورقة نقديّة', 'banknot', 'der Geldschein', 'waraqa naqdiyya'),
    w('soliq', 'tax', 'налог', 'ضريبة', 'vergi', 'die Steuer', 'ḍarība'),
    w('tanga', 'coin', 'монета', 'عملة معدنيّة', 'madeni para', 'die Münze', 'ʿumla maʿdaniyya')
  ]),
  group('opinion-words', 6, t('Fikr va munosabat', 'Opinions', 'Мнения', 'الآراء', 'Görüşler', 'Meinungen'), [
    w('fikr', 'opinion', 'мнение', 'رأي', 'görüş', 'die Meinung', 'raʾy'),
    w('rozi bo‘lmoq', 'to agree', 'соглашаться', 'وافق', 'katılmak', 'zustimmen', 'wāfaqa'),
    w('e’tiroz bildirmoq', 'to disagree', 'не соглашаться', 'خالف', 'katılmamak', 'widersprechen', 'khālafa'),
    w('nuqtayi nazar', 'point of view', 'точка зрения', 'وجهة نظر', 'bakış açısı', 'der Standpunkt', 'wijhat naẓar'),
    w('g‘oya', 'idea', 'идея', 'فكرة', 'fikir', 'die Idee', 'fikra'),
    w('adolatli', 'fair', 'справедливый', 'عادل', 'adil', 'fair', 'ʿādil')
  ]),
  group('settling-in', 6, t('Ko‘chib o‘tish va moslashish', 'Moving and settling in', 'Переезд и привыкание', 'الانتقال والتأقلم', 'Taşınma ve alışma', 'Umzug und Eingewöhnung'), [
    w('ko‘chib o‘tmoq', 'to move', 'переезжать', 'انتقل', 'taşınmak', 'umziehen', 'intaqala'),
    w('ko‘nikmoq', 'to get used to', 'привыкать', 'اعتاد', 'alışmak', 'sich gewöhnen', 'iʿtāda'),
    w('mahalla', 'neighborhood', 'район', 'حيّ', 'mahalle', 'das Viertel', 'ḥayy'),
    w('yangi kelgan', 'newcomer', 'новичок', 'قادم جديد', 'yeni gelen', 'der Neuankömmling', 'qādim jadīd'),
    w('kundalik tartib', 'daily routine', 'распорядок дня', 'الروتين اليوميّ', 'günlük düzen', 'der Tagesablauf', 'ar-rūtīn al-yawmī'),
    w('farq', 'difference', 'разница', 'فرق', 'fark', 'der Unterschied', 'farq')
  ]),
  group('character', 6, t('Xarakter va qiyofa', 'Character and appearance', 'Характер и внешность', 'الطباع والمظهر', 'Karakter ve görünüş', 'Charakter und Aussehen'), [
    w('baland bo‘yli', 'tall', 'высокий', 'طويل', 'uzun boylu', 'groß gewachsen', 'ṭawīl'),
    w('uyatchan', 'shy', 'застенчивый', 'خجول', 'utangaç', 'schüchtern', 'khajūl'),
    w('do‘stona', 'friendly', 'дружелюбный', 'ودود', 'arkadaş canlısı', 'freundlich', 'wadūd'),
    w('kulgili', 'funny', 'забавный', 'مضحك', 'komik', 'lustig', 'muḍḥik'),
    w('mehribon', 'kind', 'добрый', 'لطيف', 'nazik', 'nett', 'laṭīf'),
    w('jiddiy', 'serious', 'серьёзный', 'جادّ', 'ciddi', 'ernst', 'jādd')
  ]),
  group('problem-words', 7, t('Muammo va yechim', 'Problems and solutions', 'Проблемы и решения', 'المشكلات والحلول', 'Sorunlar ve çözümler', 'Probleme und Lösungen'), [
    w('muammo', 'problem', 'проблема', 'مشكلة', 'sorun', 'das Problem', 'mushkila'),
    w('muqobil variant', 'alternative', 'альтернатива', 'بديل', 'alternatif', 'die Alternative', 'badīl'),
    w('tushunmovchilik', 'misunderstanding', 'недоразумение', 'سوء تفاهم', 'yanlış anlama', 'das Missverständnis', 'sūʾ tafāhum'),
    w('shoshilinch', 'urgent', 'срочный', 'عاجل', 'acil', 'dringend', 'ʿājil'),
    w('iloji boricha tez', 'as soon as possible', 'как можно скорее', 'في أقرب وقت ممكن', 'en kısa sürede', 'so bald wie möglich', 'fī aqrab waqt mumkin'),
    w('vaziyat', 'situation', 'ситуация', 'وضع', 'durum', 'die Lage', 'waḍʿ')
  ]),
  group('delivery-words', 7, t('Yetkazib berish', 'Deliveries', 'Доставка', 'التوصيل', 'Teslimat', 'Lieferungen'), [
    w('yetkazib berish', 'delivery', 'доставка', 'توصيل', 'teslimat', 'die Lieferung', 'tawṣīl'),
    w('kuryer', 'courier', 'курьер', 'مندوب التوصيل', 'kurye', 'der Kurier', 'mandūb at-tawṣīl'),
    w('almashtirish', 'replacement', 'замена', 'استبدال', 'ürün değişimi', 'der Ersatz', 'istibdāl'),
    w('qabul qilmoq', 'to receive', 'получать', 'استلم', 'teslim almak', 'erhalten', 'istalama'),
    w('yo‘qolgan', 'lost', 'потерянный', 'مفقود', 'kayıp', 'verloren', 'mafqūd'),
    w('shikastlangan', 'damaged', 'повреждённый', 'تالف', 'hasarlı', 'beschädigt', 'tālif')
  ]),
  group('apology-words', 7, t('Uzr va tuzatish', 'Apologies', 'Извинения', 'الاعتذار', 'Özür', 'Entschuldigungen'), [
    w('uzr so‘ramoq', 'to apologize', 'извиняться', 'اعتذر', 'özür dilemek', 'sich entschuldigen', 'iʿtadhara'),
    w('kechirim', 'forgiveness', 'прощение', 'مسامحة', 'af', 'die Verzeihung', 'musāmaḥa'),
    w('o‘rnini to‘ldirmoq', 'to make up for', 'заглаживать вину', 'عوّض', 'telafi etmek', 'wiedergutmachen', 'ʿawwaḍa'),
    w('tuzatmoq', 'to correct', 'исправлять', 'صحّح', 'düzeltmek', 'korrigieren', 'ṣaḥḥaḥa'),
    w('noqulaylik', 'inconvenience', 'неудобство', 'إزعاج', 'rahatsızlık', 'die Unannehmlichkeit', 'izʿāj'),
    w('oldindan', 'in advance', 'заранее', 'مسبقًا', 'önceden', 'im Voraus', 'musbaqan')
  ]),
  group('messaging', 8, t('Yozishmalar', 'Messaging', 'Переписка', 'المراسلة', 'Mesajlaşma', 'Nachrichten schreiben'), [
    w('javob bermoq', 'to reply', 'отвечать', 'ردّ', 'yanıtlamak', 'antworten', 'radda'),
    w('havola', 'link', 'ссылка', 'رابط', 'bağlantı', 'der Link', 'rābiṭ'),
    w('fayl', 'file', 'файл', 'ملفّ', 'dosya', 'die Datei', 'milaff'),
    w('xat mavzusi', 'subject line', 'тема письма', 'عنوان الرسالة', 'konu satırı', 'die Betreffzeile', 'ʿunwān ar-risāla'),
    w('o‘qilmagan', 'unread', 'непрочитанный', 'غير مقروء', 'okunmamış', 'ungelesen', 'ghayr maqrūʾ'),
    w('guruh chati', 'group chat', 'групповой чат', 'محادثة جماعيّة', 'grup sohbeti', 'der Gruppenchat', 'muḥādatha jamāʿiyya')
  ]),
  group('feedback-words', 8, t('Fikr-mulohaza', 'Feedback', 'Обратная связь', 'الملاحظات', 'Geri bildirim', 'Rückmeldung'), [
    w('fikr-mulohaza', 'feedback', 'обратная связь', 'ملاحظات', 'geri bildirim', 'die Rückmeldung', 'mulāḥaẓāt'),
    w('kuchli tomon', 'strength', 'сильная сторона', 'نقطة قوّة', 'güçlü yön', 'die Stärke', 'nuqṭat quwwa'),
    w('zaif tomon', 'weakness', 'слабая сторона', 'نقطة ضعف', 'zayıf yön', 'die Schwäche', 'nuqṭat ḍaʿf'),
    w('tavsiya', 'suggestion', 'рекомендация', 'اقتراح', 'tavsiye', 'die Anregung', 'iqtirāḥ'),
    w('tushunarli', 'clear', 'понятный', 'واضح', 'anlaşılır', 'verständlich', 'wāḍiḥ'),
    w('qayta ishlangan', 'revised', 'доработанный', 'منقّح', 'gözden geçirilmiş', 'überarbeitet', 'munaqqaḥ')
  ]),
  group('updates', 8, t('Ish holati', 'Status updates', 'Ход работы', 'تحديثات الحالة', 'Durum güncellemesi', 'Statusberichte'), [
    w('yangilanish', 'update', 'обновление', 'تحديث', 'güncelleme', 'das Update', 'taḥdīth'),
    w('reja bo‘yicha', 'on schedule', 'по графику', 'وفق الجدول', 'planlandığı gibi', 'im Zeitplan', 'wifq al-jadwal'),
    w('jarayonda', 'in progress', 'в процессе', 'قيد التنفيذ', 'devam ediyor', 'in Arbeit', 'qayd at-tanfīdh'),
    w('to‘siq', 'obstacle', 'препятствие', 'عائق', 'engel', 'das Hindernis', 'ʿāʾiq'),
    w('muhim bosqich', 'milestone', 'ключевой этап', 'مرحلة رئيسيّة', 'kilometre taşı', 'der Meilenstein', 'marḥala raʾīsiyya'),
    w('qisqacha', 'in short', 'вкратце', 'باختصار', 'kısaca', 'kurz gesagt', 'bikhtiṣār')
  ]),
  group('pronouns', 1, t('Olmoshlar', 'Pronouns', 'Местоимения', 'الضمائر', 'Zamirler', 'Pronomen'), [
    w('men', 'I', 'я', 'أنا', 'ben', 'ich', 'anā'),
    w('sen / siz', 'you', 'ты / вы', 'أنتَ / أنتِ', 'sen / siz', 'du / Sie', 'anta / anti'),
    w('u', 'he / she', 'он / она', 'هو / هي', 'o', 'er / sie', 'huwa / hiya'),
    w('biz', 'we', 'мы', 'نحن', 'biz', 'wir', 'naḥnu'),
    w('ular', 'they', 'они', 'هم', 'onlar', 'sie', 'hum')
  ]),
  group('basic-adjectives', 1, t('Asosiy sifatlar', 'Basic adjectives', 'Основные прилагательные', 'صفات أساسيّة', 'Temel sıfatlar', 'Grundlegende Adjektive'), [
    w('katta', 'big', 'большой', 'كبير', 'büyük', 'groß', 'kabīr'),
    w('kichik', 'small', 'маленький', 'صغير', 'küçük', 'klein', 'ṣaghīr'),
    w('yangi', 'new', 'новый', 'جديد', 'yeni', 'neu', 'jadīd'),
    w('eski', 'old', 'старый', 'قديم', 'eski', 'alt', 'qadīm'),
    w('toza', 'clean', 'чистый', 'نظيف', 'temiz', 'sauber', 'naẓīf'),
    w('og‘ir', 'heavy', 'тяжёлый', 'ثقيل', 'ağır', 'schwer', 'thaqīl')
  ]),
  group('personal-items', 1, t('Shaxsiy buyumlar', 'Personal items', 'Личные вещи', 'الأغراض الشخصيّة', 'Kişisel eşyalar', 'Persönliche Gegenstände'), [
    w('telefon', 'phone', 'телефон', 'هاتف', 'telefon', 'das Telefon', 'hātif'),
    w('surat', 'photo', 'фотография', 'صورة', 'fotoğraf', 'das Foto', 'ṣūra'),
    w('ryukzak', 'backpack', 'рюкзак', 'حقيبة ظهر', 'sırt çantası', 'der Rucksack', 'ḥaqībat ẓahr'),
    w('hamyon', 'wallet', 'кошелёк', 'محفظة', 'cüzdan', 'die Geldbörse', 'miḥfaẓa'),
    w('piyola', 'cup', 'чашка', 'كوب', 'fincan', 'die Tasse', 'kūb')
  ]),
  group('months', 2, t('Yil oylari', 'Months of the year', 'Месяцы года', 'أشهر السنة', 'Yılın ayları', 'Monate des Jahres'), [
    w('yanvar', 'January', 'январь', 'يناير', 'ocak', 'der Januar', 'yanāyir'),
    w('fevral', 'February', 'февраль', 'فبراير', 'şubat', 'der Februar', 'fibrāyir'),
    w('mart', 'March', 'март', 'مارس', 'mart', 'der März', 'māris'),
    w('aprel', 'April', 'апрель', 'أبريل', 'nisan', 'der April', 'abrīl'),
    w('may', 'May', 'май', 'مايو', 'mayıs', 'der Mai', 'māyū'),
    w('iyun', 'June', 'июнь', 'يونيو', 'haziran', 'der Juni', 'yūnyū'),
    w('iyul', 'July', 'июль', 'يوليو', 'temmuz', 'der Juli', 'yūlyū'),
    w('avgust', 'August', 'август', 'أغسطس', 'ağustos', 'der August', 'aghusṭus'),
    w('sentabr', 'September', 'сентябрь', 'سبتمبر', 'eylül', 'der September', 'sibtambir'),
    w('oktabr', 'October', 'октябрь', 'أكتوبر', 'ekim', 'der Oktober', 'uktūbar'),
    w('noyabr', 'November', 'ноябрь', 'نوفمبر', 'kasım', 'der November', 'nūfambir'),
    w('dekabr', 'December', 'декабрь', 'ديسمبر', 'aralık', 'der Dezember', 'dīsambir')
  ]),
  group('seasons-and-time', 2, t('Fasllar va vaqt', 'Seasons and time', 'Времена года и время', 'الفصول والوقت', 'Mevsimler ve zaman', 'Jahreszeiten und Zeit'), [
    w('bahor', 'spring', 'весна', 'ربيع', 'ilkbahar', 'der Frühling', 'rabīʿ'),
    w('yoz', 'summer', 'лето', 'صيف', 'yaz', 'der Sommer', 'ṣayf'),
    w('kuz', 'fall', 'осень', 'خريف', 'sonbahar', 'der Herbst', 'kharīf'),
    w('qish', 'winter', 'зима', 'شتاء', 'kış', 'der Winter', 'shitāʾ'),
    w('yil', 'year', 'год', 'سنة', 'yıl', 'das Jahr', 'sana'),
    w('daqiqa', 'minute', 'минута', 'دقيقة', 'dakika', 'die Minute', 'daqīqa')
  ]),
  group('plans-and-frequency', 4, t('Rejalar va takroriylik', 'Plans and frequency', 'Планы и частота', 'الخطط والتكرار', 'Planlar ve sıklık', 'Pläne und Häufigkeit'), [
    w('tez orada', 'soon', 'скоро', 'قريبًا', 'yakında', 'bald', 'qarīban'),
    w('bo‘sh vaqt', 'free time', 'свободное время', 'وقت الفراغ', 'boş zaman', 'die Freizeit', 'waqt al-farāgh'),
    w('birga', 'together', 'вместе', 'معًا', 'birlikte', 'zusammen', 'maʿan'),
    w('doim', 'always', 'всегда', 'دائمًا', 'her zaman', 'immer', 'dāʾiman'),
    w('ba’zan', 'sometimes', 'иногда', 'أحيانًا', 'bazen', 'manchmal', 'aḥyānan'),
    w('tez-tez', 'often', 'часто', 'غالبًا', 'sık sık', 'oft', 'ghāliban'),
    w('hech qachon', 'never', 'никогда', 'أبدًا', 'asla', 'nie', 'abadan'),
    w('allaqachon', 'already', 'уже', 'بالفعل', 'zaten', 'schon', 'bi-l-fiʿl')
  ]),
  group('ordinals', 4, t('Tartib sonlar', 'Ordinal numbers', 'Порядковые числительные', 'الأعداد الترتيبيّة', 'Sıra sayıları', 'Ordnungszahlen'), [
    w('birinchi', 'first', 'первый', 'أوّل', 'birinci', 'erste', 'awwal'),
    w('ikkinchi', 'second', 'второй', 'ثانٍ', 'ikinci', 'zweite', 'thānin'),
    w('uchinchi', 'third', 'третий', 'ثالث', 'üçüncü', 'dritte', 'thālith'),
    w('to‘rtinchi', 'fourth', 'четвёртый', 'رابع', 'dördüncü', 'vierte', 'rābiʿ'),
    w('beshinchi', 'fifth', 'пятый', 'خامس', 'beşinci', 'fünfte', 'khāmis'),
    w('oxirgi', 'last', 'последний', 'أخير', 'son', 'letzte', 'akhīr')
  ])
];

// The word groups each lesson teaches, by topic. Every word group of a level
// belongs to exactly one lesson of that level (test/lesson-words.test.mjs).
export const lessonTopics = {
  // Level 1
  greetings: ['greeting-words'], introductions: ['people', 'pronouns'], numbers: ['numbers'], 'classroom-phrases': ['classroom'],
  colors: ['colors', 'basic-adjectives'], 'polite-requests': ['polite-words', 'actions'], belongings: ['everyday-objects', 'personal-items'],
  'where-things-are': ['basic-positions'],
  // Level 2
  family: ['relatives'], routine: ['days', 'months'], apartment: ['home', 'apartment'], 'free-time': ['hobbies', 'linking-basics'],
  outdoors: ['outdoors', 'weather'], 'home-chores': ['household-chores'], wellbeing: ['mood', 'body-and-rest'], 'telling-time': ['time', 'seasons-and-time'],
  // Level 3
  cafe: ['menu'], market: ['food'], meal: ['ordering'], cooking: ['ingredients'], bakery: ['bakery'],
  'dietary-needs': ['dietary'], 'hosting-meal': ['at-the-table'], takeaway: ['takeaway-words'],
  // Level 4
  directions: ['city'], plans: ['plans-and-frequency'], appointment: ['appointments'], 'phone-call': ['phone-words'],
  'library-visit': ['library'], 'city-services': ['public-services'], 'changing-plans': ['scheduling'],
  'inside-a-building': ['building-words', 'ordinals'],
  // Level 5
  shopping: ['clothes'], travel: ['travel'], hotel: ['hotel'], 'post-office': ['post-words'], 'coach-trip': ['coach'],
  'airport-help': ['airport'], 'travel-options': ['booking-conditions'], 'paying-for-things': ['payment'],
  // Level 6
  story: ['feelings'], opinions: ['opinion-words'], compare: ['comparison'], 'describing-change': ['settling-in'],
  'community-garden': ['garden'], memories: ['memories-and-change'], 'news-reports': ['news-and-sources'],
  'describing-people': ['character'],
  // Level 7
  problems: ['problem-words'], reflection: ['connectors'], instructions: ['instructions'], 'delivery-problem': ['delivery-words'],
  maintenance: ['repairs'], 'formal-requests': ['formal-correspondence'], 'learning-strategies': ['learning-tools'],
  apologising: ['apology-words'],
  // Level 8
  work: ['work'], messages: ['messaging'], decisions: ['decisions'], feedback: ['feedback-words'],
  'meeting-summary': ['meetings'], 'evaluating-evidence': ['evidence-and-reasoning'], 'negotiating-priorities': ['negotiation'],
  'short-update': ['updates']
};
