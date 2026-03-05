# Panduan Penggunaan FastAPI Swagger UI (`/docs`)

FastAPI menyediakan dokumentasi interaktif secara otomatis di endpoint `/docs`. Karena aplikasi RBAC ini menggunakan sistem Autentikasi JWT (JSON Web Tokens), Anda tidak bisa langsung melakukan akses/tes API ("Try it out") pada endpoint yang diproteksi (membutuhkan *Login* / *Permission*). Anda akan mendapatkan error `401 Unauthorized` atau `403 Forbidden`.

Berikut adalah langkah-langkah untuk melakukan Autentikasi (Authorize) di `/docs`:

## Langkah 1: Buka Swagger UI
Buka browser dan akses URL dokumentasi API di: **http://127.0.0.1:8000/docs**

## Langkah 2: Lakukan Login untuk Mendapatkan Token JWT
1. Scroll ke bagian endpoint **`auth`** dan cari endpoint **`POST /api/auth/login`**.
2. Klik baris endpoint tersebut untuk membuka detailnya.
3. Klik tombol **"Try it out"** di pojok kanan atas kotak endpoint.
4. Masukkan kredensial login Anda di form **Request body**:
   ```json
   {
     "username": "admin",
     "password": "password"
   }
   ```
   *(Gunakan username dan password admin yang sesuai)*
5. Klik baris besar berwarna biru bertuliskan **"Execute"**.
6. Gulir ke bawah ke bagian **Server response** -> **Response body**. Anda akan melihat respon sukses dengan `access_token` yang sangat panjang. Contoh:
   ```json
   {
     "access_token": "eyJhbGciOiJIUzI1NiIsInR...",
     "token_type": "bearer"
   }
   ```
7. Blok/Sorot tipe *string* "token" yang panjang tersebut (yaitu nilai dari bagian `access_token` **TANPA tanda kutip**) lalu tekan **Copy / Ctrl+C**.

## Langkah 3: Authorize Swagger UI
1. Scroll kembali ke bagian paling atas ("Root") halaman `/docs`.
2. Di kanan atas layar, terdapat tombol dengan ikon gembok bertuliskan **"Authorize"**. Klik tombol tersebut.
3. Sebuah pop-up "Available authorizations" akan terbuka. Biasanya FastAPI meminta input di kotak nilai (Value).
4. Karena format keamanan di backend menggunakan header `Authorization: Bearer <token>`, silakan ketik langsung token yang sudah Anda Copy ke dalam kotak isian teks tersebut.
   * *Catatan:* Di tampilan FastAPI Oauth2PasswordBearer, nama kotaknya biasa disebut "token". Anda cukup mem-**Paste** teks token yang panjang tadi (tidak perlu mengetik kata "Bearer " di awalnya secara manual apabila setup Oauth2PasswordBearer standar FastAPI yang dipakai, sistem akan otomatis menambahkannya).
5. Klik tombol **"Authorize"** hijau yang ada di bawah form isian.
6. Akan muncul tanda gembok menjadi tertutup. Klik opsi **"Close"** untuk menutup popup.

## Langkah 4: Mulai Tes Endpoint Lain
Sekarang gembok kecil di setiap endpoint API akan berubah menjadi **terkunci**. Ini artinya *Swagger UI* Anda sekarang akan selalu mengirimkan Token JWT *Login* tersebut di setiap Request baru.

Anda tinggal mengetes endpoint lain seperti:
1. Klik **`GET /api/users/`**
2. Klik **"Try it out"**
3. Klik **"Execute"**
Dan Anda akan melihat datanya berhasil diambil (`200 OK`) asalkan peran (Role) Anda saat login mendukung *Permission* akses-nya. 

---
**PENTING**: Token JWT biasanya memiliki masa kadaluarsa (contoh: 30 menit). Jika saat "Execute" Anda mendadak menemui *Error 401*, kemungkinan besar tokennya sudah basi. Silakan kembalikan langkah ini ke **Langkah 2** untuk mengambil *Token* yang baru.
