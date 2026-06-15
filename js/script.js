mapboxgl.accessToken =
  'pk.eyJ1Ijoic2hhb3dlaXciLCJhIjoiY21xNzN3YnZiMDdsMTJyb2d4cmhsMWlqbyJ9.UzSZhQi1J3OhSw9uqHUL0w';

document.addEventListener('DOMContentLoaded', () => {
  const intro = document.getElementById('intro');
  const enter = document.getElementById('intro-enter');
  if (enter) {
    enter.addEventListener('click', () => {
      intro.classList.add('gone');
      document.body.classList.remove('intro-active');
      revealLayers();
    });
  }
});

const OVERVIEW = { center: [-124.155, 41.138], zoom: 13.5, pitch: 0, bearing: 0 };
const OCHRE = '#a55f32';
const COLD  = '#6b7d83';
const PANEL_W = 460;

const CAMERA = {
  "Chkweges 'W-a'aag": { zoom: 16.5, pitch: 75, bearing: 270, duration: 2000 },
  "Sumêg Village":     { zoom: 17.5, pitch: 68, bearing: 120, duration: 1900 },
  "Sue-meg Point":     { zoom: 15,   pitch: 0,  bearing: 0,   duration: 1500 }
};
const CAMERA_DEFAULT = { zoom: 15, pitch: 0, bearing: 0, duration: 1500 };

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/shaoweiw/cmq7472d3001101sqhlj42u35',
  center: OVERVIEW.center,
  zoom: OVERVIEW.zoom
});

let sidebarOpen = false;

map.on('load', () => {
  try { map.setConfigProperty('basemap', 'showPointOfInterestLabels', false); } catch (e) {}

  map.addSource('points-data', { type: 'geojson', data: 'data/data.geojson' });

  map.addLayer({
    id: 'points-layer',
    type: 'circle',
    source: 'points-data',
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 11, 5, 15, 9],
      'circle-color': ['match', ['get', 'feature_type'], 'water', COLD, OCHRE],
      'circle-stroke-width': 2,
      'circle-stroke-color': '#f4ecd8'
    }
  });

  map.addLayer({
    id: 'points-label',
    type: 'symbol',
    source: 'points-data',
    layout: {
      'text-field': ['get', 'feature_name'],
      'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
      'text-size': 12,
      'text-offset': [0, 1.2],
      'text-anchor': 'top'
    },
    paint: {
      'text-color': '#2b2118',
      'text-halo-color': '#ece2cc',
      'text-halo-width': 1.5
    }
  });

  map.addSource('park-area-label', {
    type: 'geojson',
    data: {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-124.156, 41.135] },
      properties: { title: 'SUE-MEG STATE PARK' }
    }
  });
  map.addLayer({
    id: 'park-area-label',
    type: 'symbol',
    source: 'park-area-label',
    minzoom: 13,
    layout: {
      'text-field': ['get', 'title'],
      'text-font': ['DIN Pro Bold', 'Arial Unicode MS Regular'],
      'text-size': 22,
      'text-letter-spacing': 0.18,
      'text-max-width': 20,
      'text-rotate': -45,
      'text-rotation-alignment': 'map',
      'text-allow-overlap': true,
      'text-ignore-placement': true
    },
    paint: {
      'text-color': '#5a4632',
      'text-opacity': 0,
      'text-halo-color': '#c79a6a',
      'text-halo-width': 0.5
    }
  }, 'points-layer');

  map.addSource('territory-labels', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [-123.89923, 41.43176] },
          properties: { title: 'YUROK ANCESTRAL TERRITORY', kind: 'ancestral' }
        },
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [-123.87246, 41.34641] },
          properties: { title: 'YUROK RESERVATION', kind: 'reservation' }
        }
      ]
    }
  });
  map.addLayer({
    id: 'territory-labels',
    type: 'symbol',
    source: 'territory-labels',
    minzoom: 9,
    maxzoom: 11.5,
    layout: {
      'text-field': ['get', 'title'],
      'text-font': ['DIN Pro Bold', 'Arial Unicode MS Regular'],
      'text-size': ['match', ['get', 'kind'], 'ancestral', 34, 'reservation', 15, 18],
      'text-rotate': ['match', ['get', 'kind'], 'ancestral', -45, 'reservation', 45, 0],
      'text-rotation-alignment': 'map',
      'text-letter-spacing': 0.12,
      'text-max-width': ['match', ['get', 'kind'], 'ancestral', 12, 'reservation', 8, 10],
      'text-allow-overlap': true,
      'text-ignore-placement': true
    },
    paint: {
      'text-color': ['match', ['get', 'kind'],
        'ancestral',   '#a02818',
        'reservation', '#3a5560',
        '#3a2a1a'],
      'text-opacity': ['match', ['get', 'kind'], 'ancestral', 0.5, 'reservation', 0.7, 0.55],
      'text-halo-color': '#e8dcc0',
      'text-halo-width': 0.6
    }
  });

  const hideInit = [
    ['waterway',  'line-opacity', 0],
    ['hillshade', 'fill-opacity', 0],
    ['parkfill',  'fill-opacity', 0]
  ];
  hideInit.forEach(([id, prop]) => {
    if (map.getLayer(id)) map.setPaintProperty(id, prop, 0);
  });
  if (map.getLayer('terrain')) map.setPaintProperty('terrain', 'hillshade-exaggeration', 0);

  const steps = [
    () => {
      if (map.getLayer('terrain'))  map.setPaintProperty('terrain', 'hillshade-exaggeration', 0.5);
      if (map.getLayer('waterway')) map.setPaintProperty('waterway', 'line-opacity', 1);
    },
    () => {
      if (map.getLayer('hillshade')) map.setPaintProperty('hillshade', 'fill-opacity', 0.5);
    },
    () => {
      if (map.getLayer('parkfill'))       map.setPaintProperty('parkfill', 'fill-opacity', 0.5);
      if (map.getLayer('park-area-label')) map.setPaintProperty('park-area-label', 'text-opacity', 0.55);
    }
  ];

  const STEP_GAP = 800;
  steps.forEach((fn, i) => setTimeout(fn, 600 + i * STEP_GAP));
  map.on('click', (e) => {
    console.log(e.lngLat.lng.toFixed(5) + ', ' + e.lngLat.lat.toFixed(5));
  });
});

