import React, { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { categoryColors, colors } from '../theme/tiptripTheme';

/**
 * Lightweight map marker for TipTrip.
 * Keep its visual tree static while the map is panning. If marker appearance
 * changes dynamically later, briefly enable tracksViewChanges and turn it off
 * after the image/font has rendered rather than leaving it enabled.
 */
function TipMarker({ pin, selected = false, onPress }) {
  const coordinate = useMemo(() => {
    if (pin?.coordinate &&
        Number.isFinite(pin.coordinate.latitude) &&
        Number.isFinite(pin.coordinate.longitude)) {
      return pin.coordinate;
    }

    const latitude = Number(pin?.latitude ?? pin?.lat);
    const longitude = Number(pin?.longitude ?? pin?.lng ?? pin?.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
    return { latitude, longitude };
  }, [pin?.coordinate, pin?.latitude, pin?.lat, pin?.longitude, pin?.lng]);

  const category = String(pin?.category || 'general').toLowerCase();
  const markerColor = categoryColors[category] || categoryColors.general;
  const label = typeof pin?.title === 'string' ? pin.title : '';

  if (!coordinate) return null;

  return (
    <Marker
      coordinate={coordinate}
      onPress={() => onPress?.(pin)}
      tracksViewChanges={false}
      accessibilityLabel={label ? `Travel tip: ${label}` : 'Travel tip'}
      identifier={pin?.id == null ? undefined : String(pin.id)}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      <View style={[styles.marker, { backgroundColor: markerColor }, selected && styles.selected]}>
        <View style={styles.inner}>
          <Text style={styles.glyph}>{selected ? '✓' : '•'}</Text>
        </View>
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  marker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#102A2A',
    shadowOpacity: 0.22,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  selected: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
  },
  inner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: {
    color: colors.tealDark,
    fontSize: 9,
    lineHeight: 10,
    fontWeight: '900',
  },
});

export default memo(TipMarker, (prev, next) =>
  prev.pin?.id === next.pin?.id &&
  prev.pin?.latitude === next.pin?.latitude &&
  prev.pin?.longitude === next.pin?.longitude &&
  prev.pin?.lat === next.pin?.lat &&
  prev.pin?.lng === next.pin?.lng &&
  prev.pin?.coordinate?.latitude === next.pin?.coordinate?.latitude &&
  prev.pin?.coordinate?.longitude === next.pin?.coordinate?.longitude &&
  prev.pin?.title === next.pin?.title &&
  prev.pin?.category === next.pin?.category &&
  prev.selected === next.selected &&
  prev.onPress === next.onPress
);
