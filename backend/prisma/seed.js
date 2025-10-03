import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Örnek form şemaları
const sampleForms = [
  {
    name: "Kullanıcı Kayıt Formu",
    schema: [
      {
        id: "firstName",
        element: "TextInput",
        text: "Ad",
        field_name: "first_name",
        required: true,
        label: "Ad"
      },
      {
        id: "lastName", 
        element: "TextInput",
        text: "Soyad",
        field_name: "last_name",
        required: true,
        label: "Soyad"
      },
      {
        id: "email",
        element: "EmailInput",
        text: "E-posta",
        field_name: "email",
        required: true,
        label: "E-posta Adresi"
      },
      {
        id: "phone",
        element: "PhoneNumber",
        text: "Telefon",
        field_name: "phone",
        required: false,
        label: "Telefon Numarası"
      },
      {
        id: "city",
        element: "Dropdown",
        text: "Şehir",
        field_name: "city",
        required: true,
        label: "Şehir",
        options: [
          { text: "İstanbul", value: "Istanbul" },
          { text: "Ankara", value: "Ankara" },
          { text: "İzmir", value: "Izmir" },
          { text: "Bursa", value: "Bursa" },
          { text: "Antalya", value: "Antalya" }
        ]
      },
      {
        id: "favColor",
        element: "Dropdown", 
        text: "Sevdiğin Renk",
        field_name: "fav_color",
        required: false,
        label: "Sevdiğin Renk",
        class_name: "favorite-color",
        options: [
          { text: "Mavi", value: "#3b82f6" },
          { text: "Yeşil", value: "#22c55e" },
          { text: "Kırmızı", value: "#ef4444" },
          { text: "Mor", value: "#a855f7" },
          { text: "Turuncu", value: "#f97316" }
        ]
      },
      {
        id: "hobbies",
        element: "Checkboxes",
        text: "Hobiler",
        field_name: "hobbies",
        required: false,
        label: "Hobiler",
        options: [
          { text: "Kitap Okuma", value: "reading" },
          { text: "Müzik Dinleme", value: "music" },
          { text: "Spor Yapma", value: "sports" },
          { text: "Film İzleme", value: "movies" },
          { text: "Seyahat", value: "travel" },
          { text: "Fotoğrafçılık", value: "photography" }
        ]
      },
      {
        id: "bio",
        element: "TextArea",
        text: "Hakkınızda",
        field_name: "bio",
        required: false,
        label: "Kendinizi Tanıtın"
      }
    ]
  },
  {
    name: "Etkinlik Kayıt Formu",
    schema: [
      {
        id: "eventName",
        element: "Header",
        text: "Etkinlik Kayıt Formu"
      },
      {
        id: "participantName",
        element: "TextInput",
        text: "Katılımcı Adı",
        field_name: "participant_name",
        required: true,
        label: "Ad Soyad"
      },
      {
        id: "email",
        element: "EmailInput", 
        text: "E-posta",
        field_name: "email",
        required: true,
        label: "E-posta Adresi"
      },
      {
        id: "ageGroup",
        element: "RadioButtons",
        text: "Yaş Grubu",
        field_name: "age_group",
        required: true,
        label: "Yaş Grubu",
        options: [
          { text: "18-25", value: "18-25" },
          { text: "26-35", value: "26-35" },
          { text: "36-45", value: "36-45" },
          { text: "46+", value: "46+" }
        ]
      },
      {
        id: "eventType",
        element: "Dropdown",
        text: "Etkinlik Türü",
        field_name: "event_type", 
        required: true,
        label: "Hangi Etkinlik Türünü Tercih Edersiniz?",
        options: [
          { text: "Konferans", value: "conference" },
          { text: "Workshop", value: "workshop" },
          { text: "Seminer", value: "seminar" },
          { text: "Networking", value: "networking" }
        ]
      },
      {
        id: "experience",
        element: "RadioButtons",
        text: "Deneyim Seviyesi",
        field_name: "experience_level",
        required: true,
        label: "Deneyim Seviyeniz",
        options: [
          { text: "Başlangıç", value: "beginner" },
          { text: "Orta", value: "intermediate" },
          { text: "İleri", value: "advanced" }
        ]
      },
      {
        id: "specialRequests",
        element: "TextArea",
        text: "Özel İstekler",
        field_name: "special_requests",
        required: false,
        label: "Özel İstekleriniz (Opsiyonel)"
      }
    ]
  },
  {
    name: "Müşteri Geri Bildirim Formu",
    schema: [
      {
        id: "customerInfo",
        element: "Header", 
        text: "Müşteri Geri Bildirim Formu"
      },
      {
        id: "customerName",
        element: "TextInput",
        text: "Müşteri Adı",
        field_name: "customer_name",
        required: true,
        label: "Ad Soyad"
      },
      {
        id: "email",
        element: "EmailInput",
        text: "E-posta",
        field_name: "email", 
        required: true,
        label: "E-posta Adresi"
      },
      {
        id: "serviceType",
        element: "Dropdown",
        text: "Hizmet Türü",
        field_name: "service_type",
        required: true,
        label: "Hangi Hizmetimizi Kullandınız?",
        options: [
          { text: "Web Tasarım", value: "web_design" },
          { text: "Mobil Uygulama", value: "mobile_app" },
          { text: "E-ticaret", value: "ecommerce" },
          { text: "Danışmanlık", value: "consulting" },
          { text: "Destek", value: "support" }
        ]
      },
      {
        id: "satisfaction",
        element: "RadioButtons",
        text: "Memnuniyet",
        field_name: "satisfaction_level",
        required: true,
        label: "Hizmetimizden Ne Kadar Memnunsunuz?",
        options: [
          { text: "Çok Memnun", value: "very_satisfied" },
          { text: "Memnun", value: "satisfied" },
          { text: "Orta", value: "neutral" },
          { text: "Memnun Değil", value: "dissatisfied" },
          { text: "Hiç Memnun Değil", value: "very_dissatisfied" }
        ]
      },
      {
        id: "recommendation",
        element: "RadioButtons",
        text: "Tavsiye",
        field_name: "would_recommend",
        required: true,
        label: "Bizi Arkadaşlarınıza Tavsiye Eder misiniz?",
        options: [
          { text: "Kesinlikle Evet", value: "definitely_yes" },
          { text: "Muhtemelen Evet", value: "probably_yes" },
          { text: "Kararsızım", value: "neutral" },
          { text: "Muhtemelen Hayır", value: "probably_no" },
          { text: "Kesinlikle Hayır", value: "definitely_no" }
        ]
      },
      {
        id: "improvements",
        element: "Checkboxes",
        text: "İyileştirme Alanları",
        field_name: "improvement_areas",
        required: false,
        label: "Hangi Alanlarda İyileştirme Yapabiliriz?",
        options: [
          { text: "İletişim", value: "communication" },
          { text: "Hız", value: "speed" },
          { text: "Kalite", value: "quality" },
          { text: "Fiyat", value: "price" },
          { text: "Kullanım Kolaylığı", value: "usability" },
          { text: "Destek", value: "support" }
        ]
      },
      {
        id: "favColor",
        element: "Dropdown",
        text: "Marka Rengi Tercihi", 
        field_name: "fav_color",
        required: false,
        label: "Hangi Rengi Daha Çok Seviyorsunuz?",
        class_name: "favorite-color",
        options: [
          { text: "Mavi", value: "#3b82f6" },
          { text: "Yeşil", value: "#22c55e" },
          { text: "Mor", value: "#a855f7" },
          { text: "Turuncu", value: "#f97316" },
          { text: "Kırmızı", value: "#ef4444" }
        ]
      },
      {
        id: "additionalComments",
        element: "TextArea",
        text: "Ek Yorumlar",
        field_name: "additional_comments",
        required: false,
        label: "Başka Söylemek İstedikleriniz"
      }
    ]
  },
  {
    name: "İş Başvuru Formu",
    schema: [
      {
        id: "jobHeader",
        element: "Header",
        text: "İş Başvuru Formu"
      },
      {
        id: "applicantName",
        element: "TextInput", 
        text: "Ad Soyad",
        field_name: "applicant_name",
        required: true,
        label: "Ad Soyad"
      },
      {
        id: "email",
        element: "EmailInput",
        text: "E-posta",
        field_name: "email",
        required: true,
        label: "E-posta Adresi"
      },
      {
        id: "phone",
        element: "PhoneNumber",
        text: "Telefon",
        field_name: "phone",
        required: true,
        label: "Telefon Numarası"
      },
      {
        id: "position",
        element: "Dropdown",
        text: "Pozisyon",
        field_name: "position",
        required: true,
        label: "Başvurduğunuz Pozisyon",
        options: [
          { text: "Frontend Developer", value: "frontend_dev" },
          { text: "Backend Developer", value: "backend_dev" },
          { text: "Full Stack Developer", value: "fullstack_dev" },
          { text: "UI/UX Designer", value: "ui_ux_designer" },
          { text: "Product Manager", value: "product_manager" },
          { text: "DevOps Engineer", value: "devops_engineer" }
        ]
      },
      {
        id: "experience",
        element: "RadioButtons",
        text: "Deneyim",
        field_name: "experience_years",
        required: true,
        label: "Kaç Yıl Deneyiminiz Var?",
        options: [
          { text: "0-1 yıl", value: "0-1" },
          { text: "2-3 yıl", value: "2-3" },
          { text: "4-6 yıl", value: "4-6" },
          { text: "7+ yıl", value: "7+" }
        ]
      },
      {
        id: "skills",
        element: "Checkboxes",
        text: "Yetenekler",
        field_name: "skills",
        required: true,
        label: "Hangi Teknolojilerde Deneyiminiz Var?",
        options: [
          { text: "JavaScript", value: "javascript" },
          { text: "React", value: "react" },
          { text: "Node.js", value: "nodejs" },
          { text: "Python", value: "python" },
          { text: "PHP", value: "php" },
          { text: "Java", value: "java" },
          { text: "C#", value: "csharp" },
          { text: "SQL", value: "sql" }
        ]
      },
      {
        id: "remoteWork",
        element: "RadioButtons",
        text: "Uzaktan Çalışma",
        field_name: "remote_work_preference",
        required: true,
        label: "Uzaktan Çalışma Tercihiniz",
        options: [
          { text: "Tamamen Uzaktan", value: "fully_remote" },
          { text: "Hibrit", value: "hybrid" },
          { text: "Sadece Ofis", value: "office_only" }
        ]
      },
      {
        id: "coverLetter",
        element: "TextArea",
        text: "Ön Yazı",
        field_name: "cover_letter",
        required: false,
        label: "Neden Bu Pozisyon İçin Uygun Olduğunuzu Anlatın"
      }
    ]
  }
];

