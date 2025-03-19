let map;
let circle;
let marker;
let baseMaps;

window.onload = function() {
    // 初期位置（東京タワー）
    const initialLat = 35.6586;
    const initialLng = 139.7454;
    
    // 地図を初期化
    map = L.map('map').setView([initialLat, initialLng], 20);
    
    // 通常の地図レイヤー
    const streets = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    });

    // 航空写真レイヤー
    const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });

    // Google Satelliteレイヤー
    const googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        maxZoom: 24,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: '© Google'
    });

    // レイヤー制御を追加
    baseMaps = {
        "地図": streets,
        "航空写真 (ESRI)": satellite,
        "航空写真 (Google)": googleSat
    };

    // デフォルトで航空写真を表示
    streets.addTo(map);

    // レイヤーコントロールを追加
    L.control.layers(baseMaps).addTo(map);

    // ドラッグ可能なマーカーを作成
    marker = L.marker([initialLat, initialLng], {
        draggable: true
    }).addTo(map);

    // マーカーのドラッグ終了時のイベント
    marker.on('dragend', function(event) {
        const position = marker.getLatLng();
        updateCoordinates(position.lat, position.lng);
        updateCircle();
    });

    // 初期の円を描画
    updateCircle();
}

// 座標表示を更新
function updateCoordinates(lat, lng) {
    document.getElementById('currentLat').textContent = lat.toFixed(6);
    document.getElementById('currentLng').textContent = lng.toFixed(6);
}

// 円を更新
function updateCircle() {
    if (circle) {
        map.removeLayer(circle);
    }

    const position = marker.getLatLng();
    const radius = parseFloat(document.getElementById('radius').value);

    circle = L.circle([position.lat, position.lng], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.3,
        radius: radius
    }).addTo(map);

    updateCoordinates(position.lat, position.lng);
}

// 住所検索
async function searchAddress() {
    const address = document.getElementById('address').value;
    if (!address) return;

    try {
        // Nominatim APIを使用して住所を検索
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
        const data = await response.json();

        if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lng = parseFloat(data[0].lon);
            
            // マーカーと地図を移動
            marker.setLatLng([lat, lng]);
            map.setView([lat, lng], 20);
            updateCircle();
        } else {
            alert('住所が見つかりませんでした。');
        }
    } catch (error) {
        alert('検索中にエラーが発生しました。');
        console.error(error);
    }
}

// 座標検索
function searchCoordinates() {
    const lat = parseFloat(document.getElementById('searchLat').value);
    const lng = parseFloat(document.getElementById('searchLng').value);

    if (isNaN(lat) || isNaN(lng)) {
        alert('有効な緯度・経度を入力してください。');
        return;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        alert('有効な範囲で入力してください。\n緯度: -90～90\n経度: -180～180');
        return;
    }

    // マーカーと地図を移動
    marker.setLatLng([lat, lng]);
    map.setView([lat, lng], 20);
    updateCircle();
}

// 地図クリック時のイベント
map.on('click', function(e) {
    marker.setLatLng(e.latlng);
    updateCircle();
});