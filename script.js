// Ganti dengan URL web app Google Apps Script Anda
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbz5S10ON7zjPP21UgVGEka66Ae-j9RzKg6v3RXCH65Ts-2fPGlBJB1bubMLApY1PVM97Q/exec";

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const storeName = urlParams.get("storeName");

    if (storeName) {
        document.getElementById('store-info').innerText = `Anda akan absen di toko: ${storeName}`;
        fetchCapstersAndPopulateDropdown();
        
        document.getElementById('submitBtn').addEventListener('click', () => {
            processAbsence();
        });
    } else {
        document.getElementById('store-info').innerText = 'QR Code tidak valid.';
        document.getElementById('loading-spinner').style.display = 'none';
    }
});

async function fetchCapstersAndPopulateDropdown() {
    try {
        const response = await fetch(WEB_APP_URL);
        const capsters = await response.json();
        
        const selectElement = document.getElementById("capsterSelect");
        if (capsters.length > 0) {
            selectElement.innerHTML = '<option value="">-- Pilih Capster --</option>';
            capsters.forEach(capster => {
                const option = document.createElement("option");
                option.value = capster.id;
                option.text = capster.nama;
                selectElement.appendChild(option);
            });
            document.getElementById('loading-spinner').style.display = 'none';
            document.getElementById('form-container').style.display = 'block';
        } else {
            selectElement.innerHTML = '<option value="">Tidak ada capster terdaftar.</option>';
        }
    } catch (error) {
        document.getElementById("status-container").style.display = "block";
        document.getElementById("status-message").innerText = "Error";
        document.getElementById("keterangan").innerText = "Gagal memuat daftar capster. " + error.message;
        document.getElementById('loading-spinner').style.display = 'none';
    }
}

async function processAbsence() {
    const formContainer = document.getElementById("form-container");
    const loadingSpinner = document.getElementById("loading-spinner");
    const statusContainer = document.getElementById("status-container");
    const statusMessage = document.getElementById("status-message");
    const keterangan = document.getElementById("keterangan");

    const capsterSelect = document.getElementById("capsterSelect");
    const capsterId = capsterSelect.value;
    if (!capsterId) {
        alert("Mohon pilih nama Anda.");
        return;
    }

    formContainer.style.display = "none";
    loadingSpinner.style.display = "block";
    statusContainer.style.display = "none";

    try {
        const urlParams = new URLSearchParams(window.location.search);
        const storeName = urlParams.get("storeName");
        const storeOpenTime = urlParams.get("openTime");
        const storeCloseTime = urlParams.get("closeTime");
        const storeLat = urlParams.get("lat");
        const storeLon = urlParams.get("lon");
        const checkinTime = new Date();
        const capsterCoords = await getCurrentPosition();

        const response = await fetch(WEB_APP_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                storeName: storeName,
                openTime: storeOpenTime,
                closeTime: storeCloseTime,
                storeLat: storeLat,
                storeLon: storeLon,
                capsterId: capsterId,
                checkinTime: checkinTime,
                capsterLat: capsterCoords.latitude,
                capsterLon: capsterCoords.longitude,
            }),
        });

        const result = await response.json();
        statusMessage.innerText = result.status;
        keterangan.innerText = result.keterangan;
        statusMessage.className = `status-${result.status.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
    } catch (error) {
        console.error("Error:", error);
        statusMessage.innerText = "Error";
        keterangan.innerText = "Terjadi kesalahan saat memproses absensi: " + error.message;
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