// Örnek submission verileri
const sampleSubmissions = [
  {
    formId: 1, // Kullanıcı Kayıt Formu
    payload: [
      { name: "first_name", value: "Ahmet" },
      { name: "last_name", value: "Yılmaz" },
      { name: "email", value: "ahmet.yilmaz@email.com" },
      { name: "phone", value: "0555 123 4567" },
      { name: "city", value: "Istanbul" },
      { name: "fav_color", value: "#3b82f6" },
      { name: "hobbies", value: ["reading", "music", "sports"] },
      { name: "bio", value: "Yazılım geliştirme alanında çalışan bir mühendisim." }
    ]
  },
  {
    formId: 1, // Kullanıcı Kayıt Formu  
    payload: [
      { name: "first_name", value: "Elif" },
      { name: "last_name", value: "Kara" },
      { name: "email", value: "elif.kara@email.com" },
      { name: "phone", value: "0532 987 6543" },
      { name: "city", value: "Ankara" },
      { name: "fav_color", value: "#22c55e" },
      { name: "hobbies", value: ["movies", "travel", "photography"] },
      { name: "bio", value: "Grafik tasarım ve sanat ile ilgileniyorum." }
    ]
  },
  {
    formId: 2, // Etkinlik Kayıt Formu
    payload: [
      { name: "participant_name", value: "Mehmet Demir" },
      { name: "email", value: "mehmet.demir@email.com" },
      { name: "age_group", value: "26-35" },
      { name: "event_type", value: "workshop" },
      { name: "experience_level", value: "intermediate" },
      { name: "special_requests", value: "Vejetaryen yemek seçeneği istiyorum." }
    ]
  },
  {
    formId: 3, // Müşteri Geri Bildirim Formu
    payload: [
      { name: "customer_name", value: "Ayşe Öztürk" },
      { name: "email", value: "ayse.ozturk@email.com" },
      { name: "service_type", value: "web_design" },
      { name: "satisfaction_level", value: "very_satisfied" },
      { name: "would_recommend", value: "definitely_yes" },
      { name: "improvement_areas", value: ["communication", "speed"] },
      { name: "fav_color", value: "#a855f7" },
      { name: "additional_comments", value: "Çok profesyonel bir hizmet aldık, teşekkürler!" }
    ]
  },
  {
    formId: 4, // İş Başvuru Formu
    payload: [
      { name: "applicant_name", value: "Can Özkan" },
      { name: "email", value: "can.ozkan@email.com" },
      { name: "phone", value: "0544 555 1234" },
      { name: "position", value: "frontend_dev" },
      { name: "experience_years", value: "4-6" },
      { name: "skills", value: ["javascript", "react", "nodejs"] },
      { name: "remote_work_preference", value: "hybrid" },
      { name: "cover_letter", value: "5 yıllık deneyimim ile ekibinize katkı sağlamak istiyorum." }
    ]
  }
];

