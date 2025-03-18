let map;
let circle;
let marker;

// 地図の初期化
window.onload = function() {
    // 初期位置（東京タワー）
    const initialLat = 35.6586;
    const initialLng = 139.7454;
    
    // 地図を初期化
    map = L.map('map').setView([initialLat, initialLng], 14);
    
    // OpenStreetMapのタイルを追加
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

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
            map.setView([lat, lng], 14);
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
    map.setView([lat, lng], 14);
    updateCircle();
}

// 地図クリック時のイベント
map.on('click', function(e) {
    marker.setLatLng(e.latlng);
    updateCircle();
});