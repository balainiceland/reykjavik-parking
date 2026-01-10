# Reykjavik Parking - WordPress Plugin

Interactive parking map for downtown Reykjavik showing garages, zones, and rates.

## Installation

1. Log into your WordPress admin panel at `startupiceland.com/wp-admin`
2. Go to **Plugins > Add New > Upload Plugin**
3. Upload the `reykjavik-parking.zip` file
4. Click **Install Now**, then **Activate**

## Usage

Add the shortcode to any page or post:

```
[reykjavik_parking]
```

### Shortcode Options

| Attribute | Default | Description |
|-----------|---------|-------------|
| height | 600px | Map height |
| show_stats | true | Show statistics panel |
| show_legend | true | Show legend panel |
| show_tips | true | Show parking tips |

### Examples

Full map with all panels:
```
[reykjavik_parking]
```

Taller map without tips:
```
[reykjavik_parking height="800px" show_tips="false"]
```

Map only (no sidebar panels):
```
[reykjavik_parking show_stats="false" show_legend="false" show_tips="false"]
```

## Features

- Interactive Leaflet map centered on downtown Reykjavik
- 7 parking locations (6 garages + 1 lot)
- 3 parking zones (P1, P2, P3) with color-coded overlays
- Click markers for detailed information
- Responsive design for mobile devices
- 2026 parking statistics from Reykjavik Open Data

## Updating Parking Data

Edit the file `js/parking-data.js` to update:
- Parking garage locations and details
- Zone boundaries
- Rates and hours

## Support

For issues or questions, contact the Startup Iceland team.

## Data Sources

- [Reykjavik Open Data Portal (Gagnagatt)](https://gagnagatt.reykjavik.is)
- [Reykjavik Parking Service](https://reykjavik.is/en/parking)
