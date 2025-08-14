// Ganti dengan URL web app Google Apps Script Anda
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbz5S10ON7zjPP21UgVGEka66Ae-j9RzKg6v3RXCH65Ts-2fPGlBJB1bubMLApY1PVM97Q/exec";

document.addEventListener("DOMContentLoaded", () => {
  processAbsence();
});

async function processAbsence() {
  const loadingSpinner = document.getElementById("loading-spinner");
  const statusContainer = document.getElementById("status-container");
  const statusMessage = document.getElementById("status-message");
  const keterangan = document.getElementById("keterangan");
  const storeInfo = document.getElementById("store-info");

  loadingSpinner.style.display = "block";
  statusContainer.style.display = "none";

  try {
    // Ambil data dari URL (simulasi dari QR code) -7.743456665256702, 110.4667309929915
    const urlParams = new URLSearchParams(window.location.search);
    const storeId = urlParams.get("storeId") || "Pundung";
    const storeLat = urlParams.get("lat") || "-7.743456665256702"; // Contoh koordinat Jakarta
    const storeLon = urlParams.get("lon") || "110.4667309929915";
    const storeOpenTime = urlParams.get("openTime") || "10:00";
    const namaCapster = "Nama Capster"; // Ganti dengan cara mendapatkan nama capster (misal dari login)
    const checkinTime = new Date();

    // Dapatkan geolokasi capster
    const capsterCoords = await getCurrentPosition();

    storeInfo.innerText = `Store ID: ${storeId} | Waktu Absensi: ${checkinTime.toLocaleString(
      "id-ID"
    )}`;

    // Kirim data ke Google Apps Script
    const response = await fetch(WEB_APP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storeId: storeId,
        storeLat: storeLat,
        storeLon: storeLon,
        checkinTime: checkinTime,
        capsterLat: capsterCoords.latitude,
        capsterLon: capsterCoords.longitude,
        namaCapster: namaCapster,
        storeOpenTime: storeOpenTime,
      }),
    });

    const result = await response.json();

    // Tampilkan hasil
    statusMessage.innerText = result.status;
    keterangan.innerText = result.keterangan;

    // Atur warna berdasarkan status
    statusMessage.className = `status-${result.status
      .toLowerCase()
      .replace(" ", "-")}`;
  } catch (error) {
    console.error("Error:", error);
    statusMessage.innerText = "Error";
    keterangan.innerText = "Terjadi kesalahan saat memproses absensi.";
    statusMessage.className = "status-error";
  } finally {
    loadingSpinner.style.display = "none";
    statusContainer.style.display = "block";
  }
}

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject("Gagal mendapatkan lokasi: " + error.message);
        }
      );
    } else {
      reject("Geolocation tidak didukung oleh browser ini.");
    }
  });
}