map.on('click', (e) => {
  const hits = map.queryRenderedFeatures(e.point, { layers: ['points-layer'] });
  if (!hits.length) { if (sidebarOpen) closeSidebar(); return; }

  const f = hits[0];
  const p = f.properties;

  if (p.feature_type === 'water') {
    showPhoto(p);
  } else if (p.rop_renaming_new_name) {
    openSidebar(f, buildCompare(p));
  } else {
    openSidebar(f, buildPlace(p));
  }
});

map.on('mouseenter', 'points-layer', () => (map.getCanvas().style.cursor = 'pointer'));
map.on('mouseleave', 'points-layer', () => (map.getCanvas().style.cursor = ''));
map.on('dragstart', hideHint);
map.on('zoomstart', hideHint);

function openSidebar(feature, html) {
  hideHint();
  const coords = feature.geometry.coordinates.slice();
  const cam = CAMERA[feature.properties.feature_name] || CAMERA_DEFAULT;
  map.flyTo({
    center: coords,
    zoom: cam.zoom,
    pitch: cam.pitch,
    bearing: cam.bearing,
    duration: cam.duration,
    essential: true,
    padding: { right: PANEL_W }
  });
  document.getElementById('sidebar-content').innerHTML = html;
  document.getElementById('sidebar').classList.add('active');
  sidebarOpen = true;
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('active');
  sidebarOpen = false;
  map.flyTo({ ...OVERVIEW, duration: 1400, essential: true, padding: { right: 0 } });
}
document.getElementById('sidebar-close').addEventListener('click', closeSidebar);
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (document.getElementById('lightbox').classList.contains('active')) { closeLightbox(); return; }
  if (document.getElementById('photo-overlay').classList.contains('on')) {
    document.getElementById('photo-overlay').classList.remove('on'); return;
  }
  if (sidebarOpen) closeSidebar();
});

