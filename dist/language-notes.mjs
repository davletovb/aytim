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
      'So‘z tartibi oddiy darak gaplarda odatda ega, fe’l, to‘ldiruvchi ko‘rinishida bo‘ladi: I see the dog.',
      'In simple statements with an object, the usual order is subject, verb, object: I see the dog.',
      'В простых утвердительных предложениях с дополнением обычный порядок такой: подлежащее, глагол, дополнение. Например, I see the dog.',
      'في الجمل الخبرية البسيطة التي فيها مفعول به، يأتي عادةً الفاعل ثم الفعل ثم المفعول به: I see the dog.',
      'Nesne içeren basit bildirme cümlelerinde sıralama genellikle özne, fiil, nesne biçimindedir: I see the dog.',
      'In einfachen Aussagesätzen mit einem Objekt ist die übliche Reihenfolge Subjekt, Verb, Objekt: I see the dog.'),
    note(
      'Otlarda grammatik jins yo‘q, shuning uchun the hamma ot oldida bir xil.',
      'Nouns have no gender, so the is the same in front of every one of them.',
      'У существительных нет рода, поэтому the одинаково перед любым из них.',
      'لا جنس نحويّ للأسماء، لذا تبقى the نفسها أمامها جميعًا.',
      'İsimlerin dilbilgisel cinsiyeti yoktur, bu yüzden the hepsinin önünde aynıdır.',
      'Substantive haben kein Geschlecht, daher steht vor allen dasselbe the.'),
    note(
      'Oddiy hozirgi yoki o‘tgan zamondagi ha-yo‘q savolida asosiy fe’l bilan do, does yoki did ishlatiladi: Do you have time? Be, can yoki boshqa yordamchi fe’l bor bo‘lsa, o‘sha fe’l egadan oldin keladi: Are you ready? Can you help?',
      'In yes/no questions in the simple present or past, use do, does, or did with most main verbs: Do you have time? Move be, a modal such as can, or an existing auxiliary before the subject: Are you ready? Can you help?',
      'В общих вопросах в простом настоящем или прошедшем времени с большинством смысловых глаголов используются do, does или did: Do you have time? Если уже есть be, модальный или другой вспомогательный глагол, он ставится перед подлежащим: Are you ready? Can you help?',
      'في أسئلة نعم أو لا في المضارع أو الماضي البسيط، تُستخدم do أو does أو did مع معظم الأفعال الرئيسية: Do you have time? وإذا وُجدت صيغة من be أو فعل مساعد مثل can، فإنها تسبق الفاعل: Are you ready? Can you help?',
      'Geniş zamanda ve basit geçmiş zamanda evet-hayır sorularında çoğu asıl fiille do, does veya did kullanılır: Do you have time? Be, can gibi bir kiplik fiili ya da başka bir yardımcı fiil varsa öznenin önüne o gelir: Are you ready? Can you help?',
      'In Ja-Nein-Fragen im Simple Present oder Simple Past steht bei den meisten Vollverben do, does oder did: Do you have time? Be, ein Modalverb wie can oder ein vorhandenes Hilfsverb steht selbst vor dem Subjekt: Are you ready? Can you help?'),
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
      'Sifat o‘zi aniqlagan ot bilan jins, son va kelishikda moslashadi: новая книга, новой книги. O‘tgan zamon fe’li ega bilan sonda, birlikda esa jinsda ham moslashadi: я читал (erkak), я читала (ayol), мы читали.',
      'An adjective agrees with its noun in gender, number, and case: новая книга, новой книги. A past-tense verb agrees with its subject in number and, in the singular, gender: я читал (male speaker), я читала (female speaker), мы читали.',
      'Прилагательное согласуется со своим существительным в роде, числе и падеже: новая книга, новой книги. Глагол в прошедшем времени согласуется с подлежащим в числе, а в единственном числе — и в роде: я читал (мужчина), я читала (женщина), мы читали.',
      'تطابق الصفة الاسم في الجنس والعدد والحالة الإعرابية: новая книга, новой книги. ويطابق الفعل في الماضي الفاعل في العدد، وفي الجنس أيضًا إذا كان الفاعل مفردًا: я читал (متكلّم)، я читала (متكلّمة)، мы читали.',
      'Sıfat, nitelediği isme cinsiyet, sayı ve hâl bakımından uyar: новая книга, новой книги. Geçmiş zaman fiili özneye sayı bakımından, tekilde ayrıca cinsiyet bakımından uyar: я читал (erkek konuşur), я читала (kadın konuşur), мы читали.',
      'Ein Adjektiv richtet sich in Genus, Numerus und Kasus nach seinem Substantiv: новая книга, новой книги. In der Vergangenheit richtet sich das Verb im Numerus und im Singular auch im Genus nach dem Subjekt: я читал (Sprecher), я читала (Sprecherin), мы читали.'),
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
      'Bir erkakka anta, bir ayolga anti deyiladi: min faḍlika yoki min faḍliki. Xushmuomalalik uchun ham birlik shakli ishlatiladi. Kursdagi ko‘plik shakllari guruh yoki tashkilotga qaratilgan.',
      'Use anta for one man and anti for one woman: min faḍlika or min faḍliki (please). Polite requests to one person still use the singular. The course uses the plural for a group or an organization.',
      'К одному мужчине обращаются на anta, к одной женщине — на anti: min faḍlika или min faḍliki («пожалуйста»). Вежливая просьба к одному человеку остаётся в единственном числе. В курсе множественное число используется при обращении к группе или организации.',
      'تُخاطب الرجل الواحد بـ«أنتَ» والمرأة الواحدة بـ«أنتِ»: «مِنْ فَضْلِكَ» أو «مِنْ فَضْلِكِ». ويبقى الخطاب مفردًا عند الطلب المهذّب من شخص واحد. وفي هذا المساق نخاطب المجموعة أو المؤسسة بصيغة الجمع.',
      'Bir erkeğe anta, bir kadına anti diye hitap edilir: min faḍlika veya min faḍliki (lütfen). Bir kişiye kibarca seslenirken de tekil kullanılır. Kursta gruplara veya kurumlara çoğul biçimle hitap edilir.',
      'Zu einem Mann sagt man anta, zu einer Frau anti: min faḍlika oder min faḍliki (bitte). Auch höfliche Bitten an eine Person stehen im Singular. Im Kurs steht der Plural bei der Anrede von Gruppen oder Organisationen.'),
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
      'Turk tilida grammatik jins va the kabi aniqlik artikli yo‘q. Bir so‘zi a/an ma’nosini bera oladi: bir bilet. Aniq vositasiz to‘ldiruvchi tushum qo‘shimchasini oladi: bileti aldım («chiptani oldim»).',
      'Turkish has no grammatical gender or definite article. Bir can mean a/an, as in bir bilet (a ticket). A definite direct object takes the accusative ending, as in bileti aldım (I bought the ticket).',
      'В турецком нет грамматического рода и определённого артикля. Bir может соответствовать неопределённому артиклю: bir bilet («билет»). Определённое прямое дополнение получает окончание винительного падежа: bileti aldım («я купил этот билет»).',
      'لا جنس نحويًّا ولا أداة تعريف في التركية. قد تُفيد bir التنكير مثل bir bilet (تذكرة). ويأخذ المفعول به المعرّف لاحقة النصب مثل bileti aldım (اشتريت التذكرة).',
      'Türkçede dilbilgisel cinsiyet ve belirli tanımlık yoktur. Bir bilet örneğinde bir, belirsizlik bildirir. Belirli nesne belirtme durumu eki alır: bileti aldım.',
      'Türkisch hat kein grammatisches Geschlecht und keinen bestimmten Artikel. Bir kann ein/eine bedeuten, etwa in bir bilet (eine Fahrkarte). Ein bestimmtes direktes Objekt erhält die Akkusativendung: bileti aldım (ich habe die Fahrkarte gekauft).'),
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
      'Every noun is capitalized and carries a gender: der, die or das.',
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
