// A few short notes on the language being learned, shown in Lug'at. Each note
// is written in all six interface languages, because it explains the target
// language to whoever is reading it. These describe how the language works;
// they are not a grammar course.
function note(uz, en, ru, ar, tr, de) {
  return { uz, en, ru, ar, tr, de };
}

export const languageNotes = {
  en: [
    note(
      'Ingliz tilida ko‘pchilik birlikdagi otlar oldidan a yoki the qo‘yiladi: a book, the book.',
      'English puts a or the in front of most singular nouns: a book, the book.',
      'В английском перед большинством существительных в единственном числе стоит a или the: a book, the book.',
      'تسبق أداة a أو the معظم الأسماء المفردة في الإنجليزية: a book, the book.',
      'İngilizcede çoğu tekil ismin önüne a ya da the gelir: a book, the book.',
      'Im Englischen steht vor den meisten Substantiven im Singular a oder the: a book, the book.'),
    note(
      'So‘z tartibi — ega, kesim, to‘ldiruvchi; u deyarli o‘zgarmaydi: I see the dog.',
      'The order is subject, verb, object, and it hardly ever changes: I see the dog.',
      'Порядок слов — подлежащее, сказуемое, дополнение, и он почти не меняется: I see the dog.',
      'الترتيب هو الفاعل ثم الفعل ثم المفعول، ولا يكاد يتغيّر: I see the dog.',
      'Sıralama özne, yüklem, nesne biçimindedir ve neredeyse hiç değişmez: I see the dog.',
      'Die Reihenfolge ist Subjekt, Verb, Objekt und ändert sich kaum: I see the dog.'),
    note(
      'Otlarda grammatik jins yo‘q, shuning uchun the hamma ot oldida bir xil.',
      'Nouns have no gender, so the is the same in front of every one of them.',
      'У существительных нет рода, поэтому the одинаково перед любым из них.',
      'لا جنس نحويّ للأسماء، لذا تبقى the نفسها أمامها جميعًا.',
      'İsimlerin dilbilgisel cinsiyeti yoktur, bu yüzden the hepsinin önünde aynıdır.',
      'Substantive haben kein Geschlecht, daher steht vor allen dasselbe the.'),
    note(
      'Ko‘p savollar boshida do, does yoki did keladi: Do you have time?',
      'Most questions need do, does or did at the front: Do you have time?',
      'В большинстве вопросов в начале нужен do, does или did: Do you have time?',
      'تحتاج معظم الأسئلة إلى do أو does أو did في البداية: Do you have time?',
      'Çoğu soru başta do, does ya da did ister: Do you have time?',
      'Die meisten Fragen brauchen am Anfang do, does oder did: Do you have time?'),
    note(
      'Hamma uchun bitta you bor; xushmuomalalik please va could kabi so‘zlar orqali bildiriladi.',
      'There is one you for everyone; politeness comes from words like please and could.',
      'You одно для всех; вежливость выражается словами вроде please и could.',
      'هناك you واحدة للجميع، والتهذيب يأتي من كلمات مثل please وcould.',
      'Herkes için tek bir you vardır; nezaket please ve could gibi sözcüklerle sağlanır.',
      'Es gibt nur ein you für alle; Höflichkeit entsteht durch Wörter wie please und could.'),
  ],
  uz: [
    note(
      'O‘zbek tilida alohida so‘zlar o‘rniga qo‘shimchalar qo‘shiladi: uy, uyda, uyimda.',
      'Uzbek adds endings where other languages use separate words: uy (house), uyda (in the house), uyimda (in my house).',
      'В узбекском вместо отдельных слов добавляются окончания: uy (дом), uyda (в доме), uyimda (в моём доме).',
      'تضيف الأوزبكية لواحق بدل الكلمات المنفصلة: uy (بيت)، uyda (في البيت)، uyimda (في بيتي).',
      'Özbekçe ayrı sözcükler yerine ek kullanır: uy (ev), uyda (evde), uyimda (evimde).',
      'Usbekisch hängt Endungen an, wo andere Sprachen eigene Wörter nutzen: uy (Haus), uyda (im Haus), uyimda (in meinem Haus).'),
    note(
      'Kesim gap oxirida keladi: Men kitob o‘qiyman.',
      'The verb comes at the end: Men kitob o‘qiyman — I book read.',
      'Глагол стоит в конце: Men kitob o‘qiyman — «я книгу читаю».',
      'يأتي الفعل في آخر الجملة: Men kitob o‘qiyman — «أنا كتابًا أقرأ».',
      'Yüklem sonda gelir: Men kitob o‘qiyman — «ben kitap okuyorum».',
      'Das Verb steht am Ende: Men kitob o‘qiyman – „ich Buch lese“.'),
    note(
      'Grammatik jins ham, a yoki the kabi artikl ham yo‘q.',
      'There is no grammatical gender and no word for a or the.',
      'Нет ни грамматического рода, ни артиклей вроде a и the.',
      'لا يوجد جنس نحويّ ولا أداة تعريف أو تنكير.',
      'Dilbilgisel cinsiyet de a ya da the gibi bir tanımlık da yoktur.',
      'Es gibt kein grammatisches Geschlecht und keine Artikel wie a oder the.'),
    note(
      'Siz — hurmat va ko‘plik shakli; sen yaqinlar bilan ishlatiladi. Bu kursda siz qo‘llanadi.',
      'Siz is polite and also plural; sen is for family and close friends. This course uses siz.',
      'Siz — вежливая форма и множественное число; sen — для близких. В этом курсе используется siz.',
      'siz صيغة مهذّبة وجمع أيضًا، وsen للمقرّبين. يستخدم هذا المساق siz.',
      'Siz hem kibar hem çoğul biçimdir; sen yakınlar içindir. Bu kurs siz kullanır.',
      'Siz ist höflich und zugleich Plural, sen für Vertraute. Dieser Kurs verwendet siz.'),
    note(
      'O‘ va g‘ alohida harflar; ulardagi belgi imloning bir qismi.',
      'O‘ and g‘ are letters in their own right, and the mark after them is part of the spelling.',
      'O‘ и g‘ — самостоятельные буквы, и знак при них входит в написание.',
      '‏O‘ وg‘ حرفان مستقلّان، والعلامة التي تتبعهما جزء من الإملاء.',
      'O‘ ve g‘ başlı başına birer harftir; üzerlerindeki işaret yazımın parçasıdır.',
      'O‘ und g‘ sind eigene Buchstaben; das Zeichen dahinter gehört zur Schreibung.'),
  ],
  ru: [
    note(
      'Rus tilida a yoki the kabi artikllar yo‘q.',
      'Russian has no words for a or the.',
      'В русском нет артиклей вроде a и the.',
      'لا توجد في الروسية أدوات مثل a أو the.',
      'Rusçada a ya da the gibi tanımlıklar yoktur.',
      'Russisch hat keine Artikel wie a oder the.'),
    note(
      'So‘zning gapdagi vazifasiga qarab qo‘shimchasi o‘zgaradi: книга to‘ldiruvchi bo‘lganda книгу bo‘ladi.',
      'Endings change with the job a word does in the sentence: книга becomes книгу as an object.',
      'Окончание меняется в зависимости от роли слова: книга в роли дополнения — книгу.',
      'تتغيّر النهاية بحسب وظيفة الكلمة في الجملة: книга تصير книгу حين تكون مفعولًا.',
      'Sözcüğün cümledeki görevine göre eki değişir: nesne olunca книга, книгу olur.',
      'Die Endung richtet sich nach der Rolle im Satz: книга wird als Objekt zu книгу.'),
    note(
      'Har bir ot erkak, ayol yoki o‘rta jinsda; sifat va o‘tgan zamon fe’li unga moslashadi.',
      'Every noun is masculine, feminine or neuter, and adjectives and past-tense verbs follow it.',
      'Каждое существительное мужского, женского или среднего рода, и прилагательные и глаголы в прошедшем времени согласуются с ним.',
      'كلّ اسم مذكّر أو مؤنّث أو محايد، وتتبعه الصفات وأفعال الماضي.',
      'Her isim eril, dişil ya da nötrdür; sıfatlar ve geçmiş zaman fiilleri buna uyar.',
      'Jedes Substantiv ist männlich, weiblich oder sächlich; Adjektive und Verben im Präteritum richten sich danach.'),
    note(
      'Вы — hurmat va ko‘plik shakli; ты yaqinlar bilan ishlatiladi. Bu kursda вы qo‘llanadi.',
      'Вы is polite and also plural; ты is for family and close friends. This course uses вы.',
      'Вы — вежливая форма и множественное число; ты — для близких. В этом курсе используется вы.',
      'вы صيغة مهذّبة وجمع أيضًا، وты للمقرّبين. يستخدم هذا المساق вы.',
      'Вы hem kibar hem çoğul biçimdir; ты yakınlar içindir. Bu kurs вы kullanır.',
      'Вы ist höflich und zugleich Plural, ты für Vertraute. Dieser Kurs verwendet вы.'),
    note(
      'Ko‘p fe’llar juft bo‘ladi: biri davom etayotgan ish uchun, ikkinchisi tugagan ish uchun.',
      'Most verbs come in a pair: one for an action going on, one for an action finished.',
      'Большинство глаголов образуют пару: один — для действия в процессе, другой — для завершённого.',
      'تأتي معظم الأفعال في زوج: فعل لعمل جارٍ وآخر لعمل منتهٍ.',
      'Çoğu fiil çift hâlinde gelir: biri süren iş, öteki bitmiş iş için.',
      'Die meisten Verben bilden ein Paar: eines für einen laufenden, eines für einen abgeschlossenen Vorgang.'),
  ],
  ar: [
    note(
      'Kundalik yozuvda qisqa unlilar yozilmaydi, shuning uchun har bir ibora yonida o‘qish yordami bor.',
      'Everyday writing leaves the short vowels out, which is why every phrase here has a reading aid.',
      'В обычном письме краткие гласные не пишутся — поэтому у каждой фразы здесь есть подсказка для чтения.',
      'تُحذف الحركات القصيرة في الكتابة اليومية، ولذلك تجد مع كلّ عبارة هنا مساعدة للقراءة.',
      'Günlük yazıda kısa ünlüler yazılmaz; bu yüzden buradaki her ifadenin yanında okuma yardımı var.',
      'Im Alltag werden die kurzen Vokale nicht geschrieben – deshalb steht bei jedem Satz hier eine Lesehilfe.'),
    note(
      'Arab yozuvi o‘ngdan chapga yoziladi va harf so‘zdagi o‘rniga qarab shaklini o‘zgartiradi.',
      'Arabic runs from right to left, and a letter changes shape depending on where it stands in the word.',
      'Арабское письмо идёт справа налево, и буква меняет форму в зависимости от места в слове.',
      'تُكتب العربية من اليمين إلى اليسار، ويتغيّر شكل الحرف بحسب موضعه في الكلمة.',
      'Arapça sağdan sola yazılır ve bir harf, sözcükteki yerine göre biçim değiştirir.',
      'Arabisch läuft von rechts nach links, und ein Buchstabe ändert seine Form je nach Stelle im Wort.'),
    note(
      'الـ (al-) — aniqlik artikli; u otning oldiga qo‘shib yoziladi.',
      'الـ (al-) is the word for the, and it is written joined to the front of the noun.',
      'الـ (al-) — определённый артикль, он пишется слитно перед существительным.',
      'الـ أداة التعريف، وتُكتب موصولة بأوّل الاسم.',
      'الـ (al-) belirtme tanımlığıdır ve ismin başına bitişik yazılır.',
      'الـ (al-) ist der bestimmte Artikel und wird direkt an das Substantiv geschrieben.'),
    note(
      'Murojaat shakli suhbatdoshning jinsiga qarab o‘zgaradi: erkakka anta, ayolga anti.',
      'How you address someone changes with their gender: anta to a man, anti to a woman.',
      'Форма обращения зависит от пола собеседника: к мужчине anta, к женщине anti.',
      'تختلف صيغة المخاطبة بحسب جنس المخاطَب: أنتَ للرجل وأنتِ للمرأة.',
      'Hitap biçimi karşıdakinin cinsiyetine göre değişir: erkeğe anta, kadına anti.',
      'Die Anrede richtet sich nach dem Geschlecht: anta zu einem Mann, anti zu einer Frau.'),
    note(
      'Bu iboralar — zamonaviy adabiy arab tili; kundalik so‘zlashuv mamlakatdan mamlakatga farq qiladi.',
      'These phrases are Modern Standard Arabic, used in writing and formal speech; everyday speech differs from country to country.',
      'Это современный литературный арабский; разговорная речь различается от страны к стране.',
      'هذه العبارات بالعربية الفصحى المعاصرة، ولغة الحديث اليومي تختلف من بلد إلى آخر.',
      'Bu ifadeler Modern Standart Arapçadır; günlük konuşma ülkeden ülkeye değişir.',
      'Diese Sätze sind Modernes Hocharabisch; die Alltagssprache unterscheidet sich von Land zu Land.'),
  ],
  tr: [
    note(
      'Turk tilida alohida so‘zlar o‘rniga qo‘shimchalar qo‘shiladi: ev, evde, evimde.',
      'Turkish adds endings where other languages use separate words: ev (house), evde (in the house), evimde (in my house).',
      'В турецком вместо отдельных слов добавляются окончания: ev (дом), evde (в доме), evimde (в моём доме).',
      'تضيف التركية لواحق بدل الكلمات المنفصلة: ev (بيت)، evde (في البيت)، evimde (في بيتي).',
      'Türkçe ayrı sözcükler yerine ek kullanır: ev, evde, evimde.',
      'Türkisch hängt Endungen an, wo andere Sprachen eigene Wörter nutzen: ev (Haus), evde (im Haus), evimde (in meinem Haus).'),
    note(
      'Qo‘shimchadagi unli so‘zning oxirgi unlisiga moslashadi: evde, ammo okulda.',
      'The vowel in an ending follows the last vowel of the word: evde but okulda.',
      'Гласный в окончании подстраивается под последний гласный слова: evde, но okulda.',
      'تتبع حركة اللاحقة آخر حركة في الكلمة: evde لكن okulda.',
      'Ekteki ünlü, sözcüğün son ünlüsüne uyar: evde ama okulda.',
      'Der Vokal der Endung richtet sich nach dem letzten Vokal des Wortes: evde, aber okulda.'),
    note(
      'Kesim gap oxirida keladi: Ben kitap okuyorum.',
      'The verb comes at the end: Ben kitap okuyorum — I book am reading.',
      'Глагол стоит в конце: Ben kitap okuyorum — «я книгу читаю».',
      'يأتي الفعل في آخر الجملة: Ben kitap okuyorum — «أنا كتابًا أقرأ».',
      'Yüklem sonda gelir: Ben kitap okuyorum.',
      'Das Verb steht am Ende: Ben kitap okuyorum – „ich Buch lese“.'),
    note(
      'Grammatik jins ham, the kabi artikl ham yo‘q.',
      'There is no grammatical gender and no word for the.',
      'Нет ни грамматического рода, ни артикля вроде the.',
      'لا يوجد جنس نحويّ ولا أداة تعريف.',
      'Dilbilgisel cinsiyet de the gibi bir tanımlık da yoktur.',
      'Es gibt kein grammatisches Geschlecht und keinen Artikel wie the.'),
    note(
      'Siz — hurmat va ko‘plik shakli; sen yaqinlar bilan ishlatiladi. Bu kursda siz qo‘llanadi.',
      'Siz is polite and also plural; sen is for family and close friends. This course uses siz.',
      'Siz — вежливая форма и множественное число; sen — для близких. В этом курсе используется siz.',
      'siz صيغة مهذّبة وجمع أيضًا، وsen للمقرّبين. يستخدم هذا المساق siz.',
      'Siz hem kibar hem çoğul biçimdir; sen yakınlar içindir. Bu kurs siz kullanır.',
      'Siz ist höflich und zugleich Plural, sen für Vertraute. Dieser Kurs verwendet siz.'),
  ],
  de: [
    note(
      'Har bir ot bosh harf bilan yoziladi va o‘z jinsiga ega: der, die yoki das.',
      'Every noun is capitalised and carries a gender: der, die or das.',
      'Каждое существительное пишется с большой буквы и имеет род: der, die или das.',
      'يُكتب كلّ اسم بحرف كبير وله جنس: der أو die أو das.',
      'Her isim büyük harfle yazılır ve bir cinsiyeti vardır: der, die ya da das.',
      'Jedes Substantiv wird großgeschrieben und hat ein Geschlecht: der, die oder das.'),
    note(
      'Darak gapda kesim ikkinchi o‘rinda turadi, boshida boshqa so‘z kelsa ham: Heute gehe ich nach Hause.',
      'In a statement the verb stands second, even when something else comes first: Heute gehe ich nach Hause.',
      'В повествовательном предложении глагол стоит на втором месте, даже если начинается с другого слова: Heute gehe ich nach Hause.',
      'في الجملة الخبرية يأتي الفعل في الموضع الثاني حتى لو بدأت بكلمة أخرى: Heute gehe ich nach Hause.',
      'Bildirme cümlesinde fiil ikinci sırada durur, başta başka bir sözcük olsa bile: Heute gehe ich nach Hause.',
      'Im Aussagesatz steht das Verb an zweiter Stelle, auch wenn etwas anderes vorangeht: Heute gehe ich nach Hause.'),
    note(
      'weil yoki dass dan keyin kesim gap oxiriga o‘tadi: …, weil ich müde bin.',
      'After weil or dass the verb moves to the end: …, weil ich müde bin.',
      'После weil или dass глагол уходит в конец: …, weil ich müde bin.',
      'بعد weil أو dass ينتقل الفعل إلى آخر الجملة: …, weil ich müde bin.',
      'weil ya da dass’tan sonra fiil sona gider: …, weil ich müde bin.',
      'Nach weil oder dass rückt das Verb ans Ende: …, weil ich müde bin.'),
    note(
      'Sie — hurmat shakli; du yaqinlar bilan ishlatiladi. Bu kursda Sie qo‘llanadi.',
      'Sie is the polite you; du is for family and close friends. This course uses Sie.',
      'Sie — вежливая форма; du — для близких. В этом курсе используется Sie.',
      'Sie صيغة التهذيب، وdu للمقرّبين. يستخدم هذا المساق Sie.',
      'Sie kibar biçimdir; du yakınlar içindir. Bu kurs Sie kullanır.',
      'Sie ist die höfliche Anrede, du gilt für Vertraute. Dieser Kurs verwendet Sie.'),
    note(
      'Artikl so‘zning gapdagi vazifasiga qarab o‘zgaradi: der Mann to‘ldiruvchi bo‘lganda den Mann bo‘ladi.',
      'Articles change with the job a word does: der Mann becomes den Mann as an object.',
      'Артикль меняется в зависимости от роли слова: der Mann в роли дополнения — den Mann.',
      'تتغيّر أداة التعريف بحسب وظيفة الكلمة: der Mann تصير den Mann حين تكون مفعولًا.',
      'Tanımlık, sözcüğün görevine göre değişir: nesne olunca der Mann, den Mann olur.',
      'Der Artikel ändert sich mit der Rolle im Satz: der Mann wird als Objekt zu den Mann.'),
  ],
};
