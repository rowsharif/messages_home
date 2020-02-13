import * as WebBrowser from "expo-web-browser";
import React, { useState, useEffect } from "react";
import MapView from "react-native-maps";
import {
  Image,
  Platform,
  TextInput,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions
} from "react-native";

import { MonoText } from "../components/StyledText";
import firebase from "firebase/app";
import "firebase/auth";
import db from "../db.js";
import * as Location from "expo-location";
import * as Permissions from "expo-permissions";

export default function FindMyFriends() {
  const [users, setUsers] = useState([]);
  const [location, setLocation] = useState({
    coords: {
      latitude: 25.340009,
      longitude: 51.430205
    }
  });
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  const askPermission = async () => {
    const { status } = await Permissions.askAsync(Permissions.LOCATION);
    setHasLocationPermission(status === "granted");
  };

  const getLocation = async () => {
    const location = await Location.getCurrentPositionAsync({});
    setLocation(location);
    const snap = await db
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get();
    console.log("ge------------t", snap);
    const displayName = snap.data().displayName ? snap.data().displayName : " ";
    const photoURL = snap.data().photoURL ? snap.data().photoURL : " ";
    const friends  = snap.data().friends ? snap.data().friends : " ";
    const blockedList = snap.data().blockedList ? snap.data().blockedList : " ";
    const publicUser = snap.data().publicUser ? snap.data().publicUser : " ";
    const online = snap.data().online ? snap.data().online : " ";

    console.log(" Current location: ", location);
    await db
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .set({
        displayName,
        photoURL,
        location,
        friends,
        blockedList,
        publicUser,
        online
      });
  };

  useEffect(() => {
    askPermission();
    getLocation();
    console.log("-------------------", location);
  }, [location]);

  useEffect(() => {
    db.collection("users").onSnapshot(querySnapshot => {
      const users = [];
      querySnapshot.forEach(doc => {
        users.push({ id: doc.id, ...doc.data() });
      });
      console.log(" Current users: ", users);
      setUsers([...users]);
    });
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.mapStyle}
        initialRegion={{
          latitude: 25.3548,
          longitude: 51.1839,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02
        }}
      >
        {users &&
          users.map(user => (
            <MapView.Marker
              key={user.id}
              coordinate={{
                latitude: user.location.coords.latitude,
                longitude: user.location.coords.longitude
              }}
              title={user.displayName}
              description={user.displayName}
            />
          ))}
      </MapView>
    </View>
  );
}

FindMyFriends.navigationOptions = {
  header: null
};

function DevelopmentModeNotice() {
  if (__DEV__) {
    const learnMoreButton = (
      <Text onPress={handleLearnMorePress} style={styles.helpLinkText}>
        Learn more
      </Text>
    );

    return (
      <Text style={styles.developmentModeText}>
        Development mode is enabled: your app will be slower but you can use
        useful development tools. {learnMoreButton}
      </Text>
    );
  } else {
    return (
      <Text style={styles.developmentModeText}>
        You are not in development mode: your app will run at full speed.
      </Text>
    );
  }
}

function handleLearnMorePress() {
  WebBrowser.openBrowserAsync(
    "https://docs.expo.io/versions/latest/workflow/development-mode/"
  );
}

function handleHelpPress() {
  WebBrowser.openBrowserAsync(
    "https://docs.expo.io/versions/latest/workflow/up-and-running/#cant-see-your-changes"
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  },
  mapStyle: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height
  },
  developmentModeText: {
    marginBottom: 20,
    color: "rgba(0,0,0,0.4)",
    fontSize: 14,
    lineHeight: 19,
    textAlign: "center"
  },
  contentContainer: {
    paddingTop: 30
  },
  welcomeContainer: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: "contain",
    marginTop: 3,
    marginLeft: -10
  },
  getStartedContainer: {
    alignItems: "center",
    marginHorizontal: 50
  },
  homeScreenFilename: {
    marginVertical: 7
  },
  codeHighlightText: {
    color: "rgba(96,100,109, 0.8)"
  },
  codeHighlightContainer: {
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 3,
    paddingHorizontal: 4
  },
  getStartedText: {
    fontSize: 24,
    color: "rgba(96,100,109, 1)",
    lineHeight: 24,
    textAlign: "center"
  },
  tabBarInfoContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: "black",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3
      },
      android: {
        elevation: 20
      }
    }),
    alignItems: "center",
    backgroundColor: "#fbfbfb",
    paddingVertical: 20
  },
  tabBarInfoText: {
    fontSize: 17,
    color: "rgba(96,100,109, 1)",
    textAlign: "center"
  },
  navigationFilename: {
    marginTop: 5
  },
  helpContainer: {
    marginTop: 15,
    alignItems: "center"
  },
  helpLink: {
    paddingVertical: 15
  },
  helpLinkText: {
    fontSize: 14,
    color: "#2e78b7"
  }
});
