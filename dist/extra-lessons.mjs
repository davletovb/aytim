import { text as t, phrase as p, lesson } from './catalog.mjs';

// One more lesson at every level, so a level holds forty-eight phrases rather
// than forty-two and the step up to the next one is less abrupt.
export const extraLessons = [
  lesson('where-things-are', 1,
    t('Narsalar qayerda?', 'Where things are', 'Где что лежит', 'أين توجد الأشياء', 'Eşyalar nerede?', 'Wo die Dinge sind'),
    t('Buyumlarning joyini ayting va so‘rang.', 'Say and ask where things are.', 'Скажите и спросите, где что находится.', 'قل أين توجد الأشياء واسأل عنها.', 'Eşyaların yerini söyle ve sor.', 'Sag und frag, wo etwas ist.'), [
      p('Ruchka daftar ustida.', 'The pen is on the notebook.', 'Ручка лежит на тетради.', 'القلم فوق الدفتر.', 'Kalem defterin üstünde.', 'Der Stift liegt auf dem Heft.', 'Al-qalamu fawqa ad-daftar.'),
      p('Sumka stol ostida.', 'The bag is under the table.', 'Сумка под столом.', 'الحقيبة تحت الطاولة.', 'Çanta masanın altında.', 'Die Tasche ist unter dem Tisch.', 'Al-ḥaqībatu taḥta aṭ-ṭāwila.'),
      p('Ko‘zoynak quti ichida.', 'The glasses are inside the box.', 'Очки внутри коробки.', 'النظّارة داخل الصندوق.', 'Gözlük kutunun içinde.', 'Die Brille ist in der Schachtel.', 'An-naẓẓāratu dākhila aṣ-ṣundūq.'),
      p('Mushuk eshik oldida turibdi.', 'The cat is standing in front of the door.', 'Кот стоит перед дверью.', 'القطّة تقف أمام الباب.', 'Kedi kapının önünde duruyor.', 'Die Katze steht vor der Tür.', 'Al-qiṭṭatu taqifu amāma al-bāb.'),
      p('Chiroq stol yonida.', 'The lamp is next to the table.', 'Лампа рядом со столом.', 'المصباح بجانب الطاولة.', 'Lamba masanın yanında.', 'Die Lampe steht neben dem Tisch.', 'Al-miṣbāḥu bijānibi aṭ-ṭāwila.'),
      p('Mening qalamim qayerda?', 'Where is my pencil?', 'Где мой карандаш?', 'أين قلم الرصاص الخاصّ بي؟', 'Kurşun kalemim nerede?', 'Wo ist mein Bleistift?', 'Ayna qalamu ar-raṣāṣi al-khāṣṣu bī?')
    ]),
  lesson('telling-time', 2,
    t('Soat nechchi?', 'What time is it?', 'Который час?', 'كم الساعة؟', 'Saat kaç?', 'Wie spät ist es?'),
    t('Vaqtni ayting va uchrashuv soatini so‘rang.', 'Tell the time and ask when something happens.', 'Называйте время и спрашивайте, когда что-то начинается.', 'اذكر الوقت واسأل عن موعد الأمر.', 'Saati söyle ve bir şeyin ne zaman olduğunu sor.', 'Sag die Uhrzeit und frag, wann etwas ist.'), [
      p('Hozir soat uch.', 'It is three o’clock.', 'Сейчас три часа.', 'الساعة الآن الثالثة.', 'Saat şu an üç.', 'Es ist drei Uhr.', 'As-sāʿatu al-āna ath-thālitha.'),
      p('Soat to‘rtdan yigirma daqiqa o‘tdi.', 'It is four twenty.', 'Двадцать минут пятого.', 'الساعة الرابعة وعشرون دقيقة.', 'Saat dördü yirmi geçiyor.', 'Es ist zwanzig nach vier.', 'As-sāʿatu ar-rābiʿatu wa-ʿishrūna daqīqa.'),
      p('Dars soat beshda boshlanadi.', 'The lesson starts at five.', 'Урок начинается в пять.', 'يبدأ الدرس في الساعة الخامسة.', 'Ders saat beşte başlıyor.', 'Der Unterricht beginnt um fünf.', 'Yabdaʾu ad-darsu fī as-sāʿati al-khāmisa.'),
      p('Biz yarim soat kutdik.', 'We waited for half an hour.', 'Мы прождали полчаса.', 'انتظرنا نصف ساعة.', 'Yarım saat bekledik.', 'Wir haben eine halbe Stunde gewartet.', 'Intaẓarnā niṣfa sāʿa.'),
      p('Menga biroz vaqt kerak.', 'I need a little time.', 'Мне нужно немного времени.', 'أحتاج إلى قليل من الوقت.', 'Biraz zamana ihtiyacım var.', 'Ich brauche etwas Zeit.', 'Aḥtāju ilā qalīlin mina al-waqt.'),
      p('Siz soat nechchida bo‘shaysiz?', 'What time do you finish?', 'Во сколько вы освобождаетесь?', 'في أيّ ساعة تنتهي؟', 'Saat kaçta bitiriyorsunuz?', 'Um wie viel Uhr sind Sie fertig?', 'Fī ayyi sāʿatin tantahī?')
    ]),
  lesson('takeaway', 3,
    t('O‘zim bilan olib ketaman', 'Taking food away', 'Еда с собой', 'الطعام للخارج', 'Paket olarak almak', 'Essen zum Mitnehmen'),
    t('Taomni o‘zingiz bilan olib ketishni so‘rang.', 'Order food to take away with you.', 'Закажите еду с собой.', 'اطلب الطعام لتأخذه معك.', 'Yemeği paket olarak sipariş et.', 'Bestelle Essen zum Mitnehmen.'), [
      p('Buni o‘zim bilan olib ketaman.', 'I will take this away with me.', 'Я возьму это с собой.', 'سآخذ هذا معي.', 'Bunu yanımda götüreceğim.', 'Ich nehme das mit.', 'Sa-ākhudhu hādhā maʿī.'),
      p('Iltimos, alohida idishga soling.', 'Please put it in a separate box.', 'Положите, пожалуйста, в отдельную коробку.', 'ضعه في علبة منفصلة، من فضلك.', 'Lütfen ayrı bir kaba koyun.', 'Bitte tun Sie es in eine eigene Schachtel.', 'Ḍaʿhu fī ʿulbatin munfaṣilatin, min faḍlika.'),
      p('Qancha vaqt kutishim kerak?', 'How long do I have to wait?', 'Сколько мне нужно ждать?', 'كم عليّ أن أنتظر؟', 'Ne kadar beklemem gerekiyor?', 'Wie lange muss ich warten?', 'Kam ʿalayya an antaẓir?'),
      p('Hali issiqmi?', 'Is it still hot?', 'Это ещё горячее?', 'هل ما زال ساخنًا؟', 'Hâlâ sıcak mı?', 'Ist es noch heiß?', 'Hal mā zāla sākhinan?'),
      p('Menga qoshiq ham bering, iltimos.', 'Give me a spoon as well, please.', 'Дайте мне, пожалуйста, ещё и ложку.', 'أعطني ملعقة أيضًا، من فضلك.', 'Bana bir de kaşık verin, lütfen.', 'Geben Sie mir bitte auch einen Löffel.', 'Aʿṭinī milʿaqatan ayḍan, min faḍlika.'),
      p('Hisobni shu yerda to‘layman.', 'I will pay here.', 'Я заплачу здесь.', 'سأدفع هنا.', 'Burada ödeyeceğim.', 'Ich zahle hier.', 'Sa-adfaʿu hunā.')
    ]),
  lesson('inside-a-building', 4,
    t('Bino ichida yo‘l topish', 'Finding your way inside', 'Как найти нужный этаж', 'التنقّل داخل المبنى', 'Bina içinde yön bulma', 'Sich im Gebäude zurechtfinden'),
    t('Qavat va xonani so‘rang, yo‘lni toping.', 'Ask which floor and room you need.', 'Спросите, какой этаж и кабинет вам нужны.', 'اسأل عن الطابق والغرفة اللذين تحتاجهما.', 'Hangi kat ve oda gerektiğini sor.', 'Frag, welches Stockwerk und welches Zimmer du brauchst.'), [
      p('Bu bo‘lim qaysi qavatda?', 'Which floor is this department on?', 'На каком этаже этот отдел?', 'في أيّ طابق يقع هذا القسم؟', 'Bu bölüm hangi katta?', 'In welchem Stockwerk ist diese Abteilung?', 'Fī ayyi ṭābiqin yaqaʿu hādhā al-qism?'),
      p('Xona ikkinchi qavatda.', 'The room is on the second floor.', 'Кабинет на втором этаже.', 'الغرفة في الطابق الثاني.', 'Oda ikinci katta.', 'Das Zimmer ist im zweiten Stock.', 'Al-ghurfatu fī aṭ-ṭābiqi ath-thānī.'),
      p('Bu yerda lift bormi?', 'Is there a lift here?', 'Здесь есть лифт?', 'هل يوجد مصعد هنا؟', 'Burada asansör var mı?', 'Gibt es hier einen Aufzug?', 'Hal yūjadu miṣʿadun hunā?'),
      p('O‘ng tomondagi zinadan chiqing.', 'Take the stairs on the right.', 'Поднимитесь по лестнице справа.', 'اصعد من الدرج على اليمين.', 'Sağdaki merdivenden çıkın.', 'Nehmen Sie die Treppe rechts.', 'Iṣʿad mina ad-daraji ʿalā al-yamīn.'),
      p('Eshik koridor oxirida.', 'The door is at the end of the corridor.', 'Дверь в конце коридора.', 'الباب في نهاية الممرّ.', 'Kapı koridorun sonunda.', 'Die Tür ist am Ende des Flurs.', 'Al-bābu fī nihāyati al-mamarr.'),
      p('Meni kutib olishlarini so‘rasam bo‘ladimi?', 'May I ask someone to come and meet me?', 'Можно попросить, чтобы меня встретили?', 'هل يمكنني أن أطلب من أحد أن يستقبلني؟', 'Beni karşılamalarını rica edebilir miyim?', 'Darf ich darum bitten, abgeholt zu werden?', 'Hal yumkinunī an aṭluba min aḥadin an yastaqbilanī?')
    ]),
  lesson('paying-for-things', 5,
    t('To‘lov qilish', 'Paying for things', 'Как расплатиться', 'دفع الحساب', 'Ödeme yapmak', 'Bezahlen'),
    t('To‘lov usulini aniqlang va chek oling.', 'Sort out how to pay and get a receipt.', 'Выясните, как оплатить, и возьмите чек.', 'اعرف كيف تدفع واحصل على إيصال.', 'Nasıl ödeyeceğini çöz ve fiş al.', 'Kläre, wie du zahlst, und hol dir den Beleg.'), [
      p('Karta qabul qilasizmi?', 'Do you take cards?', 'Вы принимаете карты?', 'هل تقبلون البطاقات؟', 'Kart kabul ediyor musunuz?', 'Nehmen Sie Karten?', 'Hal taqbalūna al-biṭāqāt?'),
      p('Yaqin atrofda bankomat bormi?', 'Is there a cash machine nearby?', 'Поблизости есть банкомат?', 'هل يوجد صرّاف آليّ قريب؟', 'Yakınlarda bankamatik var mı?', 'Gibt es in der Nähe einen Geldautomaten?', 'Hal yūjadu ṣarrāfun āliyyun qarīb?'),
      p('Bu pulni maydalab bera olasizmi?', 'Could you change this note?', 'Не могли бы вы разменять эту купюру?', 'هل يمكنك صرف هذه الورقة؟', 'Bu banknotu bozabilir misiniz?', 'Könnten Sie diesen Schein wechseln?', 'Hal yumkinuka ṣarfu hādhihi al-waraqa?'),
      p('Narxga soliq kiradimi?', 'Is tax included in the price?', 'Налог включён в цену?', 'هل الضريبة مشمولة في السعر؟', 'Vergi fiyata dâhil mi?', 'Ist die Steuer im Preis enthalten?', 'Hal aḍ-ḍarībatu mashmūlatun fī as-siʿr?'),
      p('Menga chekni bering, iltimos.', 'Give me the receipt, please.', 'Дайте мне чек, пожалуйста.', 'أعطني الإيصال، من فضلك.', 'Fişi verin, lütfen.', 'Geben Sie mir bitte den Beleg.', 'Aʿṭinī al-īṣāla, min faḍlika.'),
      p('Menimcha, qaytim noto‘g‘ri.', 'I think the change is wrong.', 'Кажется, сдачу дали неверно.', 'أظنّ أنّ الباقي غير صحيح.', 'Sanırım para üstü yanlış.', 'Ich glaube, das Wechselgeld stimmt nicht.', 'Aẓunnu anna al-bāqiya ghayru ṣaḥīḥ.')
    ]),
  lesson('describing-people', 6,
    t('Odamlarni tasvirlash', 'Describing people', 'Описание людей', 'وصف الأشخاص', 'İnsanları tanıtmak', 'Menschen beschreiben'),
    t('Tanishlaringizning tashqi ko‘rinishi va fe’lini ayting.', 'Describe how someone looks and what they are like.', 'Расскажите, как человек выглядит и какой он.', 'صف شكل شخص وطباعه.', 'Birinin görünüşünü ve nasıl biri olduğunu anlat.', 'Beschreibe, wie jemand aussieht und wie er ist.'), [
      p('Singlim mendan bo‘yliroq.', 'My younger sister is taller than me.', 'Моя младшая сестра выше меня.', 'أختي الصغرى أطول منّي.', 'Küçük kız kardeşim benden uzun.', 'Meine jüngere Schwester ist größer als ich.', 'Ukhtī aṣ-ṣughrā aṭwalu minnī.'),
      p('U juda xotirjam odam.', 'He is a very calm person.', 'Он очень спокойный человек.', 'هو شخص هادئ جدًّا.', 'O çok sakin bir insan.', 'Er ist ein sehr ruhiger Mensch.', 'Huwa shakhṣun hādiʾun jiddan.'),
      p('Hamkasbim hazilni yaxshi ko‘radi.', 'My colleague likes a joke.', 'Мой коллега любит пошутить.', 'زميلي يحبّ المزاح.', 'İş arkadaşım şakayı sever.', 'Mein Kollege mag Späße.', 'Zamīlī yuḥibbu al-mizāḥ.'),
      p('U har doim boshqalarga yordam beradi.', 'She always helps other people.', 'Она всегда помогает другим.', 'هي تساعد الآخرين دائمًا.', 'O her zaman başkalarına yardım eder.', 'Sie hilft immer anderen.', 'Hiya tusāʿidu al-ākharīna dāʾiman.'),
      p('Avvaliga u uyatchan ko‘rinadi.', 'At first he seems shy.', 'Сначала он кажется застенчивым.', 'يبدو خجولًا في البداية.', 'İlk başta utangaç görünüyor.', 'Zuerst wirkt er schüchtern.', 'Yabdū khajūlan fī al-bidāya.'),
      p('Do‘stingiz qanday odam?', 'What is your friend like?', 'Какой он, ваш друг?', 'كيف هو صديقك؟', 'Arkadaşınız nasıl biri?', 'Wie ist Ihr Freund so?', 'Kayfa huwa ṣadīquka?')
    ]),
  lesson('apologising', 7,
    t('Uzr so‘rash va xatoni tuzatish', 'Apologising and putting things right', 'Извинение и исправление', 'الاعتذار وتصحيح الخطأ', 'Özür dilemek ve telafi etmek', 'Sich entschuldigen und es wiedergutmachen'),
    t('Xatoni tan oling va uni qanday tuzatishni ayting.', 'Own a mistake and say how you will put it right.', 'Признайте ошибку и скажите, как её исправите.', 'اعترف بالخطأ وبيّن كيف ستصلحه.', 'Hatayı kabul et ve nasıl telafi edeceğini söyle.', 'Steh zu einem Fehler und sag, wie du ihn behebst.'), [
      p('Kechikkanim uchun uzr so‘rayman.', 'I apologise for the delay.', 'Прошу прощения за задержку.', 'أعتذر عن التأخير.', 'Gecikme için özür dilerim.', 'Ich entschuldige mich für die Verspätung.', 'Aʿtadhiru ʿani at-taʾkhīr.'),
      p('Bu mening xatoyim edi.', 'That was my mistake.', 'Это была моя ошибка.', 'كان ذلك خطئي.', 'Bu benim hatamdı.', 'Das war mein Fehler.', 'Kāna dhālika khaṭaʾī.'),
      p('Bunday bo‘lishini xohlamagan edim.', 'I did not mean for this to happen.', 'Я не хотел, чтобы так вышло.', 'لم أقصد أن يحدث هذا.', 'Böyle olmasını istememiştim.', 'Ich wollte nicht, dass das passiert.', 'Lam aqṣid an yaḥdutha hādhā.'),
      p('Buni bugunoq tuzataman.', 'I will put it right today.', 'Я исправлю это сегодня же.', 'سأصلح الأمر اليوم.', 'Bunu bugün düzelteceğim.', 'Ich bringe das heute in Ordnung.', 'Sa-uṣliḥu al-amra al-yawm.'),
      p('Buning o‘rnini qanday qoplasam bo‘ladi?', 'How can I make up for it?', 'Как я могу это компенсировать?', 'كيف يمكنني تعويض ذلك؟', 'Bunu nasıl telafi edebilirim?', 'Wie kann ich das wiedergutmachen?', 'Kayfa yumkinunī taʿwīḍu dhālik?'),
      p('Bundan keyin oldindan xabar beraman.', 'From now on I will let you know in advance.', 'Впредь я буду предупреждать заранее.', 'من الآن فصاعدًا سأخبرك مسبقًا.', 'Bundan sonra önceden haber vereceğim.', 'Von jetzt an sage ich vorher Bescheid.', 'Mina al-āna faṣāʿidan sa-ukhbiruka musbaqan.')
    ]),
  lesson('short-update', 8,
    t('Qisqa hisobot berish', 'Giving a short update', 'Короткий отчёт о ходе работы', 'تقديم تحديث موجز', 'Kısa bir durum bildirimi', 'Ein kurzes Update geben'),
    t('Ishning holatini qisqa va aniq ayting.', 'Report where the work stands, briefly and clearly.', 'Коротко и ясно сообщите, как идут дела.', 'اعرض حال العمل بإيجاز ووضوح.', 'İşin durumunu kısa ve net anlat.', 'Berichte kurz und klar, wo die Arbeit steht.'), [
      p('Qisqasi, biz rejadan orqada emasmiz.', 'In short, we are on schedule.', 'Коротко говоря, мы идём по плану.', 'باختصار، نحن ضمن الجدول الزمنيّ.', 'Kısacası, planın gerisinde değiliz.', 'Kurz gesagt, wir liegen im Zeitplan.', 'Bi-khtiṣār, naḥnu ḍimna al-jadwali az-zamanī.'),
      p('O‘tgan haftadan beri ikki narsa o‘zgardi.', 'Two things have changed since last week.', 'С прошлой недели изменились две вещи.', 'تغيّر أمران منذ الأسبوع الماضي.', 'Geçen haftadan beri iki şey değişti.', 'Seit letzter Woche haben sich zwei Dinge geändert.', 'Taghayyara amrāni mundhu al-usbūʿi al-māḍī.'),
      p('Birinchi qism tugadi, ikkinchisi davom etmoqda.', 'The first part is finished and the second is under way.', 'Первая часть завершена, вторая в работе.', 'انتهى الجزء الأوّل والثاني قيد العمل.', 'İlk bölüm bitti, ikincisi sürüyor.', 'Der erste Teil ist fertig, der zweite läuft.', 'Intahā al-juzʾu al-awwalu wa-ath-thānī qayda al-ʿamal.'),
      p('Menga faqat bitta javob yetishmayapti.', 'I am only waiting on one answer.', 'Я жду только одного ответа.', 'أنتظر إجابة واحدة فقط.', 'Yalnızca tek bir yanıt bekliyorum.', 'Ich warte nur noch auf eine Antwort.', 'Antaẓiru ijābatan wāḥidatan faqaṭ.'),
      p('Hech qanday to‘siq yo‘q.', 'There is nothing blocking us.', 'Ничто нас не задерживает.', 'لا شيء يعيقنا.', 'Bizi engelleyen bir şey yok.', 'Nichts hält uns auf.', 'Lā shayʾa yuʿīqunā.'),
      p('Keyingi yig‘ilishda besh daqiqa so‘rayman.', 'I would like five minutes at the next meeting.', 'Прошу пять минут на следующем совещании.', 'أطلب خمس دقائق في الاجتماع المقبل.', 'Bir sonraki toplantıda beş dakika rica ediyorum.', 'Ich hätte gern fünf Minuten in der nächsten Besprechung.', 'Aṭlubu khamsa daqāʾiqa fī al-ijtimāʿi al-muqbil.')
    ]),
];
