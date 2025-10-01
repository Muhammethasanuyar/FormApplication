# 🚀 Modern Form Builder

Modern Form Builder, React ve Node.js teknolojileri kullanılarak geliştirilmiş, profesyonel bir form oluşturma ve yönetim platformudur. Sürükle-bırak arayüzü ile kolayca formlar oluşturabilir, gönderileri takip edebilir ve özelleştirilebilir renk temaları ile kullanıcı deneyimini geliştirebilirsiniz.


## ✨ Özellikler

### 🎨 Form Oluşturma ve Tasarım
- **Sürükle-Bırak Arayüzü**: React Form Builder 2 entegrasyonu ile kolay form tasarımı
- **Zengin Bileşen Kütüphanesi**: Text, Email, Dropdown, Radio Button, TextArea ve daha fazlası
- **Dinamik Renk Temaları**: 30+ renk seçeneği ile canlı tema değişimi
- **Gerçek Zamanlı Önizleme**: Form tasarımını anında görüntüleme

### 🎯 Akıllı Form Elemanları
- **Türkiye Şehir Listesi**: Hazır Türkiye şehirleri dropdown'u
- **Renk Paleti Entegrasyonu**: Görsel renk seçici ile gelişmiş kullanıcı deneyimi
- **API Destekli Dropdown'lar**: Dinamik veri kaynakları ile beslenen seçim listeleri
- **Validasyon Desteği**: Form alanları için otomatik doğrulama

### 📊 Veri Yönetimi
- **MySQL Veritabanı**: Prisma ORM ile güçlü veri yönetimi
- **Form Şemaları**: JSON formatında esnek form yapıları
- **Submission Takibi**: Gönderilen formları detaylı izleme
- **Cascade Delete**: Form silindiğinde ilgili verilerin otomatik temizlenmesi

### 🔧 Teknik Özellikler
- **Modern Stack**: React 19, Node.js, Express, Prisma
- **TypeScript Desteği**: Tip güvenliği ve geliştirici deneyimi
- **Responsive Tasarım**: Mobil ve masaüstü uyumlu arayüz
- **RESTful API**: Standart HTTP yöntemleri ile API tasarımı

## 🛠️ Teknoloji Stack'i

### Frontend
- **React 19.1.1** - Modern UI kütüphanesi
- **React Router DOM 7.9.3** - SPA routing
- **React Form Builder 2** - Sürükle-bırak form oluşturucu
- **Vite 7.1.7** - Hızlı build tool
- **Axios** - HTTP istemcisi
- **Bootstrap 3** - UI framework
- **Font Awesome 4** - İkon kütüphanesi

### Backend
- **Node.js** - JavaScript runtime
- **Express 4.19.2** - Web framework
- **Prisma 6.16.3** - Modern ORM
- **MySQL** - İlişkisel veritabanı
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variables

### Geliştirme Araçları
- **ESLint** - Code linting
- **Nodemon** - Hot reload
- **Prisma Studio** - Veritabanı yönetimi

## 📁 Proje Yapısı

```
form-builder/
├── 📁 backend/                    # Node.js API servisi
│   ├── 📁 prisma/                # Veritabanı şemaları ve migrasyonlar
│   │   ├── schema.prisma         # Prisma şema dosyası
│   │   └── 📁 migrations/        # Veritabanı migrasyonları
│   ├── 📁 src/                   # Kaynak kodlar
│   │   ├── index.js             # Ana API server
│   │   ├── cities.js            # Türkiye şehirleri verisi
│   │   └── colors.js            # Renk paleti verisi
│   └── package.json             # Backend dependencies
├── 📁 frontend/                   # React uygulaması
│   ├── 📁 src/                   # React kaynak kodları
│   │   ├── 📁 pages/            # Sayfa bileşenleri
│   │   │   ├── FormsPage.jsx    # Ana form listesi
│   │   │   ├── BuilderPage.jsx  # Form oluşturucu
│   │   │   └── RenderPage.jsx   # Form görüntüleme
│   │   ├── App.jsx              # Ana uygulama bileşeni
│   │   ├── main.jsx             # Uygulama giriş noktası
│   │   └── styles.css           # Özel CSS stilleri
│   ├── index.html               # HTML template
│   ├── vite.config.js           # Vite konfigürasyonu
│   └── package.json             # Frontend dependencies
└── README.md                     # Proje dokümantasyonu
```

## 🚀 Kurulum ve Çalıştırma

### Ön Gereksinimler
- **Node.js** (v18 veya üzeri)
- **npm** veya **yarn**
- **MySQL** veritabanı

### 1. Projeyi Klonlayın
```bash
git clone <repository-url>
cd form-builder
```

### 2. Backend Kurulumu

```bash
# Backend dizinine gidin
cd backend

# Bağımlılıkları yükleyin
npm install

# Çevre değişkenlerini ayarlayın
cp .env.example .env
```

**.env dosyasını düzenleyin:**
```env
DATABASE_URL="mysql://username:password@localhost:3306/form_builder"
PORT=4000
```

```bash
# Veritabanı migrasyonlarını çalıştırın
npm run prisma:migrate

# Prisma client'ı oluşturun
npm run prisma:generate

# Backend'i başlatın
npm run dev
```

### 3. Frontend Kurulumu

```bash
# Yeni terminal açıp frontend dizinine gidin
cd frontend

# Bağımlılıkları yükleyin
npm install

# Frontend'i başlatın
npm run dev
```

### 4. Uygulamayı Açın
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000
- **Prisma Studio**: `npm run prisma:studio` (http://localhost:5555)

## 📋 API Endpoints

### Forms
- `GET /api/forms` - Tüm formları listele
- `POST /api/forms` - Yeni form oluştur
- `GET /api/forms/:id` - Form detayını getir
- `DELETE /api/forms/:id` - Form sil

### Submissions
- `POST /api/forms/:id/submissions` - Form gönderisi oluştur
- `GET /api/forms/:id/submissions` - Form gönderilerini listele

### Data Sources
- `GET /api/cities` - Türkiye şehirleri listesi
- `GET /api/colors` - Renk paleti listesi
- `GET /api/health` - API sağlık kontrolü

## 🎨 Kullanım Kılavuzu

### Form Oluşturma
1. Ana sayfada "Örnek Form Oluştur" butonuna tıklayın
2. Sürükle-bırak arayüzü ile form elemanlarını ekleyin
3. Her elemanın özelliklerini düzenleyin (label, name, required, vs.)
4. "Kaydet" butonuna tıklayarak formu saklayın

### Form Doldurma
1. Oluşturulan formun "Görüntüle" linkine tıklayın
2. Form alanlarını doldurun
3. Renk seçimi yapıldığında tema otomatik değişir
4. "Gönder" butonuna tıklayarak kaydedin

### Form Yönetimi
- **Listeleme**: Ana sayfada tüm formlar görünür
- **Silme**: Her formun yanındaki "Sil" butonunu kullanın
- **Düzenleme**: Form builder sayfasında mevcut formları yükleyebilirsiniz

## 🎯 Öne Çıkan Özellikler

### Dinamik Renk Temaları
Form doldururken renk seçimi yapıldığında, sayfa teması otomatik olarak değişir:
- 30+ profesyonel renk seçeneği
- Gerçek zamanlı tema değişimi
- Kullanıcı dostu görsel renk paleti

### Türkiye'ye Özel İçerik
- Tüm Türkiye şehirleri listesi
- Türkçe arayüz ve mesajlar
- Yerel kullanıcı deneyimi odaklı tasarım

### Modern Form Bileşenleri
- Email validasyonu
- Zorunlu alan kontrolü
- Dropdown'lar için API entegrasyonu
- Radio button grupları
- Çok satırlı metin alanları

## 🔧 Geliştirme Komutları

### Backend
```bash
npm run dev          # Development mode (nodemon)
npm start            # Production mode
npm run prisma:studio    # Veritabanı yönetim arayüzü
npm run prisma:migrate   # Yeni migrasyon çalıştır
npm run prisma:generate  # Prisma client güncelle
```

### Frontend
```bash
npm run dev         # Development server
npm run build       # Production build
npm run preview     # Production preview
npm run lint        # ESLint kontrolü
```

## 🗄️ Veritabanı Şeması

### Form Tablosu
```sql
CREATE TABLE Form (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(191) NOT NULL,
    schema JSON NOT NULL,
    createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL
);
```

### Submission Tablosu
```sql
CREATE TABLE Submission (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    formId INTEGER NOT NULL,
    payload JSON NOT NULL,
    createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    FOREIGN KEY (formId) REFERENCES Form(id) ON DELETE CASCADE
);
```

## 🚀 Production Deployment

### Backend Deployment
1. Çevre değişkenlerini production'a göre ayarlayın
2. `npm run build` (eğer build script'i varsa)
3. `npm start` ile servisi başlatın
4. Nginx/Apache ile reverse proxy ayarlayın

### Frontend Deployment
1. `npm run build` ile production build alın
2. `dist/` klasörünü web server'a yükleyin
3. API URL'ini production endpoint'e çevirin

### Environment Variables
```env
# Production
DATABASE_URL="mysql://user:password@prod-host:3306/form_builder"
PORT=4000
NODE_ENV=production

FORM LİNKİ : http://localhost:5173/forms/2 

## 📞 İletişim

- **Geliştirici**: Muhammet Hasan Uyar
- **GitHub**: [@Muhammethasanuyar](https://github.com/Muhammethasanuyar)
- **Repository**: FormApplication



---

