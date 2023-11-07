import React, { useEffect, useState, useRef } from "react";
import { View, Text, PermissionsAndroid, StyleSheet, Image, AppState, NativeModules, Alert } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import GetLocation from "react-native-get-location";
import markerIcon from "./assets/icons/marker.png";
const { BatterySaverModule } = NativeModules;

const App = () => {
  const [isMapPermission, setIsMapPermission] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [coordinates, setCoordinates] = useState([]);
  const [isPowerSaveMode, setIsPowerSaver] = useState(false)
  const mapRef = useRef(null);

  const fitToPolyline = () => {
    if (mapRef.current && coordinates.length > 0) {
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: {
          top: 50, // Adjust the padding as needed
          right: 50,
          bottom: 50,
          left: 50,
        },
        animated: true,
      });
    }
  };

  const watchLocation = () => {

    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 60000,
    })
      .then(location => {
        if (location) {
          console.log({ location })
          setUserLocation({ latitude: location?.latitude, longitude: location?.longitude });
          setCoordinates([...coordinates, { latitude: location?.latitude, longitude: location?.longitude }])

        }
      })
      .catch(error => {
        const { code, message } = error;
        if(code === "UNAVAILABLE"){
         Alert.alert("Location is not available. Please turn on the location.")
        }
        console.log({code, message })
        console.warn(code, message);
      })

  };

  const requestPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location to show your current location on the map.',
          buttonPositive: 'OK',
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        setIsMapPermission(true);
        watchLocation();
        console.log('Location permission granted');
      } else {
        setIsMapPermission(false);
        console.log('Location permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  }

  useEffect(() => {
    //init map
    requestPermission();
  }, [])

  const checkPowerSaverOnOff = () => {
    BatterySaverModule.isPowerSaveMode().then((res) => {
      // console.log({ res })
      setIsPowerSaver(res);
    })
  }
  const handleBackgroundToForeground = (nextAppState) => {
    if(nextAppState === "active"){
    checkPowerSaverOnOff();

      //check retry if location enabled and app in Backaground.
      if(!userLocation){
      requestPermission();
      }
    }
  
  }

  useEffect(() => {
    //check battery saver status
    AppState.addEventListener('change', handleBackgroundToForeground);
    checkPowerSaverOnOff();
  }, []);

  useEffect(() => {
    //init
    if (isMapPermission) {
      const watcher = setInterval(() => {
        watchLocation();
      }, 60000); //10 min
      return () => {
        if (watcher) {
          clearInterval(watcher);
        }
      }
    }
  }, [coordinates])


  //for keep map pan center
  useEffect(() => {
    if (coordinates && userLocation) {
      const minMax = setInterval(() => {
        fitToPolyline();
      }, 10000)

      return () => {
        if (minMax) {
          clearInterval(minMax)
        }
      }
    }

  }, []);


  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: '#03A9F4', padding: 25, justifyContent: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ color: '#000', fontWeight: '600', fontSize: 18 }}> Power Saving Status: </Text>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fff' }}>{isPowerSaveMode ? 'ON' : 'OFF'}</Text>
        </View>
      </View>
      <View style={{ flex: 9, backgroundColor: '#ccc' }}>

        {userLocation &&
          <MapView
            ref={mapRef}
            style={styles.map}
            minZoomLevel={18}
            initialRegion={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            <Marker
              anchor={{ x: 0.5, y: 0.5 }}
              coordinate={userLocation}>
              <Image
                style={{
                  tintColor: "green",
                  width: 32,
                  height: 32,
                }}
                source={markerIcon}
              />
            </Marker>
            <Polyline coordinates={coordinates} strokeColor="red" strokeWidth={4} />
          </MapView>
        }

      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    alignContent: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default App;

