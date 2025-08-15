// Ganti dengan URL web app Google Apps Script Anda
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbz5S10ON7zjPP21UgVGEka66Ae-j9RzKg6v3RXCH65Ts-2fPGlBJB1bubMLApY1PVM97Q/exec";

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const storeName = urlParams.get("storeName");

    if (storeName) {
        document.getElementById('store-info').innerText = `Anda akan absen di toko: ${storeName}`;
        document.getElementById('form-container').style.display = 'block';
        document.getElementById('loading-spinner').style.display = 'none';
        
        document.getElementById('submitBtn').addEventListener('click', () => {
            processAbsence();
        });
    } else {
        document.getElementById('store-info').innerText = 'QR Code tidak valid.';
        document.getElementById('loading-spinner').style.display = 'none';
    }
});

async function processAbsence() {
    const formContainer = document.getElementById("form-container");
    const loadingSpinner = document.getElementById("loading-spinner");
    const statusContainer = document.getElementById("status-container");
    const statusMessage = document.getElementById("status-message");
    const keterangan = document.getElementById("keterangan");

    const capsterName = document.getElementById('capsterName').value;
    if (!capsterName) {
        alert("Mohon masukkan nama Anda.");
        return;
    }

    formContainer.style.display = "none";
    loadingSpinner.style.display = "block";
    statusContainer.style.display = "none";

    try {
        const urlParams = new URLSearchParams(window.location.search);
        const storeName = urlParams.get("storeName");
        const storeId = urlParams.get("storeId");
        const openTime = urlParams.get("openTime");
        const closeTime = urlParams.get("closeTime");
        const storeLat = urlParams.get("lat");
        const storeLon = urlParams.get("lon");

        const checkinTime = new Date();
        const capsterCoords = await getCurrentPosition();

        const response = await fetch(WEB_APP_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                storeName: storeName,
                storeId: storeId,
                openTime: openTime,
                closeTime: closeTime,
                storeLat: storeLat,
                storeLon: storeLon,
                capsterName: capsterName,
                checkinTime: checkinTime,
                capsterLat: capsterCoords.latitude,
                capsterLon: capsterCoords.longitude,
                qrCodeUrl: window.location.href
            }),
        });

        const result = await response.json();

        statusMessage.innerText = result.status;
        keterangan.innerText = result.keterangan;
        statusMessage.className = `status-${result.status.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;

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