async function main() {
  console.log('🌱 Seed verisi ekleniyor...');

  // Önce mevcut verileri temizle
  await prisma.submission.deleteMany({});
  await prisma.form.deleteMany({});

  console.log('🗑️  Mevcut veriler temizlendi');

  // Örnek formları ekle
  for (const formData of sampleForms) {
    const form = await prisma.form.create({
      data: formData
    });
    console.log(`✅ Form oluşturuldu: ${form.name} (ID: ${form.id})`);
  }

  // Örnek submission'ları ekle
  for (const submissionData of sampleSubmissions) {
    const submission = await prisma.submission.create({
      data: submissionData
    });
    console.log(`📝 Submission oluşturuldu: Form ${submission.formId} için (ID: ${submission.id})`);
  }

  console.log('🎉 Seed işlemi tamamlandı!');
  console.log('');
  console.log('📋 Oluşturulan formlar:');
  console.log('1. Kullanıcı Kayıt Formu');
  console.log('2. Etkinlik Kayıt Formu'); 
  console.log('3. Müşteri Geri Bildirim Formu');
  console.log('4. İş Başvuru Formu');
  console.log('');
  console.log('🌐 Frontend\'te görüntülemek için:');
  console.log('http://localhost:5173/forms/1');
  console.log('http://localhost:5173/forms/2');
  console.log('http://localhost:5173/forms/3');
  console.log('http://localhost:5173/forms/4');
}

main()
  .catch((e) => {
    console.error('❌ Seed hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });