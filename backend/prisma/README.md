# Form Builder - Database Seed

Bu dizin veritabanı için örnek verileri (seed) içerir.

## Seed Dosyası

`seed.js` dosyası şu örnek formları ve verilerini içerir:

### 📋 Örnek Formlar

1. **Kullanıcı Kayıt Formu**
   - Ad, Soyad, E-posta, Telefon
   - Şehir seçimi, Renk tercihi
   - Hobi seçimi (çoklu), Bio

2. **Etkinlik Kayıt Formu**
   - Katılımcı bilgileri
   - Yaş grubu, Etkinlik türü
   - Deneyim seviyesi, Özel istekler

3. **Müşteri Geri Bildirim Formu**
   - Müşteri bilgileri, Hizmet türü
   - Memnuniyet seviyesi, Tavsiye durumu
   - İyileştirme alanları, Renk tercihi

4. **İş Başvuru Formu**
   - Başvuru sahibi bilgileri
   - Pozisyon, Deneyim seviyesi
   - Teknik yetenekler, Uzaktan çalışma tercihi

### 📊 Örnek Veriler

Her form için örnek submission verileri de dahil edilmiştir.

## Kullanım

```bash
# Seed verisini ekle
npm run prisma:seed

# Veritabanını sıfırla ve seed ekle
npm run db:reset
```

## Not

Seed işlemi mevcut tüm verileri siler ve örnek verileri yeniden oluşturur.