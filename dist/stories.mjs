import { localized as line, phrase as sentence } from './content.mjs';

function question(prompt, correct, firstDistractor, secondDistractor) {
  return { prompt, choices: [correct, firstDistractor, secondDistractor] };
}

function story(id, tone, title, description, lines, questions) {
  lines.forEach((entry, index) => { entry.id = 'story-' + id + '-' + (index + 1); });
  return { id, tone, title, description, lines, questions };
}

export const stories = [
  story('rain', 'sky',
    line('Yomg‘irda bir piyola choy', 'Tea in the rain', 'Чай в дождливый день', 'شاي في يوم ممطر', 'Yağmurda bir çay', 'Tee im Regen'),
    line('Yomg‘ir Lolaning tushlik rejasini o‘zgartiradi.', 'Rain changes Lola’s lunch plans.', 'Дождь меняет планы Лолы на обед.', 'يغيّر المطر خطط لولا للغداء.', 'Yağmur Lola’nın öğle planını değiştirir.', 'Regen ändert Lolas Pläne für die Mittagspause.'),
    [
      sentence('Lola tushlik tanaffusida bog‘ga bormoqchi.', 'Lola wants to go to the park on her lunch break.', 'В обеденный перерыв Лола хочет пойти в парк.', 'تريد لولا الذهاب إلى الحديقة في استراحة الغداء.', 'Lola öğle arasında parka gitmek istiyor.', 'Lola möchte in ihrer Mittagspause in den Park gehen.', 'Turīdu Lūlā adh-dhahāba ilā al-ḥadīqati fī istirāḥati al-ghadāʾ.'),
      sentence('U ko‘chaga chiqqanida yomg‘ir yog‘a boshlaydi.', 'It starts to rain when she steps outside.', 'Когда она выходит на улицу, начинается дождь.', 'عندما تخرج، يبدأ المطر بالهطول.', 'Dışarı çıktığında yağmur yağmaya başlıyor.', 'Als sie hinausgeht, fängt es an zu regnen.', 'ʿIndamā takhruju, yabdaʾu al-maṭaru bil-huṭūl.'),
      sentence('U kichik kafega kirib, bir piyola choy buyurtma qiladi.', 'She goes into a small café and orders a cup of tea.', 'Она заходит в маленькое кафе и заказывает чашку чая.', 'تدخل مقهًى صغيرًا وتطلب كوبًا من الشاي.', 'Küçük bir kafeye girip bir fincan çay söylüyor.', 'Sie geht in ein kleines Café und bestellt eine Tasse Tee.', 'Tadkhulu maqhan ṣaghīran wa taṭlubu kūban min ash-shāy.'),
      sentence('Deraza yonida qo‘shnisi o‘tiribdi.', 'Her neighbor is sitting by the window.', 'У окна сидит её сосед.', 'يجلس جارها قرب النافذة.', 'Komşusu pencerenin yanında oturuyor.', 'Ihr Nachbar sitzt am Fenster.', 'Yajlisu jāruhā qurba an-nāfidha.'),
      sentence('Lola qo‘shnisining yoniga o‘tiradi va ular birga choy ichishadi.', 'Lola sits beside her neighbor and they drink tea together.', 'Лола садится рядом с соседом, и они пьют чай вместе.', 'تجلس لولا بجانب جارها ويشربان الشاي معًا.', 'Lola komşusunun yanına oturuyor ve birlikte çay içiyorlar.', 'Lola setzt sich neben ihren Nachbarn, und sie trinken zusammen Tee.', 'Tajlisu Lūlā bijānibi jārihā wa yashrabāni ash-shāya maʿan.')
    ],
    [
      question(
        line('Lola avval qayerga bormoqchi edi?', 'Where did Lola plan to go first?', 'Куда Лола сначала собиралась пойти?', 'أين أرادت لولا الذهاب في البداية؟', 'Lola önce nereye gitmek istiyordu?', 'Wohin wollte Lola zuerst gehen?'),
        line('Bog‘ga', 'To the park', 'В парк', 'إلى الحديقة', 'Parka', 'In den Park'),
        line('Kutubxonaga', 'To the library', 'В библиотеку', 'إلى المكتبة', 'Kütüphaneye', 'In die Bibliothek'),
        line('Bozorga', 'To the market', 'На рынок', 'إلى السوق', 'Pazara', 'Auf den Markt')),
      question(
        line('Nega Lola kafega kirdi?', 'Why did Lola go into the café?', 'Почему Лола зашла в кафе?', 'لماذا دخلت لولا المقهى؟', 'Lola kafeye neden girdi?', 'Warum ging Lola ins Café?'),
        line('Yomg‘ir yog‘a boshladi.', 'It started to rain.', 'Начался дождь.', 'بدأ المطر بالهطول.', 'Yağmur yağmaya başladı.', 'Es fing an zu regnen.'),
        line('U yo‘lini yo‘qotdi.', 'She got lost.', 'Она заблудилась.', 'ضلّت طريقها.', 'Yolunu kaybetti.', 'Sie hatte sich verlaufen.'),
        line('Bog‘ yopiq edi.', 'The park was closed.', 'Парк был закрыт.', 'كانت الحديقة مغلقة.', 'Park kapalıydı.', 'Der Park war geschlossen.')),
      question(
        line('Lola kim bilan choy ichdi?', 'Who drank tea with Lola?', 'С кем Лола пила чай?', 'مع من شربت لولا الشاي؟', 'Lola kiminle çay içti?', 'Mit wem trank Lola Tee?'),
        line('Qo‘shnisi bilan', 'Her neighbor', 'С соседом', 'مع جارها', 'Komşusuyla', 'Mit ihrem Nachbarn'),
        line('Akasi bilan', 'Her older brother', 'Со старшим братом', 'مع أخيها الأكبر', 'Ağabeyiyle', 'Mit ihrem älteren Bruder'),
        line('Hamkasbi bilan', 'Her colleague', 'С коллегой', 'مع زميلها', 'İş arkadaşıyla', 'Mit ihrem Kollegen'))
    ]),
  story('gift', 'peach',
    line('Qo‘shniga sovg‘a', 'A gift for the neighbor', 'Подарок для соседки', 'هدية للجارة', 'Komşuya bir hediye', 'Ein Geschenk für die Nachbarin'),
    line('Samir yangi qo‘shnisiga kichik sovg‘a olib boradi.', 'Samir brings a small gift to his new neighbor.', 'Самир приносит новой соседке небольшой подарок.', 'يقدّم سمير هدية صغيرة لجارته الجديدة.', 'Samir yeni komşusuna küçük bir hediye götürüyor.', 'Samir bringt seiner neuen Nachbarin ein kleines Geschenk.'),
    [
      sentence('Samir yashaydigan binoga yangi qo‘shni ko‘chib keldi.', 'A new neighbor has moved into Samir’s building.', 'В доме Самира поселилась новая соседка.', 'انتقلت جارة جديدة إلى المبنى الذي يسكن فيه سمير.', 'Samir’in apartmanına yeni bir komşu taşındı.', 'Eine neue Nachbarin ist in Samirs Haus eingezogen.', 'Intaqalat jāratun jadīdatun ilā al-mabnā alladhī yaskunu fīhi Samīr.'),
      sentence('Samir bozordan bir kilo olma sotib oladi.', 'Samir buys a kilo of apples at the market.', 'Самир покупает на рынке килограмм яблок.', 'يشتري سمير كيلوغرامًا من التفاح من السوق.', 'Samir pazardan bir kilo elma alıyor.', 'Samir kauft auf dem Markt ein Kilo Äpfel.', 'Yashtarī Samīr kīlūghrāman min at-tuffāḥi min as-sūq.'),
      sentence('U olmalarni qog‘oz paketga soladi va qo‘shnisining eshigini taqillatadi.', 'He puts the apples in a paper bag and knocks on his neighbor’s door.', 'Он кладёт яблоки в бумажный пакет и стучит в дверь соседки.', 'يضع التفاح في كيس ورقيّ ويطرق باب جارته.', 'Elmaları kâğıt bir poşete koyup komşusunun kapısını çalıyor.', 'Er legt die Äpfel in eine Papiertüte und klopft bei seiner Nachbarin.', 'Yaḍaʿu at-tuffāḥa fī kīsin waraqiyyin wa yaṭruqu bāba jāratihi.'),
      sentence('Qo‘shnisi eshikni ochadi va unga rahmat aytadi.', 'The neighbor opens the door and thanks him.', 'Соседка открывает дверь и благодарит его.', 'تفتح الجارة الباب وتشكره.', 'Komşusu kapıyı açıp ona teşekkür ediyor.', 'Die Nachbarin öffnet die Tür und bedankt sich bei ihm.', 'Taftaḥu al-jāratu al-bāba wa tashkuruhu.'),
      sentence('Ertasi kuni u Samirni choyga taklif qiladi.', 'The next day, she invites Samir over for tea.', 'На следующий день она приглашает Самира на чай.', 'في اليوم التالي تدعو سميرًا لشرب الشاي عندها.', 'Ertesi gün Samir’i çaya davet ediyor.', 'Am nächsten Tag lädt sie Samir zum Tee ein.', 'Fī al-yawmi at-tālī tadʿū Samīran lishurbi ash-shāyi ʿindahā.')
    ],
    [
      question(
        line('Samir nima sotib oldi?', 'What did Samir buy?', 'Что купил Самир?', 'ماذا اشترى سمير؟', 'Samir ne aldı?', 'Was kaufte Samir?'),
        line('Bir kilo olma', 'A kilo of apples', 'Килограмм яблок', 'كيلوغرامًا من التفاح', 'Bir kilo elma', 'Ein Kilo Äpfel'),
        line('Ikki dona non', 'Two loaves of bread', 'Две буханки хлеба', 'رغيفين من الخبز', 'İki ekmek', 'Zwei Laibe Brot'),
        line('Bir paket choy', 'A packet of tea', 'Пачку чая', 'علبة شاي', 'Bir paket çay', 'Eine Packung Tee')),
      question(
        line('Olmalar kim uchun edi?', 'Who were the apples for?', 'Для кого были яблоки?', 'لمن كان التفاح؟', 'Elmalar kimin içindi?', 'Für wen waren die Äpfel?'),
        line('Yangi qo‘shnisi uchun', 'His new neighbor', 'Для новой соседки', 'لجارته الجديدة', 'Yeni komşusu için', 'Für seine neue Nachbarin'),
        line('Uning oilasi uchun', 'His family', 'Для его семьи', 'لعائلته', 'Ailesi için', 'Für seine Familie'),
        line('Bozordagi sotuvchi uchun', 'The market vendor', 'Для продавца на рынке', 'للبائع في السوق', 'Pazardaki satıcı için', 'Für den Verkäufer auf dem Markt')),
      question(
        line('Qo‘shnisi ertasi kuni nima qildi?', 'What did the neighbor do the next day?', 'Что соседка сделала на следующий день?', 'ماذا فعلت الجارة في اليوم التالي؟', 'Komşusu ertesi gün ne yaptı?', 'Was machte die Nachbarin am nächsten Tag?'),
        line('Samirni choyga taklif qildi.', 'She invited Samir for tea.', 'Пригласила Самира на чай.', 'دعت سميرًا لشرب الشاي.', 'Samir’i çaya davet etti.', 'Sie lud Samir zum Tee ein.'),
        line('U bozorga bordi.', 'She went to the market.', 'Пошла на рынок.', 'ذهبت إلى السوق.', 'Pazara gitti.', 'Sie ging auf den Markt.'),
        line('U Samirga non olib keldi.', 'She brought Samir bread.', 'Принесла Самиру хлеб.', 'أحضرت خبزًا لسمير.', 'Samir’e ekmek getirdi.', 'Sie brachte Samir Brot.'))
    ]),
  story('walk', 'mint',
    line('Ishga piyoda', 'A walk to work', 'На работу пешком', 'إلى العمل سيرًا', 'İşe yürüyerek', 'Zu Fuß zur Arbeit'),
    line('Mira ertalab boshqa yo‘ldan borib ko‘radi.', 'Mira takes a different route in the morning.', 'Утром Мира выбирает другой путь.', 'تسلك ميرا طريقًا مختلفًا في الصباح.', 'Mira sabah başka bir yoldan gidiyor.', 'Mira nimmt morgens einen anderen Weg.'),
    [
      sentence('Mira odatda ishga avtobusda boradi.', 'Mira usually takes the bus to work.', 'Обычно Мира ездит на работу на автобусе.', 'تذهب ميرا عادةً إلى العمل بالحافلة.', 'Mira genellikle işe otobüsle gider.', 'Mira fährt normalerweise mit dem Bus zur Arbeit.', 'Tadhhabu Mīrā ʿādatan ilā al-ʿamali bil-ḥāfila.'),
      sentence('Bugun u erta turadi va havo iliq.', 'Today she gets up early, and the weather is warm.', 'Сегодня она встаёт рано, и на улице тепло.', 'اليوم تستيقظ مبكّرًا والجوّ دافئ.', 'Bugün erken kalkıyor ve hava ılık.', 'Heute steht sie früh auf, und es ist warm.', 'Al-yawma tastayqiẓu mubakkiran wal-jawwu dāfiʾ.'),
      sentence('U piyoda ketishga qaror qiladi va ko‘prikdan o‘tadi.', 'She decides to walk and crosses the bridge.', 'Она решает пойти пешком и переходит через мост.', 'تقرّر الذهاب مشيًا وتعبر الجسر.', 'Yürümeye karar verip köprüden geçiyor.', 'Sie beschließt, zu Fuß zu gehen, und überquert die Brücke.', 'Tuqarriru adh-dhahāba mashyan wa taʿburu al-jisr.'),
      sentence('Yo‘lda u kichkina nonvoyxonani ko‘rib qoladi va non sotib oladi.', 'On the way, she spots a small bakery and buys some bread.', 'По дороге она замечает маленькую пекарню и покупает хлеб.', 'في الطريق تلاحظ مخبزًا صغيرًا وتشتري بعض الخبز.', 'Yolda küçük bir fırın görüp ekmek alıyor.', 'Unterwegs entdeckt sie eine kleine Bäckerei und kauft Brot.', 'Fī aṭ-ṭarīqi tulāḥiẓu makhbazan ṣaghīran wa tashtarī baʿḍa al-khubz.'),
      sentence('U ishga vaqtida yetib boradi va ertaga ham piyoda kelmoqchi.', 'She arrives at work on time and wants to walk again tomorrow.', 'Она приходит на работу вовремя и завтра тоже хочет пойти пешком.', 'تصل إلى العمل في الوقت المحدّد وتريد أن تذهب مشيًا غدًا أيضًا.', 'İşe zamanında varıyor ve yarın da yürümek istiyor.', 'Sie kommt pünktlich zur Arbeit und möchte morgen wieder zu Fuß gehen.', 'Taṣilu ilā al-ʿamali fī al-waqti al-muḥaddadi wa turīdu an tadhhaba mashyan ghadan ayḍan.')
    ],
    [
      question(
        line('Mira odatda ishga qanday boradi?', 'How does Mira usually get to work?', 'Как Мира обычно добирается до работы?', 'كيف تذهب ميرا عادةً إلى العمل؟', 'Mira genellikle işe nasıl gider?', 'Wie kommt Mira normalerweise zur Arbeit?'),
        line('Avtobusda', 'By bus', 'На автобусе', 'بالحافلة', 'Otobüsle', 'Mit dem Bus'),
        line('Poyezdda', 'By train', 'На поезде', 'بالقطار', 'Trenle', 'Mit dem Zug'),
        line('Piyoda', 'On foot', 'Пешком', 'مشياً', 'Yürüyerek', 'Zu Fuß')),
      question(
        line('Mira yo‘lda nimani topdi?', 'What did Mira find on the way?', 'Что Мира нашла по дороге?', 'ماذا وجدت ميرا في الطريق؟', 'Mira yolda ne buldu?', 'Was entdeckte Mira unterwegs?'),
        line('Kichik nonvoyxonani', 'A small bakery', 'Маленькую пекарню', 'مخبزًا صغيرًا', 'Küçük bir fırın', 'Eine kleine Bäckerei'),
        line('Yangi avtobus bekatini', 'A new bus stop', 'Новую автобусную остановку', 'موقف حافلات جديدًا', 'Yeni bir otobüs durağı', 'Eine neue Bushaltestelle'),
        line('Ochiq bozorni', 'An open market', 'Открытый рынок', 'سوقًا مفتوحة', 'Açık bir pazar', 'Einen geöffneten Markt')),
      question(
        line('Mira ertaga nima qilmoqchi?', 'What does Mira want to do tomorrow?', 'Что Мира хочет сделать завтра?', 'ماذا تريد ميرا أن تفعل غدًا؟', 'Mira yarın ne yapmak istiyor?', 'Was möchte Mira morgen tun?'),
        line('Yana piyoda borishni', 'Walk to work again', 'Снова пойти на работу пешком', 'أن تذهب إلى العمل مشيًا مرة أخرى', 'İşe yine yürümek', 'Wieder zu Fuß zur Arbeit gehen'),
        line('Kechroq turishni', 'Get up later', 'Встать позже', 'أن تستيقظ في وقت متأخّر', 'Daha geç kalkmak', 'Später aufstehen'),
        line('Nonvoyxonada ishlashni', 'Work at the bakery', 'Поработать в пекарне', 'أن تعمل في المخبز', 'Fırında çalışmak', 'In der Bäckerei arbeiten'))
    ]),
  story('keys', 'lilac',
    line('Yo‘qolgan kalitlar', 'The missing keys', 'Пропавшие ключи', 'المفاتيح المفقودة', 'Kayıp anahtarlar', 'Die verschwundenen Schlüssel'),
    line('Nuri kalitlarini qidirayotib, ertalab qilgan ishlarini eslaydi.', 'Nuri retraces his morning to find his keys.', 'Нури вспоминает события утра, чтобы найти ключи.', 'يستعيد نوري أحداث الصباح بحثًا عن مفاتيحه.', 'Nuri anahtarlarını bulmak için sabah yaptıklarını hatırlıyor.', 'Nuri geht den Morgen im Kopf durch, um seine Schlüssel zu finden.'),
    [
      sentence('Kechqurun Nuri uyiga qaytdi, lekin kalitlari cho‘ntagida yo‘q edi.', 'Nuri came home in the evening, but his keys weren’t in his pocket.', 'Вечером Нури вернулся домой, но ключей в кармане не оказалось.', 'عاد نوري إلى البيت مساءً، لكن مفاتيحه لم تكن في جيبه.', 'Nuri akşam eve döndü ama anahtarları cebinde yoktu.', 'Nuri kam abends nach Hause, aber seine Schlüssel waren nicht in seiner Tasche.', 'ʿĀda Nūrī ilā al-bayti masāʾan, lākin mafātīḥahu lam takun fī jaybihi.'),
      sentence('Avvaliga u kalitlarini ishda qoldirdim deb o‘yladi.', 'At first, he thought he had left them at work.', 'Сначала он подумал, что оставил их на работе.', 'في البداية ظنّ أنه تركها في العمل.', 'İlk başta onları iş yerinde unuttuğunu düşündü.', 'Zuerst dachte er, er hätte sie bei der Arbeit liegen lassen.', 'Fī al-bidāya ẓanna annahu tarakahā fī al-ʿamal.'),
      sentence('Keyin ertalab do‘stiga kitob berganini esladi.', 'Then he remembered giving a book to a friend that morning.', 'Потом он вспомнил, как утром отдал книгу другу.', 'ثم تذكّر أنه أعطى صديقًا كتابًا ذلك الصباح.', 'Sonra o sabah bir arkadaşına kitap verdiğini hatırladı.', 'Dann erinnerte er sich daran, dass er einem Freund am Morgen ein Buch gegeben hatte.', 'Thumma tadhakkara annahu aʿṭā ṣadīqan kitāban dhālika aṣ-ṣabāḥ.'),
      sentence('Kitobni uzatayotganda kalitlarini do‘stining stoli ustiga qo‘ygan edi.', 'He had put his keys on his friend’s table while handing over the book.', 'Когда он передавал книгу, он положил ключи на стол друга.', 'وضع مفاتيحه على طاولة صديقه أثناء تسليمه الكتاب.', 'Kitabı uzatırken anahtarlarını arkadaşının masasına koymuştu.', 'Als er das Buch überreichte, hatte er seine Schlüssel auf den Tisch seines Freundes gelegt.', 'Waḍaʿa mafātīḥahu ʿalā ṭāwilati ṣadīqihi athnāʾa taslīmihi al-kitāb.'),
      sentence('Nuri do‘stiga qo‘ng‘iroq qildi. Yaxshiyamki, kalitlar hali ham o‘sha yerda edi.', 'Nuri called his friend. Luckily, the keys were still there.', 'Нури позвонил другу. К счастью, ключи всё ещё были там.', 'اتّصل نوري بصديقه. لحسن الحظ، كانت المفاتيح لا تزال هناك.', 'Nuri arkadaşını aradı. Neyse ki anahtarlar hâlâ oradaydı.', 'Nuri rief seinen Freund an. Zum Glück lagen die Schlüssel noch dort.', 'Ittaṣala Nūrī biṣadīqihi. Liḥusni al-ḥaẓẓ, kānat al-mafātīḥu lā tazālu hunāk.')
    ],
    [
      question(
        line('Nuri avval kalitlarini qayerda deb o‘yladi?', 'Where did Nuri first think he had left his keys?', 'Где Нури, как он сначала подумал, оставил ключи?', 'أين ظنّ نوري في البداية أنه ترك مفاتيحه؟', 'Nuri önce anahtarlarını nerede bıraktığını düşündü?', 'Wo glaubte Nuri zuerst, seine Schlüssel gelassen zu haben?'),
        line('Ishda', 'At work', 'На работе', 'في العمل', 'İş yerinde', 'Bei der Arbeit'),
        line('Do‘stining uyida', 'At his friend’s home', 'Дома у друга', 'في بيت صديقه', 'Arkadaşının evinde', 'Bei seinem Freund zu Hause'),
        line('Avtobusda', 'On the bus', 'В автобусе', 'في الحافلة', 'Otobüste', 'Im Bus')),
      question(
        line('Kalitlarni eslashga nima yordam berdi?', 'What helped Nuri remember where the keys were?', 'Что помогло Нури вспомнить, где ключи?', 'ما الذي ساعد نوري على تذكّر مكان المفاتيح؟', 'Nuri’nin anahtarları hatırlamasına ne yardımcı oldu?', 'Was half Nuri, sich an den Ort der Schlüssel zu erinnern?'),
        line('Do‘stiga kitob berganini esladi.', 'He remembered handing his friend a book.', 'Он вспомнил, как передал другу книгу.', 'تذكّر أنه سلّم صديقه كتابًا.', 'Arkadaşına kitap verdiğini hatırladı.', 'Er erinnerte sich daran, seinem Freund ein Buch gegeben zu haben.'),
        line('Cho‘ntagidan xat chiqdi.', 'He found a note in his pocket.', 'Он нашёл записку в кармане.', 'وجد ملاحظة في جيبه.', 'Cebinde bir not buldu.', 'Er fand einen Zettel in seiner Tasche.'),
        line('Hamkasbi unga yozdi.', 'A colleague texted him.', 'Коллега написал ему.', 'أرسل له زميل رسالة.', 'Bir iş arkadaşı ona mesaj attı.', 'Ein Kollege schrieb ihm eine Nachricht.')),
      question(
        line('Kalitlar aslida qayerda edi?', 'Where were the keys in the end?', 'Где в итоге оказались ключи?', 'أين كانت المفاتيح في النهاية؟', 'Anahtarlar sonunda nerede çıktı?', 'Wo waren die Schlüssel am Ende?'),
        line('Do‘stining stoli ustida', 'On his friend’s table', 'На столе друга', 'على طاولة صديقه', 'Arkadaşının masasında', 'Auf dem Tisch seines Freundes'),
        line('Eshik yonida', 'By the door', 'У двери', 'بجانب الباب', 'Kapının yanında', 'Neben der Tür'),
        line('Kitob orasida', 'Inside the book', 'В книге', 'داخل الكتاب', 'Kitabın içinde', 'Im Buch'))
    ]),
  story('platform', 'sand',
    line('Boshqa platforma', 'A change of platform', 'Смена платформы', 'تغيير الرصيف', 'Peron değişikliği', 'Ein Gleiswechsel'),
    line('Safarda bitta e’lon Safiyaning rejasini o‘zgartiradi.', 'An announcement changes Safiya’s travel plans.', 'Объявление меняет планы Сафии на поездку.', 'يغيّر إعلان خطط صفية للسفر.', 'Bir anons Safiye’nin yolculuk planını değiştiriyor.', 'Eine Durchsage ändert Safiyas Reisepläne.'),
    [
      sentence('Safiyaning poyezdi soat ikkida jo‘nashi kerak edi.', 'Safiya’s train was due to leave at two.', 'Поезд Сафии должен был отправиться в два часа.', 'كان من المفترض أن يغادر قطار صفية في الساعة الثانية.', 'Safiye’nin treni saat ikide kalkacaktı.', 'Safiyas Zug sollte um zwei Uhr abfahren.', 'Kāna min al-muftaraḍi an yughādira qiṭāru Ṣafiyya fī as-sāʿati ath-thāniya.'),
      sentence('U ikkinchi platformada kutayotganida poyezdning kechikishi haqida e’lon qilishdi.', 'While she waited on platform two, there was an announcement that the train was delayed.', 'Пока она ждала на второй платформе, объявили о задержке поезда.', 'بينما كانت تنتظر على الرصيف الثاني، أُعلن عن تأخّر القطار.', 'İkinci peronda beklerken trenin gecikeceği anons edildi.', 'Während sie am zweiten Bahnsteig wartete, wurde eine Verspätung durchgesagt.', 'Baynamā kānat tantaẓiru ʿalā ar-raṣīfi ath-thānī, uʿlina ʿan taʾakhkhuri al-qiṭār.'),
      sentence('Vokzal xodimi poyezd to‘rtinchi platformadan jo‘nashini aytdi.', 'A station employee told her the train would leave from platform four.', 'Сотрудник вокзала сказал, что поезд отправится с четвёртой платформы.', 'أخبرها موظّف المحطّة بأن القطار سيغادر من الرصيف الرابع.', 'Bir görevli trenin dördüncü perondan kalkacağını söyledi.', 'Ein Mitarbeiter sagte ihr, dass der Zug von Gleis vier abfahren würde.', 'Akhbarahā muwaẓẓafu al-maḥaṭṭati bi-anna al-qiṭāra sayughādiru min ar-raṣīfi ar-rābiʿ.'),
      sentence('Safiya opasiga kechroq yetib borishini yozdi.', 'Safiya texted her older sister that she would arrive later.', 'Сафия написала старшей сестре, что приедет позже.', 'كتبت صفية لأختها الكبرى أنها ستصل متأخّرة.', 'Safiye ablasına daha geç varacağını yazdı.', 'Safiya schrieb ihrer älteren Schwester, dass sie später ankommen würde.', 'Katabat Ṣafiyya li-ukhtihā al-kubrā annahā sataṣilu mutaʾakhkhira.'),
      sentence('U platformani almashtirdi va yarim soatdan keyin poyezdga chiqdi.', 'She changed platforms and boarded the train half an hour later.', 'Она перешла на другую платформу и через полчаса села в поезд.', 'انتقلت إلى الرصيف الآخر وركبت القطار بعد نصف ساعة.', 'Peron değiştirdi ve yarım saat sonra trene bindi.', 'Sie wechselte den Bahnsteig und stieg eine halbe Stunde später in den Zug.', 'Intaqalat ilā ar-raṣīfi al-ākhar wa rakibat al-qiṭāra baʿda niṣfi sāʿa.')
    ],
    [
      question(
        line('Safiya dastlab qayerda kutdi?', 'Where did Safiya wait at first?', 'Где Сафия ждала сначала?', 'أين انتظرت صفية في البداية؟', 'Safiye başta nerede bekledi?', 'Wo wartete Safiya zuerst?'),
        line('Ikkinchi platformada', 'On platform two', 'На второй платформе', 'على الرصيف الثاني', 'İkinci peronda', 'Am zweiten Bahnsteig'),
        line('To‘rtinchi platformada', 'On platform four', 'На четвёртой платформе', 'على الرصيف الرابع', 'Dördüncü peronda', 'Am vierten Bahnsteig'),
        line('Kafeda', 'In a café', 'В кафе', 'في مقهى', 'Bir kafede', 'In einem Café')),
      question(
        line('Nega u platformani almashtirdi?', 'Why did she change platforms?', 'Почему она перешла на другую платформу?', 'لماذا انتقلت إلى رصيف آخر؟', 'Neden peron değiştirdi?', 'Warum wechselte sie den Bahnsteig?'),
        line('Poyezd boshqa platformadan jo‘nardi.', 'The train was leaving from another platform.', 'Поезд отправлялся с другой платформы.', 'كان القطار سيغادر من رصيف آخر.', 'Tren başka bir perondan kalkacaktı.', 'Der Zug sollte von einem anderen Gleis abfahren.'),
        line('Opasi uni o‘sha yerda kutayotgan edi.', 'Her sister was waiting for her there.', 'Там её ждала сестра.', 'كانت أختها تنتظرها هناك.', 'Ablası onu orada bekliyordu.', 'Ihre Schwester wartete dort auf sie.'),
        line('U noto‘g‘ri poyezdga chiqqan edi.', 'She had boarded the wrong train.', 'Она села не в тот поезд.', 'ركبت القطار الخطأ.', 'Yanlış trene binmişti.', 'Sie war in den falschen Zug gestiegen.')),
      question(
        line('Safiya opasiga nima deb yozdi?', 'What did Safiya tell her sister?', 'Что Сафия написала сестре?', 'ماذا كتبت صفية لأختها؟', 'Safiye ablasına ne yazdı?', 'Was schrieb Safiya ihrer Schwester?'),
        line('Kechroq yetib borishini', 'She would arrive later', 'Что приедет позже', 'أنها ستصل متأخّرة', 'Daha geç varacağını', 'Dass sie später ankommen würde'),
        line('Uyiga qaytishini', 'She was going back home', 'Что возвращается домой', 'أنها ستعود إلى البيت', 'Eve döneceğini', 'Dass sie nach Hause zurückfahren würde'),
        line('Chiptasini yo‘qotganini', 'She had lost her ticket', 'Что потеряла билет', 'أنها أضاعت تذكرتها', 'Biletini kaybettiğini', 'Dass sie ihre Fahrkarte verloren hatte'))
    ]),
  story('team', 'rose',
    line('Jamoaga yangi a’zo', 'New on the team', 'Новичок в команде', 'عضو جديد في الفريق', 'Ekibin yeni üyesi', 'Neu im Team'),
    line('Lea tushunmagan vazifasini savol berib aniqlashtiradi.', 'Lea asks a question to clarify an unfamiliar task.', 'Леа задаёт вопрос, чтобы разобраться с новым заданием.', 'تطرح ليا سؤالًا لتفهم مهمّة جديدة.', 'Lea yeni bir görevi anlamak için soru soruyor.', 'Lea stellt eine Frage, um eine neue Aufgabe besser zu verstehen.'),
    [
      sentence('Lea ishdagi birinchi kunida jamoa yig‘ilishiga qo‘shildi.', 'On her first day at work, Lea joined a team meeting.', 'В первый рабочий день Леа пришла на совещание команды.', 'في يومها الأول في العمل، حضرت ليا اجتماع الفريق.', 'Lea işteki ilk gününde ekip toplantısına katıldı.', 'An ihrem ersten Arbeitstag nahm Lea an einer Teambesprechung teil.', 'Fī yawmihā al-awwali fī al-ʿamal, ḥaḍarat Liyā ijtimāʿa al-farīq.'),
      sentence('Unga juma kunigacha hisobot qoralamasini tayyorlashni topshirishdi.', 'She was asked to prepare a draft report by Friday.', 'Её попросили подготовить черновик отчёта к пятнице.', 'طُلب منها إعداد مسوّدة تقرير بحلول يوم الجمعة.', 'Cumaya kadar bir rapor taslağı hazırlaması istendi.', 'Sie sollte bis Freitag den Entwurf für einen Bericht vorbereiten.', 'Ṭuliba minhā iʿdādu musawwadati taqrīrin biḥulūli yawmi al-jumʿa.'),
      sentence('Lea nimadan boshlashni bilmagani uchun oldingi hisobotdan namuna so‘radi.', 'Unsure where to begin, Lea asked for an example of a previous report.', 'Леа не знала, с чего начать, и попросила показать прошлый отчёт.', 'لم تعرف ليا من أين تبدأ، فطلبت مثالًا على تقرير سابق.', 'Nereden başlayacağını bilemeyen Lea, önceki bir raporu örnek olarak istedi.', 'Lea wusste nicht, wo sie anfangen sollte, und bat um einen früheren Bericht als Beispiel.', 'Lam taʿrif Liyā min ayna tabdaʾu, faṭalabat mithālan ʿalā taqrīrin sābiq.'),
      sentence('Hamkasbi unga havola yubordi va avval qaysi bo‘limni yozish kerakligini aytdi.', 'A colleague sent her a link and explained which section to write first.', 'Коллега прислал ей ссылку и объяснил, какой раздел написать первым.', 'أرسل لها زميل رابطًا وشرح لها أيّ قسم تكتب أولًا.', 'Bir iş arkadaşı ona bağlantı gönderip önce hangi bölümü yazacağını açıkladı.', 'Ein Kollege schickte ihr einen Link und erklärte, welchen Abschnitt sie zuerst schreiben sollte.', 'Arsala lahā zamīlun rābiṭan wa sharaḥa lahā ayya qismin taktubu awwalan.'),
      sentence('Vazifa aniqroq bo‘lgach, Lea qoralamani o‘sha kuniyoq boshladi.', 'With the task clearer, Lea started the draft that same day.', 'Когда задача стала понятнее, Леа начала писать черновик в тот же день.', 'بعد أن اتّضحت المهمّة، بدأت ليا كتابة المسوّدة في اليوم نفسه.', 'Görev netleşince Lea taslağa aynı gün başladı.', 'Als die Aufgabe klarer war, begann Lea noch am selben Tag mit dem Entwurf.', 'Baʿda an ittaḍaḥat al-mahamma, badaʾat Liyā kitābata al-musawwada fī al-yawmi nafsihi.')
    ],
    [
      question(
        line('Qoralamani qachongacha tayyorlash kerak edi?', 'When was the draft due?', 'К какому сроку нужно было подготовить черновик?', 'متى كان موعد تسليم المسوّدة؟', 'Taslak ne zamana kadar hazırlanmalıydı?', 'Bis wann sollte der Entwurf fertig sein?'),
        line('Juma kunigacha', 'By Friday', 'К пятнице', 'بحلول يوم الجمعة', 'Cumaya kadar', 'Bis Freitag'),
        line('Yig‘ilishgacha', 'Before the meeting', 'До совещания', 'قبل الاجتماع', 'Toplantıdan önce', 'Vor der Besprechung'),
        line('Dushanba kunigacha', 'By Monday', 'К понедельнику', 'بحلول يوم الاثنين', 'Pazartesiye kadar', 'Bis Montag')),
      question(
        line('Lea nimani so‘radi?', 'What did Lea ask for?', 'О чём попросила Леа?', 'ماذا طلبت ليا؟', 'Lea ne istedi?', 'Worum bat Lea?'),
        line('Oldingi hisobotdan namuna', 'An example of a previous report', 'Пример прошлого отчёта', 'مثالًا على تقرير سابق', 'Önceki bir rapor örneği', 'Einen früheren Bericht als Beispiel'),
        line('Boshqa vazifa', 'A different task', 'Другое задание', 'مهمّة أخرى', 'Başka bir görev', 'Eine andere Aufgabe'),
        line('Ko‘proq vaqt', 'More time', 'Больше времени', 'مزيدًا من الوقت', 'Daha fazla zaman', 'Mehr Zeit')),
      question(
        line('Lea nega o‘sha kuniyoq ishni boshlay oldi?', 'Why could Lea start the same day?', 'Почему Леа смогла начать в тот же день?', 'لماذا تمكّنت ليا من البدء في اليوم نفسه؟', 'Lea neden aynı gün başlayabildi?', 'Warum konnte Lea noch am selben Tag anfangen?'),
        line('Vazifa va birinchi qadam aniq bo‘ldi.', 'She understood the task and the first step.', 'Она поняла задачу и узнала, с чего начать.', 'فهمت المهمّة وعرفت الخطوة الأولى.', 'Görevi ve ilk adımı anladı.', 'Sie verstand die Aufgabe und wusste, womit sie anfangen sollte.'),
        line('Hamkasbi hisobotni yozib bo‘lgan edi.', 'Her colleague had already written the report.', 'Коллега уже написал отчёт.', 'كان زميلها قد كتب التقرير بالفعل.', 'İş arkadaşı raporu zaten yazmıştı.', 'Ihr Kollege hatte den Bericht schon geschrieben.'),
        line('Yig‘ilish bekor qilindi.', 'The meeting was cancelled.', 'Совещание отменили.', 'أُلغي الاجتماع.', 'Toplantı iptal edildi.', 'Die Besprechung wurde abgesagt.'))
    ]),
  story('chairs', 'mint',
    line('Uchta stul', 'Three chairs', 'Три стула', 'ثلاثة كراسٍ', 'Üç sandalye', 'Drei Stühle'),
    line('Lina do‘stlari uchun joy tayyorlaydi.', 'Lina makes room for her friends.', 'Лина готовит места для друзей.', 'تهيّئ لينا مكانًا لأصدقائها.', 'Lina arkadaşlarına yer açıyor.', 'Lina macht Platz für ihre Freunde.'),
    [
      sentence('Lina kafeda.', 'Lina is in a café.', 'Лина в кафе.', 'لينا في المقهى.', 'Lina kafede.', 'Lina ist in einem Café.', 'Līnā fī al-maqhā.'),
      sentence('Uning stoli yonida ikkita stul bor.', 'There are two chairs at her table.', 'У её столика два стула.', 'عند طاولتها كرسيّان.', 'Masasının yanında iki sandalye var.', 'An ihrem Tisch stehen zwei Stühle.', 'ʿInda ṭāwilatihā kursiyyān.'),
      sentence('Lina ofitsiantga «Biz uch kishimiz», deydi.', 'Lina tells the waiter, “There are three of us.”', 'Лина говорит официанту «Нас трое».', 'تقول لينا للنادل «نحن ثلاثة».', 'Lina garsona “Biz üç kişiyiz,” diyor.', 'Lina sagt zum Kellner „Wir sind zu dritt.“', 'Taqūlu Līnā lin-nādili «Naḥnu thalātha».'),
      sentence('Ofitsiant yana bitta stul olib keladi.', 'The waiter brings another chair.', 'Официант приносит ещё один стул.', 'يحضر النادل كرسيًّا آخر.', 'Garson bir sandalye daha getiriyor.', 'Der Kellner bringt noch einen Stuhl.', 'Yuḥḍiru an-nādilu kursiyyan ākhar.'),
      sentence('Endi hamma uchun joy bor.', 'Now there’s a seat for everyone.', 'Теперь места хватает всем.', 'الآن يوجد مكان للجميع.', 'Artık herkese yer var.', 'Jetzt gibt es einen Platz für alle.', 'Al-āna yūjadu makānun lil-jamīʿ.')
    ],
    [
      question(
        line('Lina qayerda?', 'Where is Lina?', 'Где Лина?', 'أين لينا؟', 'Lina nerede?', 'Wo ist Lina?'),
        line('Kafeda', 'In a café', 'В кафе', 'في المقهى', 'Kafede', 'In einem Café'),
        line('Uyda', 'At home', 'Дома', 'في البيت', 'Evde', 'Zu Hause'),
        line('Maktabda', 'At school', 'В школе', 'في المدرسة', 'Okulda', 'In der Schule')),
      question(
        line('Avval stol yonida nechta stul bor edi?', 'How many chairs were at the table at first?', 'Сколько стульев было у столика сначала?', 'كم كرسيًّا كان عند الطاولة في البداية؟', 'Başta masanın yanında kaç sandalye vardı?', 'Wie viele Stühle standen zuerst am Tisch?'),
        line('Ikkita', 'Two', 'Два', 'كرسيّان', 'İki', 'Zwei'),
        line('Uchta', 'Three', 'Три', 'ثلاثة كراسٍ', 'Üç', 'Drei'),
        line('To‘rtta', 'Four', 'Четыре', 'أربعة كراسٍ', 'Dört', 'Vier')),
      question(
        line('Ofitsiant nima olib keldi?', 'What did the waiter bring?', 'Что принёс официант?', 'ماذا أحضر النادل؟', 'Garson ne getirdi?', 'Was brachte der Kellner?'),
        line('Yana bitta stul', 'Another chair', 'Ещё один стул', 'كرسيًّا آخر', 'Bir sandalye daha', 'Noch einen Stuhl'),
        line('Bir piyola choy', 'A cup of tea', 'Чашку чая', 'كوبًا من الشاي', 'Bir fincan çay', 'Eine Tasse Tee'),
        line('Hisobni', 'The bill', 'Счёт', 'الحساب', 'Hesabı', 'Die Rechnung'))
    ]),
  story('soup', 'peach',
    line('Oxirgi kosa sho‘rva', 'The last bowl of soup', 'Последняя порция супа', 'آخر طبق حساء', 'Son kâse çorba', 'Die letzte Schale Suppe'),
    line('Malik va Sano tushlikka nima buyurtma qilishni kelishib olishadi.', 'Malik and Sana work out what to order for lunch.', 'Малик и Сана решают, что заказать на обед.', 'يتّفق مالك وسناء على ما سيطلبانه للغداء.', 'Malik ve Sena öğle yemeğinde ne sipariş edeceklerine karar veriyor.', 'Malik und Sana entscheiden, was sie zum Mittagessen bestellen.'),
    [
      sentence('Malik va Sano kichik restoranda tushlik qilishyapti.', 'Malik and Sana are having lunch in a small restaurant.', 'Малик и Сана обедают в маленьком ресторане.', 'يتناول مالك وسناء الغداء في مطعم صغير.', 'Malik ve Sena küçük bir restoranda öğle yemeği yiyor.', 'Malik und Sana essen in einem kleinen Restaurant zu Mittag.', 'Yatanāwalu Mālikun wa Sanāʾu al-ghadāʾa fī maṭʿamin ṣaghīr.'),
      sentence('Ikkalasi ham sabzavotli sho‘rva buyurtma qilmoqchi.', 'They both want to order vegetable soup.', 'Оба хотят заказать овощной суп.', 'يريدان طلب حساء الخضار.', 'İkisi de sebze çorbası sipariş etmek istiyor.', 'Beide möchten Gemüsesuppe bestellen.', 'Yurīdāni ṭalaba ḥasāʾi al-khuḍār.'),
      sentence('Ofitsiant bir kosagina sho‘rva qolganini aytadi.', 'The waiter says there’s only one bowl of soup left.', 'Официант говорит, что осталась только одна порция супа.', 'يقول النادل إنّه لم يبقَ إلا طبق واحد من الحساء.', 'Garson sadece bir kâse çorba kaldığını söylüyor.', 'Der Kellner sagt, dass nur noch eine Schale Suppe übrig ist.', 'Yaqūlu an-nādilu innahu lam yabqa illā ṭabaqun wāḥidun mina al-ḥasāʾ.'),
      sentence('Sano guruchli baliqni, Malik esa sho‘rvani tanlaydi.', 'Sana chooses fish with rice, and Malik takes the soup.', 'Сана выбирает рыбу с рисом, а Малик берёт суп.', 'تختار سناء السمك مع الأرزّ، ويطلب مالك الحساء.', 'Sena pilavlı balığı, Malik de çorbayı seçiyor.', 'Sana nimmt Fisch mit Reis, und Malik bestellt die Suppe.', 'Takhtāru Sanāʾu as-samaka maʿa al-aruzz, wa yaṭlubu Māliku al-ḥasāʾ.'),
      sentence('Tushlikdan keyin ular bitta shirinlikni bo‘lishib yeyishadi.', 'After lunch, they share one dessert.', 'После обеда они делят один десерт на двоих.', 'بعد الغداء يتقاسمان طبقًا واحدًا من الحلوى.', 'Yemekten sonra bir tatlıyı paylaşıyorlar.', 'Nach dem Mittagessen teilen sie sich eine Nachspeise.', 'Baʿda al-ghadāʾi yataqāsamāni ṭabaqan wāḥidan mina al-ḥalwā.')
    ],
    [
      question(
        line('Avval ikkalasi nima buyurtma qilmoqchi edi?', 'What did they both want to order at first?', 'Что оба сначала хотели заказать?', 'ماذا أراد كلاهما أن يطلب في البداية؟', 'Başta ikisi de ne sipariş etmek istiyordu?', 'Was wollten beide zuerst bestellen?'),
        line('Sabzavotli sho‘rva', 'Vegetable soup', 'Овощной суп', 'حساء الخضار', 'Sebze çorbası', 'Gemüsesuppe'),
        line('Guruchli baliq', 'Fish with rice', 'Рыбу с рисом', 'سمكًا مع الأرزّ', 'Pilavlı balık', 'Fisch mit Reis'),
        line('Tovuqli salat', 'Chicken salad', 'Салат с курицей', 'سلطة الدجاج', 'Tavuklu salata', 'Hähnchensalat')),
      question(
        line('Nega Sano boshqa taom tanladi?', 'Why did Sana choose a different dish?', 'Почему Сана выбрала другое блюдо?', 'لماذا اختارت سناء طبقًا آخر؟', 'Sena neden başka bir yemek seçti?', 'Warum wählte Sana ein anderes Gericht?'),
        line('Bir kosagina sho‘rva qolgandi.', 'There was only one bowl of soup left.', 'Осталась только одна порция супа.', 'لم يبقَ إلا طبق واحد من الحساء.', 'Sadece bir kâse çorba kalmıştı.', 'Es war nur noch eine Schale Suppe übrig.'),
        line('Ofitsiant sho‘rvani juda achchiq dedi.', 'The waiter said the soup was very spicy.', 'Официант сказал, что суп очень острый.', 'قال النادل إنّ الحساء حارّ جدًّا.', 'Garson çorbanın çok acı olduğunu söyledi.', 'Der Kellner sagte, die Suppe sei sehr scharf.'),
        line('Malik baliqni tanlagandi.', 'Malik had chosen the fish.', 'Малик выбрал рыбу.', 'كان مالك قد اختار السمك.', 'Malik balığı seçmişti.', 'Malik hatte den Fisch gewählt.')),
      question(
        line('Tushlikdan keyin ular nimani bo‘lishdi?', 'What did they share after lunch?', 'Что они поделили после обеда?', 'ماذا تقاسما بعد الغداء؟', 'Öğle yemeğinden sonra neyi paylaştılar?', 'Was teilten sie sich nach dem Mittagessen?'),
        line('Bitta shirinlikni', 'One dessert', 'Один десерт', 'طبقًا واحدًا من الحلوى', 'Bir tatlıyı', 'Eine Nachspeise'),
        line('Bir kosa sho‘rvani', 'A bowl of soup', 'Порцию супа', 'طبق حساء', 'Bir kâse çorbayı', 'Eine Schale Suppe'),
        line('Bir tovoq salatni', 'A plate of salad', 'Тарелку салата', 'طبق سلطة', 'Bir tabak salatayı', 'Einen Teller Salat'))
    ]),
  story('route-home', 'sky',
    line('Yo‘l tanlash', 'Two ways home', 'Две дороги домой', 'طريقان إلى البيت', 'Eve dönmenin iki yolu', 'Zwei Wege nach Hause'),
    line('Ra’no va Emil konsertdan keyin uyga qanday qaytishni hal qilishadi.', 'Rana and Emil weigh their options after a concert.', 'Рана и Эмиль решают, как добраться домой после концерта.', 'توازن رنا وإميل بين خيارات العودة بعد حفل موسيقيّ.', 'Rana ve Emil konserden sonra eve nasıl döneceklerini düşünüyor.', 'Rana und Emil wägen nach einem Konzert ihre Möglichkeiten ab.'),
    [
      sentence('Ra’no bilan Emil konsert tugagach, uyga yo‘l olishdi.', 'Rana and Emil set off for home when the concert ended.', 'Когда концерт закончился, Рана и Эмиль отправились домой.', 'انطلقت رنا وإميل إلى البيت بعد انتهاء الحفل.', 'Konser bitince Rana ile Emil eve doğru yola çıktı.', 'Nach dem Konzert machten sich Rana und Emil auf den Heimweg.', 'Inṭalaqat Ranā wa Imīl ilā al-bayti baʿda intihāʾi al-ḥafl.'),
      sentence('Konsert zali oldida avtobus bekati bor edi, ammo mashinalar yigirma daqiqadan beri zo‘rg‘a siljiyotgandi.', 'There was a bus stop outside the hall, but traffic had barely moved for twenty minutes.', 'У концертного зала была остановка, но машины уже двадцать минут почти не двигались.', 'كان هناك موقف للحافلات أمام القاعة، لكنّ حركة السير بالكاد تقدّمت منذ عشرين دقيقة.', 'Konser salonunun önünde durak vardı ama trafik yirmi dakikadır neredeyse hiç ilerlemiyordu.', 'Vor der Konzerthalle gab es eine Bushaltestelle, aber der Verkehr kam seit zwanzig Minuten kaum voran.', 'Kāna hunāka mawqifun lil-ḥāfilāti amāma al-qāʿa, lākinna ḥarakata as-sayri bil-kādi taqaddamat mundhu ʿishrīna daqīqa.'),
      sentence('Poyezd tezroq edi, biroq bekatgacha o‘n daqiqa piyoda yurish kerak edi.', 'The train was faster, but the station was a ten-minute walk away.', 'Поезд был быстрее, но до станции нужно было идти десять минут.', 'كان القطار أسرع، لكنّ المحطّة كانت على بُعد عشر دقائق سيرًا.', 'Tren daha hızlıydı ama istasyona yürümek on dakika sürüyordu.', 'Der Zug war schneller, aber bis zum Bahnhof waren es zehn Minuten zu Fuß.', 'Kāna al-qiṭāru asraʿa, lākinna al-maḥaṭṭata kānat ʿalā buʿdi ʿashri daqāʾiqa sayran.'),
      sentence('Emil tirbandlikda qolmaslik uchun vokzalgacha piyoda borishni taklif qildi.', 'Emil suggested walking to the station to avoid getting stuck in traffic.', 'Эмиль предложил дойти до станции пешком, чтобы не застрять в пробке.', 'اقترح إميل المشي إلى المحطّة لتجنّب الازدحام.', 'Emil trafikte kalmamak için istasyona yürümeyi önerdi.', 'Emil schlug vor, zum Bahnhof zu laufen, um den Stau zu umgehen.', 'Iqtaraḥa Imīl al-mashya ilā al-maḥaṭṭati litajannubi al-izdiḥām.'),
      sentence('Ular kutganidan ertaroq uyga yetib kelishdi va keyingi safar ham poyezdda ketishga kelishib olishdi.', 'They got home earlier than expected and agreed to take the train next time too.', 'Они добрались домой раньше, чем ожидали, и решили в следующий раз тоже поехать на поезде.', 'وصلا إلى البيت أبكر ممّا توقّعا واتّفقا على ركوب القطار في المرّة القادمة أيضًا.', 'Eve beklediklerinden daha erken vardılar ve bir dahaki sefere de trene binmeye karar verdiler.', 'Sie kamen früher als erwartet nach Hause und beschlossen, beim nächsten Mal wieder den Zug zu nehmen.', 'Waṣalā ilā al-bayti abkara mimmā tawaqqaʿā wattafaqā ʿalā rukūbi al-qiṭāri fī al-marrati al-qādimati ayḍan.')
    ],
    [
      question(
        line('Poyezd bekatigacha piyoda qancha vaqt ketardi?', 'How long was the walk to the train station?', 'Сколько нужно было идти до станции?', 'كم كان يستغرق المشي إلى المحطّة؟', 'Tren istasyonuna yürümek ne kadar sürüyordu?', 'Wie lange dauerte der Fußweg zum Bahnhof?'),
        line('O‘n daqiqa', 'Ten minutes', 'Десять минут', 'عشر دقائق', 'On dakika', 'Zehn Minuten'),
        line('Yigirma daqiqa', 'Twenty minutes', 'Двадцать минут', 'عشرون دقيقة', 'Yirmi dakika', 'Zwanzig Minuten'),
        line('Yarim soat', 'Half an hour', 'Полчаса', 'نصف ساعة', 'Yarım saat', 'Eine halbe Stunde')),
      question(
        line('Nega Emil piyoda borishni taklif qildi?', 'Why did Emil suggest walking to the station?', 'Почему Эмиль предложил дойти до станции пешком?', 'لماذا اقترح إميل المشي إلى المحطّة؟', 'Emil neden istasyona yürümeyi önerdi?', 'Warum schlug Emil vor, zum Bahnhof zu laufen?'),
        line('U tirbandlikda qolishni istamadi.', 'He wanted to avoid getting stuck in traffic.', 'Он хотел избежать пробки.', 'أراد تجنّب الازدحام.', 'Trafikte kalmak istemedi.', 'Er wollte den Stau umgehen.'),
        line('Avtobus bekati yopiq edi.', 'The bus stop was closed.', 'Остановка была закрыта.', 'كان موقف الحافلات مغلقًا.', 'Otobüs durağı kapalıydı.', 'Die Bushaltestelle war gesperrt.'),
        line('U konsert zaliga qaytmoqchi edi.', 'He wanted to return to the concert hall.', 'Он хотел вернуться в концертный зал.', 'أراد العودة إلى قاعة الحفل.', 'Konser salonuna dönmek istiyordu.', 'Er wollte zur Konzerthalle zurück.')),
      question(
        line('Keyingi safar qaysi transportda ketishga kelishishdi?', 'Which transport did they agree to take next time?', 'На чём они решили поехать в следующий раз?', 'بأيّ وسيلة اتّفقا على العودة في المرّة القادمة؟', 'Bir dahaki sefere neye binmeye karar verdiler?', 'Womit wollten sie beim nächsten Mal fahren?'),
        line('Poyezdda', 'The train', 'На поезде', 'بالقطار', 'Trene', 'Mit dem Zug'),
        line('Avtobusda', 'The bus', 'На автобусе', 'بالحافلة', 'Otobüse', 'Mit dem Bus'),
        line('Taksida', 'A taxi', 'На такси', 'بسيارة أجرة', 'Taksiye', 'Mit dem Taxi'))
    ]),
  story('shelf-pilot', 'lilac',
    line('Avval bitta tokcha', 'One shelf to start', 'Для начала одна полка', 'رفّ واحد في البداية', 'Başlangıç için bir raf', 'Ein Regalbrett für den Anfang'),
    line('Mahalla ahli kitob almashish uchun kichik sinovdan boshlaydi.', 'A neighborhood group starts small with a book exchange.', 'Жители района пробуют организовать обмен книгами в небольшом масштабе.', 'تبدأ مجموعة من سكّان الحيّ بتجربة صغيرة لتبادل الكتب.', 'Mahalle grubu kitap takasına küçük bir denemeyle başlıyor.', 'Eine Nachbarschaftsgruppe beginnt ihren Büchertausch mit einem kleinen Versuch.'),
    [
      sentence('Mahalla aholisi kitob almashish uchun joy ochmoqchi edi.', 'The neighborhood group wanted to set up a place to exchange books.', 'Жители района хотели открыть место для обмена книгами.', 'أرادت مجموعة من سكّان الحيّ إنشاء مكان لتبادل الكتب.', 'Mahalle grubu kitap takası için bir yer açmak istiyordu.', 'Die Nachbarschaftsgruppe wollte einen Ort zum Büchertausch einrichten.', 'Arādat majmūʿatun min sukkāni al-ḥayyi inshāʾa makānin litabāduli al-kutub.'),
      sentence('Sofiya bo‘sh xonaga javonlar qo‘yishni taklif qildi, ammo Umar ko‘ngillilarning butun xonaga qarashga vaqti yetmasligidan xavotirlandi.', 'Sofia suggested putting shelves in an empty room, but Omar worried the volunteers wouldn’t have time to look after the whole room.', 'София предложила поставить стеллажи в пустой комнате, но Омар сомневался, что у волонтёров хватит времени следить за всем помещением.', 'اقترحت صوفيا وضع رفوف في غرفة فارغة، لكنّ عمر خشي ألّا يجد المتطوّعون وقتًا للاعتناء بالغرفة كلّها.', 'Sofya boş bir odaya raflar koymayı önerdi ama Ömer gönüllülerin bütün odayla ilgilenmeye vakit bulamayacağından endişeliydi.', 'Sofia schlug vor, Regale in einen leeren Raum zu stellen, doch Omar bezweifelte, dass die Freiwilligen Zeit hätten, sich um den ganzen Raum zu kümmern.', 'Iqtaraḥat Ṣūfiyā waḍʿa rufūfin fī ghurfatin fārigha, lākinna ʿUmara khashiya allā yajida al-mutaṭawwiʿūna waqtan lil-iʿtināʾi bil-ghurfati kullihā.'),
      sentence('Ular kirish joyi yonida bitta tokchani ikki hafta sinab ko‘rishga kelishishdi.', 'They agreed to try one shelf by the entrance for two weeks.', 'Они договорились на две недели поставить одну полку у входа.', 'اتّفقوا على تجربة رفّ واحد بجانب المدخل لمدّة أسبوعين.', 'Girişin yanına bir raf koyup iki hafta denemeye karar verdiler.', 'Sie einigten sich darauf, zwei Wochen lang ein Regalbrett am Eingang auszuprobieren.', 'Ittafaqū ʿalā tajribati raffin wāḥidin bijānibi al-madkhali limuddati usbūʿayn.'),
      sentence('Sofiya yozuv tayyorladi, Umar esa tokchani har juma tekshirib turdi.', 'Sofia made a sign, and Omar checked the shelf every Friday.', 'София сделала табличку, а Омар проверял полку каждую пятницу.', 'أعدّت صوفيا لافتة، وكان عمر يتفقّد الرفّ كلّ يوم جمعة.', 'Sofya bir tabela hazırladı, Ömer ise rafı her cuma kontrol etti.', 'Sofia machte ein Schild, und Omar schaute jeden Freitag nach dem Regalbrett.', 'Aʿaddat Ṣūfiyā lāfita, wa kāna ʿUmaru yatafaqqadu ar-raffa kulla yawmi jumʿa.'),
      sentence('Ikki haftadan keyin aksariyat kitoblar yangi o‘quvchilar qo‘lida edi, tokchaga qarash ham ko‘p vaqt olmayotgandi.', 'After two weeks, most books had found new readers and looking after the shelf was taking little time.', 'Через две недели большинство книг нашло новых читателей, а уход за полкой занимал мало времени.', 'بعد أسبوعين، وجدت معظم الكتب قرّاءً جددًا، ولم تستغرق العناية بالرفّ وقتًا طويلًا.', 'İki hafta sonra kitapların çoğu yeni okurlar bulmuştu ve rafla ilgilenmek fazla vakit almıyordu.', 'Nach zwei Wochen hatten die meisten Bücher neue Leser gefunden, und die Betreuung des Regalbretts kostete wenig Zeit.', 'Baʿda usbūʿayn, wajadat muʿẓamu al-kutubi qurrāʾan jududan, wa lam tastaghriqi al-ʿināyatu bir-raffi waqtan ṭawīlan.'),
      sentence('Shundan keyin mahalla aholisi ikkinchi tokchani qo‘shishga qaror qildi.', 'The group then decided to add a second shelf.', 'После этого жители решили добавить вторую полку.', 'بعد ذلك قرّرت المجموعة إضافة رفّ ثانٍ.', 'Grup bunun üzerine ikinci bir raf eklemeye karar verdi.', 'Daraufhin beschloss die Gruppe, ein zweites Regalbrett hinzuzufügen.', 'Baʿda dhālika qarrarat al-majmūʿatu iḍāfata raffin thānin.')
    ],
    [
      question(
        line('Umar avval nimadan xavotirlandi?', 'What was Omar worried about at first?', 'Что сначала беспокоило Омара?', 'ما الذي أقلق عمر في البداية؟', 'Ömer başta neden endişelendi?', 'Was machte Omar zunächst Sorgen?'),
        line('Ko‘ngillilarning butun xonaga qarashga vaqti yetmasligi mumkin edi.', 'The volunteers might lack time to look after a whole room.', 'У волонтёров могло не хватить времени следить за всем помещением.', 'قد لا يجد المتطوّعون وقتًا للاعتناء بالغرفة كلّها.', 'Gönüllülerin bütün odayla ilgilenmeye vakti yetmeyebilirdi.', 'Die Freiwilligen könnten zu wenig Zeit haben, um sich um einen ganzen Raum zu kümmern.'),
        line('Kirish joyi yonida tokcha uchun joy yo‘q edi.', 'There was no room for a shelf by the entrance.', 'У входа не было места для полки.', 'لم يكن هناك مكان لرفّ بجانب المدخل.', 'Girişin yanında raf için yer yoktu.', 'Am Eingang war kein Platz für ein Regalbrett.'),
        line('Mahalla aholisi yozuvni o‘qiy olmasdi.', 'The neighbors might have trouble reading the sign.', 'Жителям могло быть трудно прочитать табличку.', 'قد يصعب على السكّان قراءة اللافتة.', 'Mahalle sakinleri tabelayı okumakta zorlanabilirdi.', 'Die Nachbarn könnten Schwierigkeiten haben, das Schild zu lesen.')),
      question(
        line('Sinov davomida Umar nima qildi?', 'What did Omar do during the trial?', 'Что делал Омар во время пробного запуска?', 'ماذا فعل عمر أثناء التجربة؟', 'Ömer deneme sırasında ne yaptı?', 'Was machte Omar während des Versuchs?'),
        line('Tokchani har juma tekshirdi.', 'He checked the shelf every Friday.', 'Каждую пятницу проверял полку.', 'كان يتفقّد الرفّ كلّ يوم جمعة.', 'Rafı her cuma kontrol etti.', 'Er schaute jeden Freitag nach dem Regalbrett.'),
        line('Kirish joyiga yozuv tayyorladi.', 'He made the sign for the entrance.', 'Сделал табличку для входа.', 'أعدّ اللافتة للمدخل.', 'Giriş için tabela hazırladı.', 'Er machte das Schild für den Eingang.'),
        line('Butun xonaga javonlar o‘rnatdi.', 'He put up shelves throughout the room.', 'Поставил стеллажи во всей комнате.', 'ركّب رفوفًا في الغرفة كلّها.', 'Bütün odaya raflar yerleştirdi.', 'Er stellte im ganzen Raum Regale auf.')),
      question(
        line('Nega ular ikkinchi tokchani qo‘shishga qaror qilishdi?', 'Why did the group decide to add a second shelf?', 'Почему жители решили добавить вторую полку?', 'لماذا قرّرت المجموعة إضافة رفّ ثانٍ؟', 'Grup neden ikinci bir raf eklemeye karar verdi?', 'Warum beschloss die Gruppe, ein zweites Regalbrett hinzuzufügen?'),
        line('Kitoblarning aksariyati o‘z o‘quvchisini topdi, tokchaga qarash esa ko‘p vaqt olmadi.', 'Most books found readers, and looking after the shelf took little time.', 'Большинство книг нашло читателей, а уход за полкой занимал мало времени.', 'وجدت معظم الكتب قرّاءً، ولم تستغرق العناية بالرفّ وقتًا طويلًا.', 'Kitapların çoğu okur buldu ve rafla ilgilenmek fazla vakit almadı.', 'Die meisten Bücher fanden Leser, und die Betreuung kostete wenig Zeit.'),
        line('Hamma kitoblar tokchada qolib ketdi.', 'All the books stayed on the shelf.', 'Все книги так и остались на полке.', 'بقيت جميع الكتب على الرفّ.', 'Bütün kitaplar rafta kaldı.', 'Alle Bücher blieben auf dem Regalbrett.'),
        line('Sofiya ikkinchi xonani tayyorlab qo‘ydi.', 'Sofia got a second room ready.', 'София подготовила вторую комнату.', 'جهّزت صوفيا غرفة ثانية.', 'Sofya ikinci bir odayı hazırladı.', 'Sofia richtete einen zweiten Raum her.'))
    ]),
  story('blue-cup', 'mint',
    line('Ko‘k piyola', 'The blue cup', 'Синяя чашка', 'الكوب الأزرق', 'Mavi fincan', 'Die blaue Tasse'),
    line('Ada o‘z piyolasini topadi.', 'Ada finds her cup.', 'Ада находит свою чашку.', 'تجد آدا كوبها.', 'Ada fincanını buluyor.', 'Ada findet ihre Tasse.'),
    [
      sentence('Ada uyda.', 'Ada is at home.', 'Ада дома.', 'آدا في البيت.', 'Ada evde.', 'Ada ist zu Hause.', 'Ādā fī al-bayt.'),
      sentence('Ko‘k piyola stol ustida.', 'The blue cup is on the table.', 'Синяя чашка на столе.', 'الكوب الأزرق على الطاولة.', 'Mavi fincan masanın üstünde.', 'Die blaue Tasse steht auf dem Tisch.', 'Al-kūbu al-azraqu ʿalā aṭ-ṭāwila.'),
      sentence('Qizil kitob Adaning akasiniki.', 'The red book belongs to Ada’s older brother.', 'Красная книга принадлежит старшему брату Ады.', 'الكتاب الأحمر لأخي آدا الأكبر.', 'Kırmızı kitap Ada’nın ağabeyinin.', 'Das rote Buch gehört Adas älterem Bruder.', 'Al-kitābu al-aḥmaru li-akhī Ādā al-akbar.'),
      sentence('Ada ko‘k piyoladan choy ichadi.', 'Ada drinks tea from the blue cup.', 'Ада пьёт чай из синей чашки.', 'تشرب آدا الشاي من الكوب الأزرق.', 'Ada mavi fincandan çay içiyor.', 'Ada trinkt Tee aus der blauen Tasse.', 'Tashrabu Ādā ash-shāya mina al-kūbi al-azraq.')
    ],
    [
      question(
        line('Piyola qanday rangda?', 'What color is the cup?', 'Какого цвета чашка?', 'ما لون الكوب؟', 'Fincan ne renk?', 'Welche Farbe hat die Tasse?'),
        line('Ko‘k', 'Blue', 'Синяя', 'أزرق', 'Mavi', 'Blau'),
        line('Qizil', 'Red', 'Красная', 'أحمر', 'Kırmızı', 'Rot'),
        line('Oq', 'White', 'Белая', 'أبيض', 'Beyaz', 'Weiß')),
      question(
        line('Piyola qayerda?', 'Where is the cup?', 'Где чашка?', 'أين الكوب؟', 'Fincan nerede?', 'Wo steht die Tasse?'),
        line('Stol ustida', 'On the table', 'На столе', 'على الطاولة', 'Masanın üstünde', 'Auf dem Tisch'),
        line('Sumkada', 'In the bag', 'В сумке', 'في الحقيبة', 'Çantada', 'In der Tasche'),
        line('Deraza yonida', 'By the window', 'У окна', 'بجانب النافذة', 'Pencerenin yanında', 'Am Fenster')),
      question(
        line('Qizil kitob kimniki?', 'Who owns the red book?', 'Чья красная книга?', 'لمن الكتاب الأحمر؟', 'Kırmızı kitap kimin?', 'Wem gehört das rote Buch?'),
        line('Adaning akasiniki', 'Ada’s older brother', 'Старшего брата Ады', 'لأخي آدا الأكبر', 'Ada’nın ağabeyinin', 'Adas älterem Bruder'),
        line('Adaniki', 'Ada', 'Ады', 'لآدا', 'Ada’nın', 'Ada'),
        line('Adaning onasiniki', 'Ada’s mother', 'Мамы Ады', 'لأمّ آدا', 'Ada’nın annesinin', 'Adas Mutter'))
    ]),
  story('riverside', 'sky',
    line('Daryo bo‘yidagi sayr', 'A riverside walk', 'Прогулка у реки', 'نزهة بجانب النهر', 'Nehir kıyısında yürüyüş', 'Ein Spaziergang am Fluss'),
    line('Mira va Ali dam olish uchun daryo bo‘yiga borishadi.', 'Mira and Ali go to the river for a break.', 'Мира и Али идут к реке отдохнуть.', 'تذهب ميرا مع عليّ إلى النهر للاستراحة.', 'Mira ile Ali biraz dinlenmek için nehir kıyısına gidiyor.', 'Mira und Ali gehen zur Erholung an den Fluss.'),
    [
      sentence('Yakshanba kuni Mira va Ali daryo bo‘yida sayr qilishadi.', 'On Sunday, Mira and Ali take a walk along the river.', 'В воскресенье Мира и Али гуляют вдоль реки.', 'يوم الأحد تتنزّه ميرا مع عليّ على ضفّة النهر.', 'Pazar günü Mira ile Ali nehir kıyısında yürüyor.', 'Am Sonntag gehen Mira und Ali am Fluss spazieren.', 'Yawma al-aḥadi tatanazzahu Mīrā maʿa ʿAlī ʿalā ḍiffati an-nahr.'),
      sentence('Ular daraxt tagidagi skameykaga o‘tirishadi.', 'They sit on a bench under a tree.', 'Они садятся на скамейку под деревом.', 'يجلسان على مقعد تحت شجرة.', 'Bir ağacın altındaki banka oturuyorlar.', 'Sie setzen sich auf eine Bank unter einem Baum.', 'Yajlisāni ʿalā maqʿadin taḥta shajara.'),
      sentence('Birozdan keyin yomg‘ir boshlanadi.', 'A little later, it starts to rain.', 'Через некоторое время начинается дождь.', 'بعد قليل يبدأ المطر.', 'Biraz sonra yağmur başlıyor.', 'Kurz darauf fängt es an zu regnen.', 'Baʿda qalīlin yabdaʾu al-maṭar.'),
      sentence('Ali soyabonni ochadi va ular uyga qaytishadi.', 'Ali opens the umbrella, and they go home.', 'Али раскрывает зонт, и они возвращаются домой.', 'يفتح عليّ المظلّة ويعودان إلى البيت.', 'Ali şemsiyeyi açıyor ve eve dönüyorlar.', 'Ali spannt den Regenschirm auf, und sie gehen nach Hause.', 'Yaftaḥu ʿAlī al-miẓallata wa yaʿūdāni ilā al-bayt.')
    ],
    [
      question(
        line('Ular qaysi kuni sayr qilishadi?', 'Which day do they go for a walk?', 'В какой день они идут гулять?', 'في أيّ يوم يتنزّهان؟', 'Hangi gün yürüyüşe çıkıyorlar?', 'An welchem Tag gehen sie spazieren?'),
        line('Yakshanba', 'Sunday', 'Воскресенье', 'الأحد', 'Pazar', 'Sonntag'),
        line('Seshanba', 'Tuesday', 'Вторник', 'الثلاثاء', 'Salı', 'Dienstag'),
        line('Juma', 'Friday', 'Пятница', 'الجمعة', 'Cuma', 'Freitag')),
      question(
        line('Ular qayerga o‘tirishadi?', 'Where do they sit?', 'Куда они садятся?', 'أين يجلسان؟', 'Nereye oturuyorlar?', 'Wohin setzen sie sich?'),
        line('Daraxt tagidagi skameykaga', 'On a bench under a tree', 'На скамейку под деревом', 'على مقعد تحت شجرة', 'Ağacın altındaki banka', 'Auf eine Bank unter einem Baum'),
        line('Uy yonidagi zinaga', 'On the steps by the house', 'На ступеньки у дома', 'على الدرج بجانب البيت', 'Evin yanındaki merdivene', 'Auf die Stufen am Haus'),
        line('Ko‘prik yonidagi toshga', 'On a stone by the bridge', 'На камень у моста', 'على حجر قرب الجسر', 'Köprünün yanındaki taşa', 'Auf einen Stein an der Brücke')),
      question(
        line('Ali nimani ochadi?', 'What does Ali open?', 'Что открывает Али?', 'ماذا يفتح عليّ؟', 'Ali neyi açıyor?', 'Was öffnet Ali?'),
        line('Soyabonni', 'An umbrella', 'Зонт', 'مظلّة', 'Şemsiyeyi', 'Einen Regenschirm'),
        line('Kitobni', 'A book', 'Книгу', 'كتابًا', 'Kitabı', 'Ein Buch'),
        line('Eshikni', 'A door', 'Дверь', 'بابًا', 'Kapıyı', 'Eine Tür'))
    ]),
  story('last-loaf', 'peach',
    line('Oxirgi non', 'The last loaf', 'Последняя буханка', 'الرغيف الأخير', 'Son ekmek', 'Das letzte Brot'),
    line('Nodira nonushta uchun non olgani boradi.', 'Nodira goes to buy bread for breakfast.', 'Нодира идёт за хлебом к завтраку.', 'تذهب نوديرا لشراء الخبز للفطور.', 'Nodira kahvaltı için ekmek almaya gider.', 'Nodira geht Brot fürs Frühstück kaufen.'),
    [
      sentence('Nodira ertalab nonvoyxonaga bordi.', 'Nodira went to the bakery in the morning.', 'Утром Нодира пошла в пекарню.', 'ذهبت نوديرا إلى المخبز صباحًا.', 'Nodira sabah fırına gitti.', 'Nodira ging am Morgen zur Bäckerei.', 'Dhahabat Nūdīrā ilā al-makhbazi ṣabāḥan.'),
      sentence('Nonvoyning bitta butun donli noni va uchta bageti qolgan edi.', 'The baker had one loaf of whole-grain bread and three baguettes left.', 'У пекаря остались одна буханка цельнозернового хлеба и три багета.', 'بقي لدى الخبّاز رغيف واحد من خبز الحبوب الكاملة وثلاثة أرغفة باغيت.', 'Fırıncıda bir tam tahıllı ekmek ve üç baget kalmıştı.', 'Der Bäcker hatte noch ein Vollkornbrot und drei Baguettes.', 'Baqiya ladā al-khabbāzi raghīfun wāḥidun min khubzi al-ḥubūbi al-kāmilati wa-thalāthatu arghifati bāghīt.'),
      sentence('Nodira butun donli nonni tanladi va uni tilimlab berishni so‘radi.', 'Nodira chose the whole-grain bread and asked the baker to slice it.', 'Нодира выбрала цельнозерновой хлеб и попросила пекаря нарезать его.', 'اختارت نوديرا خبز الحبوب الكاملة وطلبت من الخبّاز أن يقطّعه إلى شرائح.', 'Nodira tam tahıllı ekmeği seçti ve fırıncıdan onu dilimlemesini istedi.', 'Nodira wählte das Vollkornbrot und bat den Bäcker, es in Scheiben zu schneiden.', 'Ikhtārat Nūdīrā khubza al-ḥubūbi al-kāmilati wa-ṭalabat mina al-khabbāzi an yuqaṭṭiʿahu ilā sharāʾiḥ.'),
      sentence('U nonni uyga olib borib, ukasi bilan nonushta qildi.', 'She took the bread home and had breakfast with her younger brother.', 'Она принесла хлеб домой и позавтракала с младшим братом.', 'أخذت الخبز إلى البيت وتناولت الفطور مع أخيها الأصغر.', 'Ekmeği eve götürdü ve erkek kardeşiyle kahvaltı yaptı.', 'Sie nahm das Brot mit nach Hause und frühstückte mit ihrem jüngeren Bruder.', 'Akhadhat al-khubza ilā al-bayti wa-tanāwalat al-faṭūra maʿa akhīhā al-aṣghar.')
    ],
    [
      question(
        line('Nodira nonvoyxonaga qachon bordi?', 'When did Nodira go to the bakery?', 'Когда Нодира пошла в пекарню?', 'متى ذهبت نوديرا إلى المخبز؟', 'Nodira fırına ne zaman gitti?', 'Wann ging Nodira zur Bäckerei?'),
        line('Ertalab', 'In the morning', 'Утром', 'صباحًا', 'Sabah', 'Am Morgen'),
        line('Tushda', 'At noon', 'В полдень', 'ظهرًا', 'Öğle vakti', 'Mittags'),
        line('Kechqurun', 'In the evening', 'Вечером', 'مساءً', 'Akşam', 'Am Abend')),
      question(
        line('Nodira qaysi nonni tanladi?', 'Which bread did Nodira choose?', 'Какой хлеб выбрала Нодира?', 'أيّ خبز اختارت نوديرا؟', 'Nodira hangi ekmeği seçti?', 'Welches Brot wählte Nodira?'),
        line('Butun donli nonni', 'Whole-grain bread', 'Цельнозерновой хлеб', 'خبز الحبوب الكاملة', 'Tam tahıllı ekmeği', 'Das Vollkornbrot'),
        line('Bagetni', 'A baguette', 'Багет', 'رغيف باغيت', 'Bageti', 'Ein Baguette'),
        line('Bulochkani', 'A bread roll', 'Булочку', 'لفافة خبز', 'Küçük ekmeği', 'Ein Brötchen')),
      question(
        line('U nonvoydan nima qilishni so‘radi?', 'What did she ask the baker to do?', 'О чём она попросила пекаря?', 'ماذا طلبت من الخبّاز أن يفعل؟', 'Fırıncıdan ne yapmasını istedi?', 'Worum bat sie den Bäcker?'),
        line('Nonni tilimlashni', 'Slice the bread', 'Нарезать хлеб', 'أن يقطّع الخبز إلى شرائح', 'Ekmeği dilimlemesini', 'Das Brot in Scheiben zu schneiden'),
        line('Nonni isitishni', 'Warm the bread', 'Подогреть хлеб', 'أن يسخّن الخبز', 'Ekmeği ısıtmasını', 'Das Brot aufzuwärmen'),
        line('Nonni tortib berishni', 'Weigh the bread', 'Взвесить хлеб', 'أن يزن الخبز', 'Ekmeği tartmasını', 'Das Brot zu wiegen'))
    ]),
  story('library-card', 'sky',
    line('Yangi kutubxona guvohnomasi', 'A new library card', 'Новый читательский билет', 'بطاقة مكتبة جديدة', 'Yeni bir kütüphane kartı', 'Ein neuer Bibliotheksausweis'),
    line('Timur kitob olish uchun kutubxonaga boradi.', 'Timur visits the library to borrow a book.', 'Тимур идёт в библиотеку за книгой.', 'يذهب تيمور إلى المكتبة ليستعير كتابًا.', 'Timur kitap ödünç almak için kütüphaneye gider.', 'Timur geht in die Bibliothek, um ein Buch auszuleihen.'),
    [
      sentence('Timur yangi kutubxonadan birinchi marta kitob olmoqchi bo‘ldi.', 'Timur wanted to borrow a book from the new library for the first time.', 'Тимур хотел впервые взять книгу в новой библиотеке.', 'أراد تيمور أن يستعير كتابًا من المكتبة الجديدة لأوّل مرّة.', 'Timur yeni kütüphaneden ilk kez kitap ödünç almak istedi.', 'Timur wollte zum ersten Mal ein Buch aus der neuen Bibliothek ausleihen.', 'Arāda Tīmūr an yastaʿīra kitāban mina al-maktabati al-jadīdati li-awwali marra.'),
      sentence('Kutubxonachi undan shaxsini tasdiqlovchi hujjatini so‘radi va unga kutubxona guvohnomasini berdi.', 'The librarian asked for his ID and gave him a library card.', 'Библиотекарь попросила его показать удостоверение личности и выдала ему читательский билет.', 'طلبت منه أمينة المكتبة هويّته وأعطته بطاقة المكتبة.', 'Kütüphane görevlisi kimliğini istedi ve ona bir kütüphane kartı verdi.', 'Die Bibliothekarin bat ihn um seinen Personalausweis und gab ihm einen Bibliotheksausweis.', 'Ṭalabat minhu amīnatu al-maktabati huwiyyatahu wa-aʿṭat-hu biṭāqata al-maktaba.'),
      sentence('Timur bittagina kitob olmoqchi edi, lekin ikkinchi qavatdan ikkita qiziqarli kitob topdi.', 'Timur meant to borrow just one book, but he found two interesting books on the second floor.', 'Тимур собирался взять только одну книгу, но на втором этаже нашёл две интересные книги.', 'كان تيمور ينوي استعارة كتاب واحد فقط، لكنّه وجد كتابين ممتعين في الطابق الثاني.', 'Timur yalnızca bir kitap almayı düşünüyordu ama ikinci katta iki ilginç kitap buldu.', 'Timur wollte nur ein Buch ausleihen, fand aber im zweiten Stock zwei interessante Bücher.', 'Kāna Tīmūr yanwī istiʿārata kitābin wāḥidin faqaṭ, lākinna-hu wajada kitābayni mumtiʿayni fī aṭ-ṭābiqi ath-thānī.'),
      sentence('U ikkala kitobni ham oldi va ularni kelasi payshanba kuni qaytarishi kerakligini yozib qo‘ydi.', 'He borrowed both books and wrote down that they were due next Thursday.', 'Он взял обе книги и записал, что их нужно вернуть в следующий четверг.', 'استعار الكتابين ودوّن أنّ عليه إعادتهما يوم الخميس المقبل.', 'İki kitabı da ödünç aldı ve onları gelecek perşembe iade etmesi gerektiğini not etti.', 'Er lieh beide Bücher aus und schrieb auf, dass er sie nächsten Donnerstag zurückgeben musste.', 'Istaʿāra al-kitābayni wa-dawwana anna ʿalayhi iʿādatahumā yawma al-khamīsi al-muqbil.')
    ],
    [
      question(
        line('Kutubxonachi Timurdan nimani so‘radi?', 'What did the librarian ask Timur for?', 'Что библиотекарь попросила у Тимура?', 'ماذا طلبت أمينة المكتبة من تيمور؟', 'Kütüphane görevlisi Timur’dan ne istedi?', 'Worum bat die Bibliothekarin Timur?'),
        line('Shaxsini tasdiqlovchi hujjatini', 'His ID', 'Удостоверение личности', 'هويّته', 'Kimliğini', 'Um seinen Personalausweis'),
        line('Telefon raqamini', 'His phone number', 'Номер телефона', 'رقم هاتفه', 'Telefon numarasını', 'Um seine Telefonnummer'),
        line('Uy manzilini', 'His home address', 'Домашний адрес', 'عنوان منزله', 'Ev adresini', 'Um seine Wohnadresse')),
      question(
        line('Timur nechta kitob oldi?', 'How many books did Timur borrow?', 'Сколько книг взял Тимур?', 'كم كتابًا استعار تيمور؟', 'Timur kaç kitap ödünç aldı?', 'Wie viele Bücher lieh Timur aus?'),
        line('Ikkita', 'Two', 'Две', 'كتابين', 'İki', 'Zwei'),
        line('Bitta', 'One', 'Одну', 'كتابًا واحدًا', 'Bir', 'Eins'),
        line('Uchta', 'Three', 'Три', 'ثلاثة كتب', 'Üç', 'Drei')),
      question(
        line('Kitoblarni qachon qaytarish kerak?', 'When are the books due?', 'Когда нужно вернуть книги?', 'متى يجب إعادة الكتب؟', 'Kitaplar ne zaman iade edilmeli?', 'Wann muss er die Bücher zurückgeben?'),
        line('Kelasi payshanba kuni', 'Next Thursday', 'В следующий четверг', 'يوم الخميس المقبل', 'Gelecek perşembe', 'Nächsten Donnerstag'),
        line('Kelasi dushanba kuni', 'Next Monday', 'В следующий понедельник', 'يوم الاثنين المقبل', 'Gelecek pazartesi', 'Nächsten Montag'),
        line('Kelasi shanba kuni', 'Next Saturday', 'В следующую субботу', 'يوم السبت المقبل', 'Gelecek cumartesi', 'Nächsten Samstag'))
    ]),
  story('missed-coach', 'sand',
    line('O‘tib ketgan avtobus', 'The missed connection', 'Пропущенная пересадка', 'الحافلة التي فاتته', 'Kaçan aktarma otobüsü', 'Den Anschluss verpasst'),
    line('Kamol safarini davom ettirish uchun boshqa qatnov topishi kerak.', 'Kamol needs to find another coach to continue his trip.', 'Камолу нужно найти другой автобус, чтобы продолжить поездку.', 'على كامول أن يجد حافلة أخرى ليواصل رحلته.', 'Kamol yolculuğuna devam etmek için başka bir otobüs bulmalı.', 'Kamol muss einen anderen Bus finden, um weiterzufahren.'),
    [
      sentence('Kamolning birinchi avtobusi yigirma daqiqa kechikdi va u keyingi avtobusga ulgurolmadi.', 'Kamol’s first coach was twenty minutes late, and he missed his connection.', 'Первый автобус Камола опоздал на двадцать минут, и Камол не успел на следующий.', 'تأخّرت حافلة كامول الأولى عشرين دقيقة، ففاتته الحافلة التالية.', 'Kamol’un ilk otobüsü yirmi dakika gecikti ve Kamol aktarma otobüsünü kaçırdı.', 'Kamols erster Bus hatte zwanzig Minuten Verspätung, und er verpasste den Anschluss.', 'Taʾakhkharat ḥāfilatu Kāmūl al-ūlā ʿishrīna daqīqa, fa-fātat-hu al-ḥāfilatu at-tāliya.'),
      sentence('Kassadagi xodim keyingi oddiy avtobus ikki soatdan keyin jo‘nashini aytdi.', 'The clerk said the next regular coach would leave in two hours.', 'Кассир сказал, что следующий обычный автобус отправится через два часа.', 'قال موظّف شباك التذاكر إنّ الحافلة العاديّة التالية ستنطلق بعد ساعتين.', 'Gişedeki görevli bir sonraki normal otobüsün iki saat sonra kalkacağını söyledi.', 'Der Mitarbeiter am Schalter sagte, dass der nächste reguläre Bus in zwei Stunden abfahren würde.', 'Qāla muwaẓẓafu shubbāki at-tadhākiri inna al-ḥāfilata al-ʿādiyyata at-tāliyata satanṭaliqu baʿda sāʿatayn.'),
      sentence('Biroq yarim soatdan keyin jo‘naydigan tezkor avtobusda bo‘sh o‘rin bor edi.', 'There was a free seat on an express coach leaving in half an hour.', 'Но в экспресс-автобусе, который отправлялся через полчаса, было свободное место.', 'لكن كان هناك مقعد شاغر في حافلة سريعة ستنطلق بعد نصف ساعة.', 'Ama yarım saat sonra kalkacak ekspres otobüste boş bir koltuk vardı.', 'In einem Expressbus, der in einer halben Stunde abfuhr, war aber noch ein Platz frei.', 'Lākin kāna hunāka maqʿadun shāghirun fī ḥāfilatin sarīʿatin satanṭaliqu baʿda niṣfi sāʿa.'),
      sentence('Kamol qo‘shimcha haq to‘ladi va chiptasini tezkor qatnovga almashtirdi.', 'Kamol paid an extra fee and switched to the express coach.', 'Камол доплатил и поменял билет на экспресс.', 'دفع كامول رسومًا إضافيّة وغيّر حجز تذكرته إلى الرحلة السريعة.', 'Kamol ek ücret ödedi ve biletini ekspres sefere aktardı.', 'Kamol zahlte eine Zusatzgebühr und buchte sein Ticket auf den Expressbus um.', 'Dafaʿa Kāmūl rusūman iḍāfiyyatan wa-ghayyara ḥajza tadhkiratihi ilā ar-riḥlati as-sarīʿa.')
    ],
    [
      question(
        line('Kamol nega keyingi avtobusga ulgurolmadi?', 'Why did Kamol miss his connection?', 'Почему Камол не успел на следующий автобус?', 'لماذا فاتت كامول الحافلة التالية؟', 'Kamol aktarma otobüsünü neden kaçırdı?', 'Warum verpasste Kamol den Anschluss?'),
        line('Birinchi avtobus kechikdi.', 'His first coach was late.', 'Первый автобус опоздал.', 'تأخّرت حافلته الأولى.', 'İlk otobüsü gecikti.', 'Sein erster Bus hatte Verspätung.'),
        line('U chiptasini yo‘qotdi.', 'He lost his ticket.', 'Он потерял билет.', 'أضاع تذكرته.', 'Biletini kaybetti.', 'Er verlor sein Ticket.'),
        line('U boshqa avtovokzalga bordi.', 'He went to a different station.', 'Он приехал на другой автовокзал.', 'ذهب إلى محطّة أخرى.', 'Başka bir otogara gitti.', 'Er fuhr zu einem anderen Busbahnhof.')),
      question(
        line('Keyingi oddiy avtobus qachon jo‘nardi?', 'When was the next regular coach leaving?', 'Когда отправлялся следующий обычный автобус?', 'متى كانت الحافلة العاديّة التالية ستنطلق؟', 'Bir sonraki normal otobüs ne zaman kalkacaktı?', 'Wann sollte der nächste reguläre Bus abfahren?'),
        line('Ikki soatdan keyin', 'In two hours', 'Через два часа', 'بعد ساعتين', 'İki saat sonra', 'In zwei Stunden'),
        line('Yarim soatdan keyin', 'In half an hour', 'Через полчаса', 'بعد نصف ساعة', 'Yarım saat sonra', 'In einer halben Stunde'),
        line('Yigirma daqiqadan keyin', 'In twenty minutes', 'Через двадцать минут', 'بعد عشرين دقيقة', 'Yirmi dakika sonra', 'In zwanzig Minuten')),
      question(
        line('Kamol chiptasini almashtirish uchun nima qildi?', 'What did Kamol do to change his ticket?', 'Что сделал Камол, чтобы поменять билет?', 'ماذا فعل كامول لتبديل تذكرته؟', 'Kamol biletini değiştirmek için ne yaptı?', 'Was tat Kamol, um sein Ticket umzubuchen?'),
        line('Qo‘shimcha haq to‘ladi.', 'He paid an extra fee.', 'Он доплатил.', 'دفع رسومًا إضافيّة.', 'Ek ücret ödedi.', 'Er zahlte eine Zusatzgebühr.'),
        line('U yangi chipta sotib oldi.', 'He bought a new ticket.', 'Он купил новый билет.', 'اشترى تذكرة جديدة.', 'Yeni bir bilet aldı.', 'Er kaufte ein neues Ticket.'),
        line('Haydovchidan ruxsat so‘radi.', 'He asked the driver for permission.', 'Он попросил разрешения у водителя.', 'طلب الإذن من السائق.', 'Şoförden izin istedi.', 'Er bat den Fahrer um Erlaubnis.'))
    ]),
  story('rain-barrel', 'mint',
    line('Yomg‘ir suvi uchun bochka', 'The rain barrel', 'Бочка для дождевой воды', 'برميل مياه الأمطار', 'Yağmur suyu fıçısı', 'Die Regentonne'),
    line('Qo‘shnilar quruq kunlarda ham bog‘ni sug‘orish yo‘lini topishadi.', 'The neighbors find a way to water their garden on dry days.', 'Соседи находят способ поливать сад в сухие дни.', 'يجد الجيران طريقة لريّ حديقتهم في الأيّام الجافّة.', 'Komşular kurak günlerde de bahçelerini sulamanın bir yolunu bulur.', 'Die Nachbarn finden einen Weg, ihren Garten auch an trockenen Tagen zu gießen.'),
    [
      sentence('O‘tgan yozda mahalla bog‘idagi tuproq tez qurib qolardi.', 'Last summer, the soil in the community garden dried out quickly.', 'Прошлым летом почва в общественном саду быстро пересыхала.', 'في الصيف الماضي كانت تربة حديقة الحيّ تجفّ بسرعة.', 'Geçen yaz mahalle bahçesindeki toprak çabucak kuruyordu.', 'Letzten Sommer trocknete die Erde im Gemeinschaftsgarten schnell aus.', 'Fī aṣ-ṣayfi al-māḍī kānat turbatu ḥadīqati al-ḥayyi tajiffu bi-surʿa.'),
      sentence('Madina omborxona tomidan oqadigan yomg‘ir suvini yig‘ishni taklif qildi.', 'Madina suggested collecting rainwater that ran off the shed roof.', 'Мадина предложила собирать дождевую воду, которая стекала с крыши сарая.', 'اقترحت مادينا جمع مياه الأمطار التي تنساب من سطح المخزن.', 'Madina, kulübenin çatısından akan yağmur suyunu toplamayı önerdi.', 'Madina schlug vor, das Regenwasser aufzufangen, das vom Schuppendach ablief.', 'Iqtaraḥat Mādīnā jamʿa miyāhi al-amṭāri allatī tansābu min saṭḥi al-makhzan.'),
      sentence('Qo‘shnilar suv quvuri tagiga bochka qo‘yishdi va birinchi yomg‘irdan keyin u yarmigacha to‘ldi.', 'The neighbors put a barrel under the downspout, and it was half full after the first rain.', 'Соседи поставили бочку под водосточную трубу, и после первого дождя она наполнилась наполовину.', 'وضع الجيران برميلًا تحت أنبوب التصريف، فامتلأ نصفه بعد أوّل مطر.', 'Komşular yağmur oluğunun iniş borusunun altına bir fıçı koydu ve ilk yağmurdan sonra fıçı yarıya kadar doldu.', 'Die Nachbarn stellten eine Tonne unter das Fallrohr, und nach dem ersten Regen war sie halb voll.', 'Waḍaʿa al-jīrānu barmīlan taḥta unbūbi at-taṣrīf, fa-mtalaʾa niṣfuhu baʿda awwali maṭar.'),
      sentence('Keyingi hafta yomg‘ir yog‘madi, lekin ular bochkadagi suv bilan ko‘chatlarni sug‘ora olishdi.', 'It didn’t rain the next week, but they could water the seedlings with what was in the barrel.', 'На следующей неделе дождя не было, но соседи смогли полить рассаду водой из бочки.', 'لم تمطر في الأسبوع التالي، لكنّهم استطاعوا ريّ الشتلات بالماء الذي في البرميل.', 'Ertesi hafta yağmur yağmadı ama fıçıdaki suyla fideleri sulayabildiler.', 'In der folgenden Woche regnete es nicht, aber sie konnten die Setzlinge mit dem Wasser aus der Tonne gießen.', 'Lam tumṭir fī al-usbūʿi at-tālī, lākinna-hum istaṭāʿū rayya ash-shatalāti bi-l-māʾi alladhī fī al-barmīl.')
    ],
    [
      question(
        line('O‘tgan yozda bog‘da qanday muammo bo‘lgan?', 'What problem did the garden have last summer?', 'Какая проблема была в саду прошлым летом?', 'ما المشكلة التي واجهتها الحديقة في الصيف الماضي؟', 'Geçen yaz bahçede ne sorun vardı?', 'Welches Problem gab es letzten Sommer im Garten?'),
        line('Tuproq tez qurib qolardi.', 'The soil dried out quickly.', 'Почва быстро пересыхала.', 'كانت التربة تجفّ بسرعة.', 'Toprak çabucak kuruyordu.', 'Die Erde trocknete schnell aus.'),
        line('Yerda suv to‘planib qolardi.', 'Water collected on the ground.', 'На земле скапливалась вода.', 'كانت المياه تتجمّع على الأرض.', 'Yerde su birikiyordu.', 'Auf dem Boden sammelte sich Wasser.'),
        line('Ko‘chatlarga quyosh yetishmasdi.', 'The seedlings got too little sunlight.', 'Рассаде не хватало солнца.', 'لم تحصل الشتلات على ضوء شمس كافٍ.', 'Fideler yeterince güneş almıyordu.', 'Die Setzlinge bekamen zu wenig Sonne.')),
      question(
        line('Qo‘shnilar bochkani qayerga qo‘yishdi?', 'Where did the neighbors put the barrel?', 'Куда соседи поставили бочку?', 'أين وضع الجيران البرميل؟', 'Komşular fıçıyı nereye koydu?', 'Wohin stellten die Nachbarn die Tonne?'),
        line('Suv quvuri tagiga', 'Under the downspout', 'Под водосточную трубу', 'تحت أنبوب التصريف', 'Yağmur oluğunun iniş borusunun altına', 'Unter das Fallrohr'),
        line('Omborxona ichiga', 'Inside the shed', 'В сарай', 'داخل المخزن', 'Kulübenin içine', 'In den Schuppen'),
        line('Omborxona tomiga', 'On the shed roof', 'На крышу сарая', 'على سطح المخزن', 'Kulübenin çatısına', 'Auf das Schuppendach')),
      question(
        line('Bochka keyingi hafta nega qo‘l keldi?', 'Why did the barrel come in handy the following week?', 'Почему бочка пригодилась на следующей неделе?', 'لماذا كان البرميل مفيدًا في الأسبوع التالي؟', 'Fıçı ertesi hafta neden işe yaradı?', 'Warum war die Tonne in der folgenden Woche hilfreich?'),
        line('Yomg‘ir yog‘maganida ham sug‘orish uchun suv bor edi.', 'They had water for the seedlings even without new rain.', 'У них была вода для рассады, хотя дождя не было.', 'كان لديهم ماء لريّ الشتلات رغم عدم هطول المطر.', 'Yağmur yağmasa da fideleri sulayacak suları vardı.', 'Sie hatten auch ohne neuen Regen Wasser für die Setzlinge.'),
        line('Tuproq ortiqcha suvdan himoyalandi.', 'It kept the soil from getting too wet.', 'Она защищала почву от избытка воды.', 'حَمى التربة من الماء الزائد.', 'Toprağın fazla ıslanmasını önledi.', 'Sie schützte die Erde vor zu viel Wasser.'),
        line('Ular unga yangi ko‘chatlar ekishdi.', 'They planted new seedlings in it.', 'В неё посадили новую рассаду.', 'زرعوا فيها شتلات جديدة.', 'İçine yeni fideler diktiler.', 'Sie pflanzten neue Setzlinge hinein.'))
    ]),
  story('leaking-tap', 'sky',
    line('Tomchilayotgan jo‘mrak', 'The dripping tap', 'Капающий кран', 'الصنبور الذي يقطر', 'Damlatan musluk', 'Der tropfende Wasserhahn'),
    line('Malika ta’mir uchun o‘ziga qulay vaqt topadi.', 'Malika finds a repair time that fits her schedule.', 'Малика договаривается о ремонте на удобное для неё время.', 'تجد ماليكا موعدًا مناسبًا لإصلاح الصنبور.', 'Malika onarım için kendisine uygun bir saat bulur.', 'Malika findet einen Reparaturtermin, der ihr passt.'),
    [
      sentence('Malika oshxonadagi jo‘mrakni yaxshilab yopdi, ammo undan suv tomchilashda davom etdi.', 'Malika turned the kitchen tap off tightly, but it kept dripping.', 'Малика плотно закрыла кухонный кран, но он продолжал капать.', 'أغلقت ماليكا صنبور المطبخ بإحكام، لكنّه ظلّ يقطر.', 'Malika mutfak musluğunu iyice kapattı ama musluk damlatmaya devam etti.', 'Malika drehte den Wasserhahn in der Küche fest zu, aber er tropfte weiter.', 'Aghlaqat Mālīkā ṣunbūra al-maṭbakhi bi-iḥkām, lākinna-hu ẓalla yaqṭur.'),
      sentence('U ta’mirlash xizmatiga qo‘ng‘iroq qildi. Xodim usta soat o‘n birda yoki uchda kela olishini aytdi.', 'She called the repair service. The person on the phone said a technician could come at eleven or at three.', 'Она позвонила в службу ремонта. Сотрудник сказал, что мастер может прийти в одиннадцать или в три.', 'اتّصلت بخدمة الصيانة. قال الموظّف إنّ الفنّيّ يستطيع الحضور في الساعة الحادية عشرة أو الثالثة.', 'Onarım servisini aradı. Görevli, teknisyenin saat on birde ya da üçte gelebileceğini söyledi.', 'Sie rief beim Reparaturdienst an. Der Mitarbeiter sagte, ein Techniker könne um elf oder um drei kommen.', 'Ittaṣalat bi-khidmati aṣ-ṣiyāna. Qāla al-muwaẓẓafu inna al-fanniyya yastaṭīʿu al-ḥuḍūra fī as-sāʿati al-ḥādiyati ʿashrata aw ath-thālitha.'),
      sentence('Malikaning tushdan keyin video uchrashuvi bor edi, shu bois u soat o‘n birni tanladi.', 'Malika had a video call in the afternoon, so she chose eleven.', 'У Малики после обеда была видеовстреча, поэтому она выбрала одиннадцать.', 'كان لدى ماليكا اجتماع عبر الفيديو بعد الظهر، فاختارت الساعة الحادية عشرة.', 'Malika’nın öğleden sonra görüntülü toplantısı vardı, bu yüzden saat on biri seçti.', 'Malika hatte am Nachmittag eine Videokonferenz, deshalb wählte sie elf Uhr.', 'Kāna ladā Mālīkā ijtimāʿun ʿabra al-fīdiyū baʿda aẓ-ẓuhr, fa-khtārat as-sāʿata al-ḥādiyata ʿashra.'),
      sentence('Usta mos ehtiyot qismni olib kelishi uchun Malika unga jo‘mrakning suratini yubordi.', 'Malika sent the technician a photo of the tap so he could bring the right spare part.', 'Малика отправила мастеру фото крана, чтобы он привёз нужную запчасть.', 'أرسلت ماليكا إلى الفنّيّ صورة للصنبور ليُحضر قطعة الغيار المناسبة.', 'Malika, doğru yedek parçayı getirebilmesi için teknisyene musluğun fotoğrafını gönderdi.', 'Malika schickte dem Techniker ein Foto vom Wasserhahn, damit er das passende Ersatzteil mitbringen konnte.', 'Arsalat Mālīkā ilā al-fanniyyi ṣūratan li-ṣ-ṣunbūri li-yuḥḍira qiṭʿata al-ghiyāri al-munāsiba.')
    ],
    [
      question(
        line('Malika qanday muammo haqida xabar berdi?', 'What problem did Malika report?', 'О какой неисправности сообщила Малика?', 'ما العطل الذي أبلغت عنه ماليكا؟', 'Malika hangi arızayı bildirdi?', 'Welchen Defekt meldete Malika?'),
        line('Jo‘mrak yopiq bo‘lsa ham tomchilardi.', 'The tap dripped even when it was off.', 'Кран капал, даже когда был закрыт.', 'كان الصنبور يقطر رغم إغلاقه.', 'Musluk kapalıyken bile damlatıyordu.', 'Der Wasserhahn tropfte auch, wenn er zugedreht war.'),
        line('Oshxonada issiq suv yo‘q edi.', 'There was no hot water in the kitchen.', 'На кухне не было горячей воды.', 'لم يكن في المطبخ ماء ساخن.', 'Mutfakta sıcak su yoktu.', 'In der Küche gab es kein warmes Wasser.'),
        line('Jo‘mrak umuman ochilmasdi.', 'The tap wouldn’t turn on at all.', 'Кран совсем не открывался.', 'لم يكن الصنبور يفتح إطلاقًا.', 'Musluk hiç açılmıyordu.', 'Der Wasserhahn ließ sich gar nicht aufdrehen.')),
      question(
        line('Nega u soat o‘n birni tanladi?', 'Why did she choose eleven?', 'Почему она выбрала одиннадцать?', 'لماذا اختارت الساعة الحادية عشرة؟', 'Neden saat on biri seçti?', 'Warum wählte sie elf Uhr?'),
        line('Tushdan keyin uchrashuvi bor edi.', 'She had a meeting in the afternoon.', 'После обеда у неё была встреча.', 'كان لديها اجتماع بعد الظهر.', 'Öğleden sonra toplantısı vardı.', 'Sie hatte am Nachmittag eine Besprechung.'),
        line('Ertalab uyda bo‘lmasdi.', 'She wouldn’t be home in the morning.', 'Утром её не было бы дома.', 'لم تكن ستكون في البيت صباحًا.', 'Sabah evde olmayacaktı.', 'Sie wäre morgens nicht zu Hause.'),
        line('Tushdan keyingi ta’mir qimmatroq edi.', 'The afternoon repair cost more.', 'Дневной визит стоил дороже.', 'كان موعد بعد الظهر أعلى تكلفة.', 'Öğleden sonraki onarım daha pahalıydı.', 'Der Nachmittagstermin kostete mehr.')),
      question(
        line('Jo‘mrakning surati ustaga qanday yordam berishi mumkin edi?', 'How could the photo help the technician?', 'Как фотография могла помочь мастеру?', 'كيف كان للصورة أن تساعد الفنّيّ؟', 'Fotoğraf teknisyene nasıl yardımcı olabilirdi?', 'Wie konnte das Foto dem Techniker helfen?'),
        line('U mos ehtiyot qismni olib kelishi mumkin edi.', 'He could bring the right spare part.', 'Он мог привезти нужную запчасть.', 'كان بإمكانه إحضار قطعة الغيار المناسبة.', 'Doğru yedek parçayı getirebilirdi.', 'Er konnte das passende Ersatzteil mitbringen.'),
        line('U Malikaning manzilini topishi mumkin edi.', 'He could find Malika’s address.', 'Он мог узнать адрес Малики.', 'كان بإمكانه معرفة عنوان ماليكا.', 'Malika’nın adresini bulabilirdi.', 'Er konnte Malikas Adresse finden.'),
        line('U uchrashuv vaqtini o‘zgartirishi mumkin edi.', 'He could reschedule the appointment.', 'Он мог перенести визит.', 'كان بإمكانه تغيير موعد الزيارة.', 'Randevu saatini değiştirebilirdi.', 'Er konnte den Termin verschieben.'))
    ]),
  story('meeting-notes', 'lilac',
    line('Uchrashuvdan keyingi xabar', 'After the meeting', 'После совещания', 'بعد الاجتماع', 'Toplantıdan sonra', 'Nach der Besprechung'),
    line('Zarina jamoaga nimalar kelishilgani va qaysi masala ochiq qolganini yozadi.', 'Zarina tells the team what was agreed and what’s still open.', 'Зарина сообщает команде, о чём договорились и какой вопрос остался открытым.', 'تُطلع زارينا الفريق على ما اتُّفق عليه وما بقي عالقًا.', 'Zarina ekibe hangi konularda anlaşıldığını ve neyin hâlâ belirsiz olduğunu yazar.', 'Zarina schreibt dem Team, was vereinbart wurde und was noch offen ist.'),
    [
      sentence('Jamoa shaharga keladigan mehmonlar uchun yo‘l-yo‘riq tayyorlash haqida gaplashdi.', 'The team discussed putting together a guide for visitors coming to the city.', 'Команда обсудила подготовку путеводителя для гостей города.', 'ناقش الفريق إعداد دليل لزوّار المدينة.', 'Ekip şehre gelen ziyaretçiler için bir rehber hazırlamayı görüştü.', 'Das Team besprach, einen Wegweiser für Gäste der Stadt zu erstellen.', 'Nāqasha al-farīqu iʿdāda dalīlin li-zuwwāri al-madīna.'),
      sentence('Yusuf xaritani yo‘l-yo‘riqqa qo‘shishni taklif qildi, lekin undan foydalanish uchun ruxsat kerakligini aytdi.', 'Yusuf suggested including a map but said they would need permission to use it.', 'Юсуф предложил добавить карту, но сказал, что для её использования нужно разрешение.', 'اقترح يوسف إرفاق خريطة، لكنّه قال إنّهم بحاجة إلى إذن لاستخدامها.', 'Yusuf bir harita eklemeyi önerdi ama haritayı kullanmak için izin gerektiğini söyledi.', 'Yusuf schlug vor, eine Karte beizufügen, sagte aber, dass sie dafür eine Genehmigung bräuchten.', 'Iqtaraḥa Yūsufu irfāqa kharīṭatin, lākinna-hu qāla innahum bi-ḥājatin ilā idhnin li-stikhdāmihā.'),
      sentence('Zarina xarita borasida qaror qabul qilinishini kutmay, juma kunigacha yo‘l-yo‘riqning dastlabki matnini tayyorlashni zimmasiga oldi.', 'Zarina agreed to draft the text by Friday while the map decision was pending.', 'Зарина взялась подготовить черновик текста к пятнице, пока вопрос с картой оставался открытым.', 'تولّت زارينا إعداد مسوّدة النصّ بحلول يوم الجمعة ريثما يُبتّ في أمر الخريطة.', 'Zarina, haritayla ilgili karar henüz verilmemişken metnin taslağını cumaya kadar hazırlamayı üstlendi.', 'Zarina übernahm es, bis Freitag einen Textentwurf zu schreiben, während die Entscheidung über die Karte noch ausstand.', 'Tawallat Zārīnā iʿdāda musawwadati an-naṣṣi bi-ḥulūli yawmi al-jumʿati raythamā yubattu fī amri al-kharīṭa.'),
      sentence('Yig‘ilishdan keyin u jamoaga juma kungi muddatni eslatdi va xarita masalasi hali ochiq ekanini yozdi.', 'After the meeting, she reminded the team of Friday’s deadline and noted that the map was still an open question.', 'После совещания она напомнила команде о сроке в пятницу и отметила, что вопрос с картой ещё открыт.', 'بعد الاجتماع، ذكّرت الفريق بموعد الجمعة وأشارت إلى أنّ مسألة الخريطة لا تزال عالقة.', 'Toplantıdan sonra ekibe son tarihin cuma olduğunu hatırlattı ve harita konusunun hâlâ açık olduğunu belirtti.', 'Nach der Besprechung erinnerte sie das Team an die Freitagsfrist und schrieb, dass die Frage der Karte noch offen war.', 'Baʿda al-ijtimāʿ, dhakkarat al-farīqa bi-mawʿidi al-jumʿati wa-ashārat ilā anna masʾalata al-kharīṭati lā tazālu ʿāliqa.')
    ],
    [
      question(
        line('Yusuf nimani taklif qildi?', 'What did Yusuf propose?', 'Что предложил Юсуф?', 'ماذا اقترح يوسف؟', 'Yusuf ne önerdi?', 'Was schlug Yusuf vor?'),
        line('Yo‘l-yo‘riqqa xarita qo‘shishni', 'Including a map in the guide', 'Добавить карту в путеводитель', 'إرفاق خريطة بالدليل', 'Rehbere bir harita eklemeyi', 'Dem Wegweiser eine Karte beizufügen'),
        line('Muddatni bir hafta uzaytirishni', 'Extending the deadline by a week', 'Продлить срок на неделю', 'تمديد الموعد النهائيّ أسبوعًا', 'Son tarihi bir hafta uzatmayı', 'Die Frist um eine Woche zu verlängern'),
        line('Mehmonlardan fikr so‘rashni', 'Asking the visitors for feedback', 'Попросить гостей поделиться мнением', 'طلب آراء الزوّار', 'Ziyaretçilerden görüş almayı', 'Die Gäste um Rückmeldung zu bitten')),
      question(
        line('Juma kunigacha nima tayyor bo‘lishi kerak?', 'What’s due by Friday?', 'Что нужно подготовить к пятнице?', 'ما الذي يجب أن يكون جاهزًا بحلول يوم الجمعة؟', 'Cumaya kadar ne hazır olmalı?', 'Was soll bis Freitag fertig sein?'),
        line('Zarinaning dastlabki matni', 'Zarina’s draft text', 'Черновик текста Зарины', 'مسوّدة النصّ التي تعدّها زارينا', 'Zarina’nın metin taslağı', 'Zarinas Textentwurf'),
        line('Xaritadan foydalanishga ruxsat', 'Permission to use the map', 'Разрешение на использование карты', 'إذن استخدام الخريطة', 'Haritayı kullanma izni', 'Die Genehmigung zur Nutzung der Karte'),
        line('Bosmadan chiqqan yo‘l-yo‘riq', 'The printed guide', 'Напечатанный путеводитель', 'الدليل المطبوع', 'Basılı rehber', 'Der gedruckte Wegweiser')),
      question(
        line('Nega Zarina xarita masalasi hali ochiq deb yozdi?', 'Why did Zarina say the map was still an open question?', 'Почему Зарина отметила, что вопрос с картой ещё открыт?', 'لماذا قالت زارينا إنّ مسألة الخريطة لا تزال عالقة؟', 'Zarina harita konusunun hâlâ açık olduğunu neden belirtti?', 'Warum schrieb Zarina, dass die Frage der Karte noch offen war?'),
        line('Jamoa xaritadan foydalanish uchun ruxsat olishi kerak edi.', 'The team still needed permission to use it.', 'Команде ещё нужно было получить разрешение на её использование.', 'كان الفريق لا يزال بحاجة إلى إذن لاستخدامها.', 'Ekibin haritayı kullanmak için hâlâ izin alması gerekiyordu.', 'Das Team brauchte noch die Genehmigung, die Karte zu verwenden.'),
        line('Jamoa xaritani olib tashlashga kelishgan edi.', 'The team had agreed to leave it out.', 'Команда договорилась её не включать.', 'كان الفريق قد اتّفق على عدم إرفاقها.', 'Ekip haritayı eklememeye karar vermişti.', 'Das Team hatte beschlossen, die Karte wegzulassen.'),
        line('Yusuf xaritani chizib tugatmagan edi.', 'Yusuf hadn’t finished drawing it.', 'Юсуф ещё не закончил её рисовать.', 'لم يكن يوسف قد انتهى من رسمها.', 'Yusuf haritayı çizmeyi bitirmemişti.', 'Yusuf hatte die Karte noch nicht fertig gezeichnet.'))
    ])
];

export const storyLines = stories.flatMap(story => story.lines);
