"use client";

// IMPORTANT: the order matters!
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css";
import "leaflet-defaulticon-compatibility";
import "leaflet.locatecontrol/dist/L.Control.Locate.min.css";
import "leaflet.locatecontrol";
import "leaflet.fullscreen/Control.FullScreen.css";
import "leaflet.fullscreen";
import { institutions } from "@/app/data/institutions";
import { CategoryColor, type Institution } from "@/app/types/institutions";
import L from "leaflet";

import { slugify } from "@/lib/utils";
import { Icon, type LatLngExpression } from "leaflet";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
	MapContainer,
	Marker,
	TileLayer,
	Tooltip,
	useMap,
} from "react-leaflet";

type MarkerColor =
	| "blue"
	| "gold"
	| "red"
	| "green"
	| "orange"
	| "yellow"
	| "violet"
	| "grey"
	| "black";

export type MapMarker = {
	name: string;
	coords: [number, number];
	color?: MarkerColor;
};

type MapLocationProps = {
	center?: LatLngExpression;
	zoom?: number;
	marker?: MapMarker;
};

// Full semenanjung view coords: 3.8300, 101.4046, zoom: 7
const DEFAULT_CENTER: LatLngExpression = [3.1685, 101.6512];
const DEFAULT_ZOOM = 7;

function AddControls() {
	const map = useMap();
	const controlsAddedRef = useRef(false);

	useEffect(() => {
		if (controlsAddedRef.current) return;

		// Add locate control (https://github.com/domoritz/leaflet-locatecontrol)
		L.control
			.locate({
				position: "topright",
				strings: { title: "Tunjukkan lokasi" },
				locateOptions: { enableHighAccuracy: true },
			})
			.addTo(map);

		// Add fullscreen control (https://github.com/brunob/leaflet.fullscreen)
		L.control
			.fullscreen({
				position: "topright",
				title: "Skrin penuh",
				titleCancel: "Keluar skrin penuh",
				forceSeparateButton: true,
			})
			.addTo(map);

		controlsAddedRef.current = true;
	}, [map]);

	return null;
}

const getMarkerIcon = (color?: MarkerColor) =>
	new Icon({
		iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
		shadowUrl:
			"https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
		iconSize: [25, 41],
		iconAnchor: [12, 41],
		tooltipAnchor: [1, -34],
		shadowSize: [41, 41],
	});

export default function MapLocation({
	center = DEFAULT_CENTER,
	zoom = DEFAULT_ZOOM,
}: MapLocationProps) {
	const router = useRouter();

	const markerClickHandler = useCallback(
		(institution: Institution) => {
			router.push(`/${institution.category}/${slugify(institution.name)}`);
		},
		[router],
	);

	const renderMarkers = useMemo(() => {
		return institutions.map((institution, idx) => {
			if (!institution.coords) return null;

			return (
				<Marker
					key={idx}
					position={institution.coords as LatLngExpression}
					icon={getMarkerIcon(CategoryColor[institution.category])}
					eventHandlers={{ click: () => markerClickHandler(institution) }}
				>
					<Tooltip>{institution.name}</Tooltip>
				</Marker>
			);
		});
	}, [markerClickHandler]);

	return (
		<MapContainer
			center={center}
			zoom={zoom}
			scrollWheelZoom={true}
			className="w-full h-auto z-0 min-h-[240px] min-w-full rounded-md overflow-clip"
		>
			<TileLayer
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>
			{renderMarkers}
			<AddControls />
		</MapContainer>
	);
}
