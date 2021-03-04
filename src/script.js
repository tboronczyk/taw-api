document.getElementById('airports').innerText = config.airports.join(', ');

const map = L.map('map', {
    center: [39.5, -95.0],
    zoom: 5
});

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    accessToken: config.MAPBOX_KEY,
    maxZoom: 8,
    minZoom: 4,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1
}).addTo(map);

const icon = L.icon({
    iconUrl: 'icon.png',
    iconSize: [36, 36],
    iconAnchor: [18, 18]
});

config.airports.forEach(airport => {
    // departure and arrival
    ['dep', 'arr'].forEach(route => {
        const url = (config.useLive)
            ? `http://api.aviationstack.com/v1/flights?access_key=${config.AVIATIONSTACK_KEY}` +
                `&limit=100&${route}_iata=${airport}&flight_status=active`
            : `data/${airport}-${route}.json`;
        fetch(url)
            .then(resp => resp.json())
            .then(resp => {
                resp.data.forEach(flight => {
                    if (flight.live) {
                        L.marker([flight.live.latitude, flight.live.longitude], {
                            icon,
                            rotationAngle: flight.live.direction + 45
                        })
                        .bindPopup(
                            `<b class="bigger">${flight.flight.icao}</b><br>` +
                            `<b>${flight.departure.iata} → ${flight.arrival.iata}</b><br>` +
                            '<span class="light">' +
                            `${flight.live.latitude}, ${flight.live.longitude}` +
                            (flight.live.altitude ? `<br>${Math.floor(flight.live.altitude / 3.28084)} ft` : '') +
                            '</span>'
                        )
                        .addTo(map);
                    }
                });
            })
            .catch(err => console.log(err));
    });
});