let atTerritory = false;
function showTerritory() {
  map.flyTo({
    center: [-123.94162, 41.36357],
    zoom: 9.3,
    pitch: 0,
    bearing: 0,
    duration: 2800,
    essential: true
  });
  atTerritory = true;
  document.querySelector('.land-ack-cta').textContent = 'Return to the park ↘';
}
function returnToPark() {
  map.flyTo({ ...OVERVIEW, duration: 2400, essential: true });
  atTerritory = false;
  document.querySelector('.land-ack-cta').textContent = 'See the wider territory ↗';
}

document.getElementById('land-ack').addEventListener('click', () => {
  if (atTerritory) returnToPark();
  else showTerritory();
});

function figureHTML(p) {
  if (!p.image_link) return '';
  return `<figure class="site-figure">
    <img src="${p.image_link}" class="zoomable" alt="${p['alt-text'] || ''}"
         onclick="openLightbox('${p.image_link}')" />
    ${p.caption ? `<figcaption class="site-caption">${p.caption}</figcaption>` : ''}
  </figure>`;
}

function buildCompare(p) {
  const img = figureHTML(p);
  return `
    <h2 class="site-name">${p.feature_name || ''}</h2>
    <p class="site-formerly">formerly <s>${p.rop_renaming_former_name || ''}</s></p>
    ${img}
    ${p.description ? `<p class="site-lead">${p.description}</p>` : ''}
    ${p.rop_renaming_meaning ? `<p class="site-desc">${p.rop_renaming_meaning}</p>` : ''}
    <hr class="section-rule" />
    <p class="site-meta">${p.rop_renaming_park_unit || ''}</p>
    <p class="compare-point"><span class="label">Park District</span>${p.rop_renaming_park_district || ''}</p>
    <p class="compare-point"><span class="label">Tribal Partner</span>${p.rop_renaming_tribal_partner || ''}</p>
  `;
}

function buildPlace(p) {
  const meta = p.built ? `<p class="site-meta">reconstructed ${p.built}</p>` : '';
  const img = figureHTML(p);
  return `
    <h2 class="site-name">${p.feature_name || ''}</h2>
    ${meta}
    ${img}
    ${p.description ? `<p class="site-desc">${p.description}</p>` : ''}
  `;
}

function showPhoto(p) {
  hideHint();
  document.getElementById('photo-overlay-img').src = p.image_link || '';
  document.getElementById('photo-overlay-img').alt = p['alt-text'] || '';
  document.getElementById('photo-overlay-caption').textContent = p.caption || '';
  document.getElementById('photo-overlay').classList.add('on');
}
document.getElementById('photo-overlay').addEventListener('click', () => {
  document.getElementById('photo-overlay').classList.remove('on');
});

function openLightbox(src) {
  const lb = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  img.src = src; lb.classList.add('active');
  img.classList.remove('zoomed'); lb.classList.remove('has-zoom');
}
function closeLightbox() {
  const lb = document.getElementById('lightbox');
  lb.classList.remove('active');
  document.getElementById('lightbox-img').classList.remove('zoomed');
  lb.classList.remove('has-zoom');
}
document.addEventListener('DOMContentLoaded', () => {
  const lb = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });
  img.addEventListener('click', (e) => {
    e.stopPropagation();
    img.classList.toggle('zoomed'); lb.classList.toggle('has-zoom');
    if (img.classList.contains('zoomed')) lb.scrollTop = 0;
  });
});

function hideHint() {
  const h = document.getElementById('hint');
  if (h) h.classList.add('hidden');
}

function revealLayers() {
  const steps = [
    () => {
      if (map.getLayer('terrain'))  map.setPaintProperty('terrain', 'hillshade-exaggeration', 0.5);
      if (map.getLayer('waterway')) map.setPaintProperty('waterway', 'line-opacity', 1);
    },
    () => {
      if (map.getLayer('hillshade')) map.setPaintProperty('hillshade', 'fill-opacity', 0.5);
      const s = document.getElementById('salmon-overlay');
      if (s) s.style.opacity = 0.12;
    },
    () => {
      if (map.getLayer('parkfill'))   map.setPaintProperty('parkfill', 'fill-opacity', 0.5);
    }
  ];
  steps.forEach((fn, i) => setTimeout(fn, i * 800));
}
