# CRM Pro — frontend

CRM Pro mijozlar, leadlar, kompaniyalar, vazifalar va savdo hisobotlarini boshqarish uchun yaratilgan web ilova.

## Asosiy imkoniyatlar

- Kirish va ro‘yxatdan o‘tish
- Manager dashboard, leadlar va Kanban board
- Kontaktlar, kompaniyalar va vazifalar boshqaruvi
- Kalendar va hisobotlar
- Admin uchun foydalanuvchilar hamda rollarni boshqarish
- Telefon va kompyuter ekranlariga mos interfeys

## Ishga tushirish

Kerak bo‘ladigan dasturlar: Node.js 20 yoki undan yangi versiyasi va ishlayotgan CRM backend.

```bash
npm install
npm run dev
```

So‘ng brauzerda terminal chiqargan manzilni oching. Odatda: `http://localhost:5173`.

Local rejimda Vite API so‘rovlarini avtomatik ravishda `http://localhost:8000` dagi backendga yuboradi. Shu sabab backend ham ishga tushgan bo‘lishi kerak.

## Production uchun API manzili

Deploy qilishdan oldin loyiha ildizida `.env` fayl yarating va backendning public URL manzilini yozing:

```env
VITE_API_URL=https://api.example.com
```

`VITE_API_URL` oxiriga `/` qo‘ymang. Bu qiymat brauzerga yuboriladi, shuning uchun unda maxfiy kalit yoki parol saqlamang.

## Buyruqlar

```bash
npm run dev     # development server
npm run lint    # kod tekshiruvi
npm run build   # production build
npm run preview # build natijasini local ko‘rish
```

## Vercel’ga joylash

1. GitHub repository’ni Vercel’ga import qiling.
2. **Build Command** sifatida `npm run build` tanlang.
3. **Output Directory** sifatida `dist` tanlang.
4. Environment Variables bo‘limiga `VITE_API_URL` va production backend URL’ini kiriting.
5. Deploy qiling.

SPA routing uchun `vercel.json` tayyor: to‘g‘ridan-to‘g‘ri `/leads` yoki `/dashboard` sahifasini ochish ham ishlaydi.

## Link preview rasmi

`public/website.png` link ulashilganda preview rasmi bo‘lib ishlatiladi. Buning uchun Open Graph meta-teglari `index.html`ga qo‘shilgan.

Deploydan keyin preview chiqishi uchun rasm public bo‘lishi kerak, ya’ni quyidagi manzil brauzerda ochilishi lozim:

```text
https://saytingiz-domeningiz/website.png
```

Telegram, Instagram yoki boshqa tarmoqlarda eski preview cache’da qolishi mumkin. Bunday holatda bir necha daqiqa kuting yoki link oxiriga `?v=2` kabi yangi parametr qo‘shib yuboring.
