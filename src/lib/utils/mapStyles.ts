function generateMapStyles() {
	const lightThemeColors = {
		geometry: '#f5f5f5',
		labelsTextFill: '#616161',
		labelsTextStroke: '#f5f5f5',
		landParcelTextFill: '#bdbdbd',
		poiGeometry: '#eeeeee',
		poiTextFill: '#757575',
		parkGeometry: '#e5e5e5',
		parkTextFill: '#9e9e9e',
		roadGeometry: '#ffffff',
		arterialTextFill: '#757575',
		highwayGeometry: '#dadada',
		highwayTextFill: '#616161',
		localTextFill: '#9e9e9e',
		transitLineGeometry: '#e5e5e5',
		transitStationGeometry: '#eeeeee',
		waterGeometry: '#c9c9c9',
		waterTextFill: '#9e9e9e',
		buildingColor: '#E0E0E0',
		terrainColor: '#E0E0E0'
	};

	// Apply theme colors to map styles
	const mapStyles = [
		{ elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
		{ elementType: 'labels.text.fill', stylers: [{ color: lightThemeColors.labelsTextFill }] },
		{ elementType: 'labels.text.stroke', stylers: [{ color: lightThemeColors.labelsTextStroke }] },

		{
			featureType: 'poi.business',
			elementType: 'all',
			stylers: [{ visibility: 'on' }] // Adjust as needed to control visibility
		},
		{
			featureType: 'administrative.land_parcel',
			elementType: 'labels.text.fill',
			stylers: [{ color: lightThemeColors.landParcelTextFill }]
		},
		{
			featureType: 'poi',
			elementType: 'all',
			stylers: [{ visibility: 'off' }]
		},
		{
			featureType: 'road',
			elementType: 'geometry',
			stylers: [{ color: lightThemeColors.roadGeometry }]
		},
		{
			featureType: 'road.arterial',
			elementType: 'labels.text.fill',
			stylers: [{ color: lightThemeColors.arterialTextFill }]
		},
		{
			featureType: 'road.highway',
			elementType: 'geometry',
			stylers: [{ color: lightThemeColors.highwayGeometry }]
		},
		{
			featureType: 'road.highway',
			elementType: 'labels.text.fill',
			stylers: [{ color: lightThemeColors.highwayTextFill }]
		},
		{
			featureType: 'road.local',
			elementType: 'labels.text.fill',
			stylers: [{ color: lightThemeColors.localTextFill }]
		},
		{
			featureType: 'transit.line',
			elementType: 'geometry',
			stylers: [{ color: lightThemeColors.transitLineGeometry }]
		},
		{
			featureType: 'transit.station',
			elementType: 'geometry',
			stylers: [{ color: lightThemeColors.transitStationGeometry }]
		},
		{
			featureType: 'water',
			elementType: 'geometry',
			stylers: [{ color: lightThemeColors.waterGeometry }]
		},
		{
			featureType: 'water',
			elementType: 'labels.text.fill',
			stylers: [{ color: lightThemeColors.waterTextFill }]
		}
	];

	return mapStyles;
}

export { generateMapStyles };
